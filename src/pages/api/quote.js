export const prerender = false;

const TYPES = new Map([['image/png','png'],['image/jpeg','jpg'],['image/webp','webp'],['application/pdf','pdf']]);
const MAX_FILE = 8 * 1024 * 1024;
const MAX_TOTAL = 22 * 1024 * 1024;
const json = (data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const safe = (v,n=500)=>String(v??'').trim().slice(0,n);
const escapeHtml = v=>safe(v,3000).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function signatureOk(bytes,type){
  if(type==='image/png')return bytes.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n);
  if(type==='image/jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  if(type==='image/webp')return String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
  if(type==='application/pdf')return String.fromCharCode(...bytes.slice(0,5))==='%PDF-';
  return false;
}
export async function POST({request,locals}){
  const origin=request.headers.get('Origin');
  if(origin && origin!==new URL(request.url).origin)return json({error:'Invalid request origin.'},403);
  const length=Number(request.headers.get('content-length')||0);
  if(length>MAX_TOTAL)return json({error:'Request is too large.'},413);
  const env=locals.runtime?.env;
  if(!env?.QUOTE_FILES||!env?.RESEND_API_KEY||!env?.TURNSTILE_SECRET_KEY)return json({error:'Quote service is not yet configured.'},503);
  let form;
  try{form=await request.formData();}catch{return json({error:'Invalid form submission.'},400);}
  if(safe(form.get('website')))return json({error:'Invalid submission.'},400);
  const token=safe(form.get('cf-turnstile-response'),2048);
  if(!token)return json({error:'Please complete the security verification.'},400);
  let verified=false;
  try{
    const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:token,remoteip:request.headers.get('CF-Connecting-IP')||''})
    });
    if(verify.ok){const outcome=await verify.json();verified=outcome.success===true&&(!outcome.hostname||['tekneekservices.com','www.tekneekservices.com','tekneek-services.office-ba5.workers.dev'].includes(outcome.hostname));}
  }catch(error){console.error('Turnstile verification unavailable',error);}
  if(!verified)return json({error:'Security verification failed or expired. Please retry.'},403);
  const studio=safe(form.get('studio'),30);
  if(!['hat','tshirt','creative'].includes(studio))return json({error:'Unknown studio.'},400);
  const name=safe(form.get('name'),120),email=safe(form.get('email'),254),phone=safe(form.get('phone'),80),quantity=safe(form.get('quantity'),30);
  const notes=safe(form.get('notes'),800),details=safe(form.get('details'),4000);
  if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^\d+$/.test(quantity)||Number(quantity)<1||Number(quantity)>10000||!details)return json({error:'Please check your contact information, quantity, and design.'},400);
  const uploads=form.getAll('files');
  if(uploads.length>4)return json({error:'Up to four attachments are supported.'},400);
  let total=0;const checked=[];
  for(const file of uploads){
    if(!(file instanceof File)||!file.size)continue;
    total+=file.size;
    const type=file.type.toLowerCase();
    if(!TYPES.has(type)||file.size>MAX_FILE||total>MAX_TOTAL)return json({error:'Use PNG, JPG, WebP, or PDF files up to 8 MB each (22 MB total). SVG originals can be provided after TekNeek contacts you.'},400);
    const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());
    if(!signatureOk(bytes,type))return json({error:'An attachment has an invalid file format.'},400);
    checked.push({file,type,ext:TYPES.get(type)});
  }
  const id=crypto.randomUUID(),prefix='quotes/'+new Date().toISOString().slice(0,10)+'/'+id;
  const metadata={id,studio,name,email,phone,quantity,notes,details,createdAt:new Date().toISOString(),attachments:checked.map((f,i)=>({key:prefix+'/attachment-'+(i+1)+'.'+f.ext,name:safe(f.file.name,150),type:f.type,size:f.file.size}))};
  try{
    for(let i=0;i<checked.length;i++){
      const f=checked[i];
      await env.QUOTE_FILES.put(metadata.attachments[i].key,f.file.stream(),{httpMetadata:{contentType:f.type},customMetadata:{quoteId:id}});
    }
    await env.QUOTE_FILES.put(prefix+'/request.json',JSON.stringify(metadata),{httpMetadata:{contentType:'application/json'}});
  }catch{ return json({error:'Could not securely save the quote. Please try again.'},503);}
  const titles={hat:'Hat Studio',tshirt:'T-Shirt Studio',creative:'Creative Studio'};
  const body=['Quote reference: '+id,'Studio: '+titles[studio],'Name: '+name,'Email: '+email,'Phone: '+phone,'Quantity: '+quantity,'Notes: '+notes,'','Design details:',details,'','Private R2 location: '+prefix,'Attachments: '+(metadata.attachments.map(a=>a.name+' ('+a.key+')').join('; ')||'None'),'','Review design, availability and price before approving production.'].join('\n');
  try{
    const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:'TekNeek Quotes <quotes@tekneekservices.com>',to:['office@tekneekservices.com'],reply_to:email,subject:'New TekNeek '+titles[studio]+' Quote · '+id.slice(0,8),text:body,html:'<pre style="font-family:system-ui;white-space:pre-wrap">'+escapeHtml(body)+'</pre>'})});
    if(!res.ok){console.error('Quote notification failed',id,res.status);return json({error:'Your design was saved, but the notification could not be confirmed. Please contact TekNeek with reference '+id,reference:id},503);}
  }catch{console.error('Quote notification error',id);return json({error:'Your design was saved, but the notification could not be confirmed. Please contact TekNeek with reference '+id,reference:id},503);}
  return json({ok:true,reference:id});
}
