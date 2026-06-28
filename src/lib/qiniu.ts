import crypto from "crypto"

function requireEnv(name: string): string {
  const value = (process.env[name] || "").trim()
  if (!value) {
    throw new Error("Missing required Qiniu environment variable: " + name)
  }
  return value
}

function getAccessKey(): string { return requireEnv("QINIU_ACCESS_KEY") }
function getSecretKey(): string { return requireEnv("QINIU_SECRET_KEY") }
function getBucket(): string { return requireEnv("QINIU_BUCKET") }

function urlsafeBase64Encode(data: string | Buffer): string {
  const buf = typeof data === "string" ? Buffer.from(data, "utf-8") : data
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function generateUploadToken(key: string): string {
  const putPolicy = JSON.stringify({
    scope: getBucket() + ":" + key,
    deadline: Math.floor(Date.now() / 1000) + 3600,
  })
  const encodedPutPolicy = urlsafeBase64Encode(putPolicy)
  const sign = crypto.createHmac("sha1", getSecretKey()).update(encodedPutPolicy).digest()
  const encodedSign = urlsafeBase64Encode(sign)
  return getAccessKey() + ":" + encodedSign + ":" + encodedPutPolicy
}

const QINIU_UPLOAD_URL = "https://upload-z2.qiniup.com/"

// Build multipart/form-data body manually to avoid Vercel runtime polyfill issues
function buildMultipartBody(token: string, key: string, buffer: Buffer, boundary: string): Buffer {
  const header = (
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="token"\r\n\r\n' +
    token + '\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="key"\r\n\r\n' +
    key + '\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="file"; filename="' + key.replace(/^.*\//, '') + '"\r\n' +
    'Content-Type: application/octet-stream\r\n\r\n'
  )
  const footer = '\r\n--' + boundary + '--\r\n'
  return Buffer.concat([Buffer.from(header, 'utf-8'), buffer, Buffer.from(footer, 'utf-8')])
}

export async function uploadToQiniu(buffer: Buffer, key: string): Promise<string> {
  const token = generateUploadToken(key)
  const boundary = '----qiniu' + Date.now().toString(36)
  const body = buildMultipartBody(token, key, buffer, boundary)

  const response = await fetch(QINIU_UPLOAD_URL, {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data; boundary=" + boundary },
    body,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error("Qiniu upload failed (" + response.status + "): " + errorText)
  }

  const result = (await response.json()) as { key?: string; hash?: string }
  const baseUrl = process.env.QINIU_DOMAIN || "https://" + getBucket() + ".qnssl.com"
  return baseUrl + "/" + (result.key || key)
}
