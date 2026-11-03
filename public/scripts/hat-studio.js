(() => {
 const $=id=>document.getElementById(id),canvas=$('hatCanvas'),ctx=canvas.getContext('2d');
 const fields=['hatStyle','hatColor','patchShape','patchColor','patchText','patchSize','patchRotate'];
 let artwork=null,position={x:450,y:350},dragging=false;
 const color=id=>$(id).value;
 function path(shape,w,h){
   ctx.beginPath();
   if(shape==='oval'){ctx.ellipse(0,0,w/2,h/2,0,0,Math.PI*2);}
   else if(shape==='circle'){ctx.arc(0,0,Math.min(w,h)/2,0,Math.PI*2);}
   else if(shape==='hex'){for(let i=0;i<6;i++){const a=Math.PI/3*i;const x=Math.cos(a)*w/2,y=Math.sin(a)*h/2;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();}
   else{ctx.roundRect(-w/2,-h/2,w,h,24);}
 }
 function draw(){
   ctx.clearRect(0,0,900,750);
   const g=ctx.createLinearGradient(0,0,900,750);g.addColorStop(0,'#e9e7e1');g.addColorStop(1,'#d4d1c9');ctx.fillStyle=g;ctx.fillRect(0,0,900,750);
   // Stylized cap illustration with user-selected colors. Not a photographic product proof.
   ctx.save();ctx.translate(450,390);
   ctx.fillStyle=color('hatColor');ctx.strokeStyle='#ffffff44';ctx.lineWidth=5;
   ctx.beginPath();ctx.ellipse(0,190,340,93,0,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.beginPath();ctx.moveTo(-285,105);ctx.bezierCurveTo(-295,-210,-135,-310,0,-300);ctx.bezierCurveTo(160,-310,295,-180,285,105);ctx.quadraticCurveTo(0,175,-285,105);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.strokeStyle='#ffffff3d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-298);ctx.lineTo(0,-100);ctx.stroke();
   ctx.beginPath();ctx.ellipse(0,-299,15,8,0,0,Math.PI*2);ctx.fill();
   if(color('hatStyle')==='trucker'){ctx.fillStyle='#ffffff15';for(let y=-175;y<70;y+=18){for(let x=-245;x<250;x+=18){if(Math.abs(x)>115){ctx.fillRect(x,y,2,2);}}}}
   ctx.restore();
   const size=Number(color('patchSize'))/100,w=300*size,h=(color('patchShape')==='circle'?230:175)*size;
   ctx.save();ctx.translate(position.x,position.y);ctx.rotate(Number(color('patchRotate'))*Math.PI/180);
   ctx.shadowColor='#0006';ctx.shadowBlur=18;ctx.shadowOffsetY=10;path(color('patchShape'),w,h);ctx.fillStyle=color('patchColor');ctx.fill();ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
   ctx.strokeStyle='#f1e1c499';ctx.lineWidth=4;ctx.stroke();
   ctx.save();path(color('patchShape'),w-16,h-16);ctx.clip();
   if(artwork){const ratio=Math.min((w-44)/artwork.width,(h-32)/artwork.height);const aw=artwork.width*ratio,ah=artwork.height*ratio;ctx.drawImage(artwork,-aw/2,-ah/2,aw,ah);}
   else{const text=(color('patchText').trim()||'YOUR DESIGN').toUpperCase();ctx.fillStyle=['#262525','#49332b'].includes(color('patchColor'))?'#f2d9a6':'#241b16';ctx.textAlign='center';ctx.textBaseline='middle';let font=36;do{ctx.font='bold '+font+'px system-ui';font-=2;}while(ctx.measureText(text).width>w-38&&font>12);ctx.fillText(text,0,0,w-36);}
   ctx.restore();ctx.restore();
   ctx.fillStyle='#333';ctx.font='15px system-ui';ctx.textAlign='center';ctx.fillText('TEKNEEK HAT STUDIO · CONCEPT PREVIEW',450,720);
 }
 fields.forEach(id=>$(id).addEventListener('input',()=>{if(id==='patchSize')$('sizeLabel').textContent=color(id)+'%';if(id==='patchRotate')$('rotateLabel').textContent=color(id)+'°';draw();}));
 $('artwork').addEventListener('change',async e=>{
   const file=e.target.files[0];if(!file){artwork=null;draw();return;}
   if(!['image/png','image/jpeg','image/webp','image/svg+xml'].includes(file.type)||file.size>8*1024*1024){alert('Choose a PNG, JPG, WebP, or SVG file under 8 MB.');e.target.value='';return;}
   const url=URL.createObjectURL(file),img=new Image();
   img.onload=()=>{const c=document.createElement('canvas');const scale=Math.min(1,1600/Math.max(img.width,img.height));c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);artwork=c;URL.revokeObjectURL(url);draw();};
   img.onerror=()=>{URL.revokeObjectURL(url);alert('Could not read that artwork. Try a PNG instead.');};img.src=url;
 });
 function coords(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*900/r.width,y:(e.clientY-r.top)*750/r.height};}
 canvas.addEventListener('pointerdown',e=>{const p=coords(e);if(Math.abs(p.x-position.x)<220&&Math.abs(p.y-position.y)<155){dragging=true;canvas.setPointerCapture(e.pointerId);}});
 canvas.addEventListener('pointermove',e=>{if(!dragging)return;const p=coords(e);position.x=Math.max(290,Math.min(610,p.x));position.y=Math.max(255,Math.min(475,p.y));draw();});
 ['pointerup','pointercancel'].forEach(ev=>canvas.addEventListener(ev,()=>dragging=false));
 $('downloadMockup').addEventListener('click',()=>{const a=document.createElement('a');a.download='tekneek-hat-mockup.png';a.href=canvas.toDataURL('image/png');a.click();});
 $('resetDesign').addEventListener('click',()=>{fields.forEach(id=>{const defaults={hatStyle:'trucker',hatColor:'#272a2c',patchShape:'rounded',patchColor:'#b68150',patchText:'YOUR DESIGN',patchSize:'100',patchRotate:'0'};$(id).value=defaults[id];});$('artwork').value='';artwork=null;position={x:450,y:350};$('sizeLabel').textContent='100%';$('rotateLabel').textContent='0°';draw();});
 $('studioForm').addEventListener('submit',e=>{
   e.preventDefault();if(!e.currentTarget.reportValidity())return;
   const choice=id=>$(id).selectedOptions[0].textContent;
   const lines=['Hello TekNeek, I would like a quote for a custom patch hat.','', 'Name: '+color('customerName'),'Email: '+color('customerEmail'),'Phone: '+color('customerPhone'),'Quantity: '+choice('quantity'),'Hat style: '+choice('hatStyle'),'Hat color: '+choice('hatColor'),'Patch shape: '+choice('patchShape'),'Patch color: '+choice('patchColor'),'Patch text: '+color('patchText'),'Uploaded artwork: '+($('artwork').files[0]?.name||'None'),'Patch size preview: '+color('patchSize')+'%','Rotation: '+color('patchRotate')+'°','Notes: '+color('notes'),'','I will attach my downloaded mockup and original artwork to this email.'];
   const url='mailto:office@tekneekservices.com?subject='+encodeURIComponent('TekNeek Hat Studio - Quote Request')+'&body='+encodeURIComponent(lines.join('\n'));
   $('quoteStatus').textContent='Your email app should open now. Please attach the downloaded mockup and original artwork before sending. Nothing has been submitted automatically.';
   window.location.href=url;
 });
 draw();
})();