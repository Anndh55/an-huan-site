import crypto from "crypto"

/**
 * Get a required Qiniu config value from env.
 * Validated lazily (at call time, not module import time)
 * so the build doesn't fail when env vars are absent.
 */
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      "Missing required Qiniu environment variable: " + name
    )
  }
  return value
}

/**
 * Lazy config accessors — not evaluated at module import time.
 */
function getAccessKey(): string {
  return requireEnv("QINIU_ACCESS_KEY")
}
function getSecretKey(): string {
  return requireEnv("QINIU_SECRET_KEY")
}
function getBucket(): string {
  return requireEnv("QINIU_BUCKET")
}

/**
 * URL-safe Base64 encoding (no padding, + -> -, / -> _)
 */
function urlsafeBase64Encode(data: string | Buffer): string {
  const buf = typeof data === "string" ? Buffer.from(data, "utf-8") : data
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

/**
 * Generate a Qiniu upload token (uptoken).
 * Implements PutPolicy -> base64 -> HMAC-SHA1 -> signature.
 */
function generateUploadToken(key: string): string {
  const putPolicy = JSON.stringify({
    scope: getBucket() + ":" + key,
    deadline: Math.floor(Date.now() / 1000) + 3600,
  })

  const encodedPutPolicy = urlsafeBase64Encode(putPolicy)

  const sign = crypto
    .createHmac("sha1", getSecretKey())
    .update(encodedPutPolicy)
    .digest()

  const encodedSign = urlsafeBase64Encode(sign)

  return getAccessKey() + ":" + encodedSign + ":" + encodedPutPolicy
}

/**
 * Upload a file buffer to Qiniu Cloud using native fetch + FormData.
 * No external SDK dependencies.
 */
export async function uploadToQiniu(
  buffer: Buffer,
  key: string
): Promise<string> {
  const token = generateUploadToken(key)

  // Convert Buffer to File for FormData (TS compat cast)
  const file = new File([buffer as unknown as Blob], key)
  const formData = new FormData()
  formData.append("token", token)
  formData.append("key", key)
  formData.append("file", file)

  const response = await fetch("https://upload.qiniup.com/", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      "Qiniu upload failed (" + response.status + "): " + errorText
    )
  }

  const result = (await response.json()) as { key?: string; hash?: string }
  const baseUrl =
    process.env.QINIU_DOMAIN || "https://" + getBucket() + ".qnssl.com"
  return baseUrl + "/" + (result.key || key)
}
