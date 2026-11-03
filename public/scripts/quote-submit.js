(()=>{
 const $=id=>document.getElementById(id);
 const configs={
  hat:{form:'studioForm',status:'quoteStatus',button:'Prepare quote email →',canvas:'hatCanvas',name:'customerName',email:'customerEmail',phone:'customerPhone',quantity:'quantity',notes:'notes',art:['artwork'],details:()=>({hatStyle:$('hatStyle').selectedOptions[0].textContent,hatColor:$('hatColor').selectedOptions[0].textContent,patchShape:$('patchShape').value,patchColor:$('patchColor').selectedOptions[0].textContent,patchText:$('patchText').value,patchSize:$('patchSize').value,patchRotation:$('patchRotate').value})},
  tshirt:{form:'shirtForm',status:'shirtQuoteStatus',canvas:'shirtCanvas',name:'shirtName',email:'shirtEmail',phone:'shirtPhone',quantity:'shirtQuantity',notes:'shirtNotes',art:['shirtArtwork'],details:()=>({shirtType:$('shirtType').selectedOptions[0].textContent,shirtColor:$('shirtColor').selectedOptions[0].textContent,printMethod:$('printMethod').value,sizeBreakdown:$('shirtSizes').value,frontAndBack:'Both preview images supplied; verify artwork placement in the mockups.'})},
  creative:{form:'creativeForm',status:'creativeStatus',canvas:'creativeCanvas',name:'creativeName',email:'creativeEmail',phone:'creativePhone',quantity:'creativeQuantity',notes:'creativeNotes',art:['creativeArt'],details:()=>({category:$('creativeCategory').value,product:$('creativeProduct').selectedOptions[0].textContent,finish:$('creativeFinish').selectedOptions[0].textContent,personalization:$('creativeText').value,font:$('creativeFont').value,size:$('creativeScale').value,rotation:$('creativeRotate').value,supplierSku:'To be confirmed by TekNeek'})}
 };
 const studio=Object.keys(configs).find(k=>$(configs[k].form));
 if(!studio)return;
 const cfg=configs[studio],form=$(cfg.form),status=$(cfg.status),submit=form.querySelector('button[type=submit]');
 let pending=false;
 const toBlob=canvas=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not generate mockup.')),'image/png'));
 const snapshot=async()=>{
  if(studio!=='tshirt')return [{name:studio+'-mockup.png',blob:await toBlob($(cfg.canvas))}];
  const original=document.querySelector('.shirt-side.active')?.dataset.side||'front';
  const images=[];
  for(const side of ['front','back']){
   if(side!==original)document.querySelector('.shirt-side[data-side="'+side+'"]').click();
   images.push({name:'tshirt-'+side+'.png',blob:await toBlob($(cfg.canvas))});
  }
  if(original!==document.querySelector('.shirt-side.active')?.dataset.side)document.querySelector('.shirt-side[data-side="'+original+'"]').click();
  return images;
 };
 form.addEventListener('submit',async e=>{
  e.preventDefault();e.stopImmediatePropagation();
  if(pending||!form.reportValidity())return;
  pending=true;submit.disabled=true;submit.textContent='Sending quote request…';
  status.textContent='Saving your design and sending your quote request securely…';
  try{
   const payload=new FormData();
   payload.set('studio',studio);
   for(const key of ['name','email','phone','quantity','notes'])payload.set(key,$(cfg[key]).value);
   payload.set('details',JSON.stringify(cfg.details()));
   payload.set('website','');
   const mockups=await snapshot();
   for(const item of mockups)payload.append('files',item.blob,item.name);
   for(const id of cfg.art){
    const file=$(id).files[0];
    if(file){
     if(file.type==='image/svg+xml'){status.textContent='SVG originals cannot be uploaded securely yet. Your preview can still be sent; TekNeek can request the SVG later.';continue;}
     payload.append('files',file,file.name);
    }
   }
   const response=await fetch('/api/quote',{method:'POST',body:payload,headers:{Accept:'application/json'}});
   const result=await response.json();
   if(!response.ok||!result.ok)throw new Error(result.error||'Submission failed. Please try again.');
   status.textContent='Quote request received! Reference: '+result.reference+'. TekNeek will review the final design, availability, and price before approving any order.';
   submit.textContent='Quote request sent';
  }catch(error){
   status.textContent=error.message+' Your design is still here; you can retry.';
   submit.disabled=false;submit.textContent='Request my quote →';
  }finally{pending=false;}
 },true);
 submit.textContent='Request my quote →';
 status.textContent='Submit your design and mockup securely. TekNeek will review the final design and price; no order is placed automatically.';
})();
