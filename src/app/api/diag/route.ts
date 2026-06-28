import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function GET() {
  const r: Record<string,string> = {}
  for (const k of ["QINIU_ACCESS_KEY","QINIU_SECRET_KEY","QINIU_BUCKET","QINIU_ZONE","QINIU_DOMAIN"]) {
    const v = process.env[k] || ""
    r[k+"_LEN"] = String(v.length)
    r[k+"_EXISTS"] = v.length > 0 ? "YES" : "NO"
  }
  try {
    const AK = process.env.QINIU_ACCESS_KEY || "", SK = process.env.QINIU_SECRET_KEY || "", bucket = process.env.QINIU_BUCKET || ""
    if (AK&&SK&&bucket) {
      const key = "photos/diag.txt", policy = JSON.stringify({scope:bucket+":"+key,deadline:Math.floor(Date.now()/1000)+3600})
      const us = (d:string|Buffer)=>{const b=typeof d==="string"?Buffer.from(d,"utf-8"):d;return b.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}
      const ep = us(policy), sign = crypto.createHmac("sha1",SK).update(ep).digest(), token = AK+":"+us(sign)+":"+ep
      r["TOKEN_OK"] = "YES"
      const fd = new FormData(); fd.append("token",token); fd.append("key",key); fd.append("file",new File([Buffer.from("t")],"t.txt"))
      const resp = await fetch("https://upload-z2.qiniup.com/",{method:"POST",body:fd}); const txt = await resp.text()
      r["UPLOAD_STATUS"] = String(resp.status); r["UPLOAD_MSG"] = txt.slice(0,100)
    } else { r["MISSING"] = "some vars not found" }
  } catch(e:any) { r["ERROR"] = e.message?.slice(0,200) || String(e) }
  return Response.json(r)
}
