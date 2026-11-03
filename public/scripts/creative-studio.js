(()=>{
const $=id=>document.getElementById(id),c=$('creativeCanvas'),x=c.getContext('2d'),catalog=JSON.parse($('creativeCatalog').textContent);
let art=null,pos={x:450,y:455},drag=false,area={x:450,y:455,w:230,h:220};
const val=id=>$(id).value,selected=()=>catalog.find(p=>p.id===val('creativeProduct'))||catalog[0];
function options(sel,items){sel.replaceChildren(...items.map(({value,label})=>{const o=document.createElement('option');o.value=value;o.textContent=label;return o;}));}
function loadProducts(){const items=catalog.filter(p=>p.category===val('creativeCategory'));options($('creativeProduct'),items.map(p=>({value:p.id,label:p.name})));loadFinishes();}
function loadFinishes(){const p=selected();options($('creativeFinish'),p.colors.map(q=>({value:q.hex,label:q.name})));$('creativeProductNote').textContent=p.description+' · Supplier model and availability pending confirmation.';art=null;$('creativeArt').value='';pos={x:450,y:455};draw();}
function rounded(a,b,w,h,r){x.beginPath();x.roundRect(a,b,w,h,r);}
function shade(hex,alpha){x.fillStyle=hex;x.globalAlpha=alpha;}
function product(){
 const p=selected(),color=val('creativeFinish');x.save();x.shadowColor='#0005';x.shadowBlur=35;x.shadowOffsetY=18;
 if(['tumbler','handled','lowball'].includes(p.kind)){
 const low=p.kind==='lowball',handle=p.kind==='handled',w=low?320:handle?290:270,top=low?300:220,bottom=low?610:handle?710:700;
 if(handle){x.lineWidth=36;x.strokeStyle=color;x.beginPath();x.roundRect(560,335,155,245,55);x.stroke();}
 x.beginPath();x.moveTo(450-w/2,top);x.lineTo(450+w/2,top);x.lineTo(450+w*.43,bottom);x.quadraticCurveTo(450,bottom+25,450-w*.43,bottom);x.closePath();x.fillStyle=color;x.fill();
 x.shadowColor='transparent';const grad=x.createLinearGradient(450-w/2,0,450+w/2,0);grad.addColorStop(0,'#0005');grad.addColorStop(.22,'#fff3');grad.addColorStop(.55,'#fff0');grad.addColorStop(.86,'#0003');grad.addColorStop(1,'#0007');x.fillStyle=grad;x.fill();
 x.fillStyle='#555';rounded(450-w/2-10,top-23,w+20,27,12);x.fill();x.fillStyle='#252525';rounded(450-w/2+22,top-38,w-44,15,7);x.fill();
 area={x:450,y:(top+bottom)/2+10,w:w*.72,h:(bottom-top)*.65};
 }else if(p.kind==='wallet'){
 rounded(185,310,530,340,25);x.fillStyle=color;x.fill();x.shadowColor='transparent';x.strokeStyle='#c7a47a88';x.lineWidth=4;x.setLineDash([7,8]);rounded(203,329,494,302,17);x.stroke();x.setLineDash([]);x.strokeStyle='#0006';x.beginPath();x.moveTo(450,315);x.lineTo(450,646);x.stroke();area={x:565,y:475,w:210,h:190};
 }else{
 rounded(265,155,370,600,18);x.fillStyle=color;x.fill();x.shadowColor='transparent';x.strokeStyle='#fff5';x.lineWidth=3;rounded(285,175,330,560,12);x.stroke();x.fillStyle='#c7b79e';rounded(610,155,15,600,5);x.fill();area={x:445,y:430,w:260,h:370};
 }x.restore();
}
function draw(){
 x.clearRect(0,0,900,900);const g=x.createLinearGradient(0,0,900,900);g.addColorStop(0,'#eeeae3');g.addColorStop(1,'#d7d1c6');x.fillStyle=g;x.fillRect(0,0,900,900);
 product();pos.x=Math.max(area.x-area.w/3,Math.min(area.x+area.w/3,pos.x));pos.y=Math.max(area.y-area.h/3,Math.min(area.y+area.h/3,pos.y));
 x.save();x.translate(pos.x,pos.y);x.rotate(Number(val('creativeRotate'))*Math.PI/180);
 const s=Number(val('creativeScale'))/100;const dark=['#292c30','#272626','#38322a','#292929','#473126'].includes(val('creativeFinish'));
 x.fillStyle=dark?'#e2c7a0':'#3a281c';
 if(art){const scale=Math.min(area.w*.86/art.width,area.h*.78/art.height)*s;x.save();x.globalAlpha=.8;x.drawImage(art,-art.width*scale/2,-art.height*scale/2,art.width*scale,art.height*scale);x.restore();}
 else{const t=val('creativeText').trim()||'YOUR NAME';let size=44*s;const font=val('creativeFont')==='serif'?'Georgia,serif':val('creativeFont')==='script'?'italic Georgia,serif':'system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.font='bold '+size+'px '+font;while(x.measureText(t).width>area.w*.9*s&&size>12){size-=2;x.font='bold '+size+'px '+font;}x.fillText(t,0,0,area.w*.9*s);}
 x.restore();x.fillStyle='#5d5851';x.font='15px system-ui';x.textAlign='center';x.fillText('TEKNEEK CREATIVE · CONCEPT PREVIEW',450,862);
}
$('creativeCategory').addEventListener('change',loadProducts);$('creativeProduct').addEventListener('change',loadFinishes);$('creativeFinish').addEventListener('change',draw);
['creativeText','creativeFont','creativeScale','creativeRotate'].forEach(id=>$(id).addEventListener('input',()=>{$('creativeScaleOut').textContent=val('creativeScale')+'%';$('creativeRotateOut').textContent=val('creativeRotate')+'°';draw();}));
$('creativeArt').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp','image/svg+xml'].includes(file.type)||file.size>8*1024*1024){alert('Choose PNG, JPG, WebP or SVG under 8 MB.');e.target.value='';return;}const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{const cv=document.createElement('canvas'),s=Math.min(1,1400/Math.max(img.width,img.height));cv.width=Math.max(1,Math.round(img.width*s));cv.height=Math.max(1,Math.round(img.height*s));const cc=cv.getContext('2d');cc.drawImage(img,0,0,cv.width,cv.height);const pixels=cc.getImageData(0,0,cv.width,cv.height);for(let i=0;i<pixels.data.length;i+=4){const gray=.299*pixels.data[i]+.587*pixels.data[i+1]+.114*pixels.data[i+2];pixels.data[i]=darkColor()?226:55;pixels.data[i+1]=darkColor()?199:40;pixels.data[i+2]=darkColor()?160:28;pixels.data[i+3]=Math.round(pixels.data[i+3]*(1-gray/255*.55));}cc.putImageData(pixels,0,0);art=cv;URL.revokeObjectURL(url);draw();};img.onerror=()=>{URL.revokeObjectURL(url);alert('Could not open this artwork. Try a PNG.');};img.src=url;});
function darkColor(){return ['#292c30','#272626','#38322a','#292929','#473126'].includes(val('creativeFinish'));}
function xy(e){const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*900/r.width,y:(e.clientY-r.top)*900/r.height};}
c.addEventListener('pointerdown',e=>{const p=xy(e);if(Math.abs(p.x-pos.x)<area.w/2&&Math.abs(p.y-pos.y)<area.h/2){drag=true;c.setPointerCapture(e.pointerId);}});c.addEventListener('pointermove',e=>{if(!drag)return;pos=xy(e);draw();});['pointerup','pointercancel'].forEach(t=>c.addEventListener(t,()=>drag=false));
$('creativeDownload').addEventListener('click',()=>{const a=document.createElement('a');a.download='tekneek-creative-mockup.png';a.href=c.toDataURL('image/png');a.click();});
$('creativeReset').addEventListener('click',()=>{$('creativeCategory').value='Drinkware';loadProducts();$('creativeText').value='YOUR NAME';$('creativeFont').value='bold';$('creativeScale').value=100;$('creativeRotate').value=0;$('creativeScaleOut').textContent='100%';$('creativeRotateOut').textContent='0°';draw();});
$('creativeForm').addEventListener('submit',e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;const p=selected(),finish=$('creativeFinish').selectedOptions[0].textContent;const lines=['Hello TekNeek, I would like a quote for a personalized item.','','Name: '+val('creativeName'),'Email: '+val('creativeEmail'),'Phone: '+val('creativePhone'),'Quantity: '+val('creativeQuantity'),'Product concept: '+p.name,'Category: '+p.category,'Supplier SKU: To be confirmed by TekNeek','Requested finish: '+finish,'Personalization text: '+val('creativeText'),'Artwork uploaded: '+($('creativeArt').files[0]?.name|| (art?'Yes':'No')),'Lettering: '+$('creativeFont').selectedOptions[0].textContent,'Design size: '+val('creativeScale')+'%','Rotation: '+val('creativeRotate')+'°','Notes: '+val('creativeNotes'),'','Please confirm actual product availability, engraving feasibility, and final price. I will attach the mockup and original artwork.'];$('creativeStatus').textContent='Your email app should open. Please attach the mockup and artwork before sending; nothing has been submitted automatically.';location.href='mailto:office@tekneekservices.com?subject='+encodeURIComponent('TekNeek Creative Studio - Quote Request')+'&body='+encodeURIComponent(lines.join('\n'));});
loadProducts();
})();