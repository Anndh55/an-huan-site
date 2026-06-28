import crypto from "crypto"
export const dynamic = "force-dynamic"
export async function GET() {
  const r: Record<string,string> = {}
  const AK = process.env.QINIU_ACCESS_KEY || "", SK = process.env.QINIU_SECRET_KEY || "", bucket = process.env.QINIU_BUCKET || ""
  const key = "photos/diag-" + Date.now() + ".txt"

  const policy = JSON.stringify({scope:bucket+":"+key, deadline:Math.floor(Date.now()/1000)+3600})
  const us = (d:string|Buffer)=>{const b=typeof d==="string"?Buffer.from(d,"utf-8"):d;return b.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}
  const ep = us(policy)
  const sign = crypto.createHmac("sha1", SK).update(ep).digest()
  const token = AK + ":" + us(sign) + ":" + ep

  r["POLICY"] = policy
  r["ENCODED_POLICY"] = ep
  r["ENCODED_SIGN"] = us(sign)
  r["TOKEN_PREVIEW"] = token.substring(0,80) + "..."
  r["TOKEN_LEN"] = String(token.length)

  // Test upload
  try {
    const fd = new FormData(); fd.append("token",token); fd.append("key",key); fd.append("file",new File([Buffer.from("t")],"t.txt"))
    const resp = await fetch("https://upload-z2.qiniup.com/",{method:"POST",body:fd})
    r["UPLOAD_STATUS"] = String(resp.status); r["UPLOAD_MSG"] = (await resp.text()).slice(0,100)
  } catch(e:any) { r["UPLOAD_ERROR"] = e.message?.slice(0,200) }

  return Response.json(r)
}
