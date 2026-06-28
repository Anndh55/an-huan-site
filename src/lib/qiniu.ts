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

export async function uploadToQiniu(buffer: Buffer, key: string): Promise<string> {
  const token = generateUploadToken(key)
  const file = new File([buffer as unknown as Blob], key)
  const formData = new FormData()
  formData.append("token", token)
  formData.append("key", key)
  formData.append("file", file)

  const response = await fetch(QINIU_UPLOAD_URL, { method: "POST", body: formData })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error("Qiniu upload failed (" + response.status + "): " + errorText)
  }

  const result = (await response.json()) as { key?: string; hash?: string }
  const baseUrl = process.env.QINIU_DOMAIN || "https://" + getBucket() + ".qnssl.com"
  return baseUrl + "/" + (result.key || key)
}
