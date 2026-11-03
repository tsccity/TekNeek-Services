(()=>{
const $=id=>document.getElementById(id),canvas=$('shirtCanvas'),ctx=canvas.getContext('2d');
const sides={front:{text:'',art:null,position:{x:450,y:405},size:100,rotate:0,placement:'center',textColor:'#ffffff'},back:{text:'',art:null,position:{x:450,y:405},size:100,rotate:0,placement:'center',textColor:'#ffffff'}};
let side='front',dragging=false;
const v=id=>$(id).value;
function shirtPath(){
 ctx.beginPath();ctx.moveTo(310,165);ctx.lineTo(365,125);ctx.quadraticCurveTo(450,182,535,125);ctx.lineTo(590,165);ctx.lineTo(735,245);
 const sleeve=v('shirtType')==='long';ctx.lineTo(sleeve?820:690,sleeve?600:395);ctx.lineTo(sleeve?720:585,sleeve?615:430);
 ctx.lineTo(615,385);ctx.lineTo(615,795);ctx.quadraticCurveTo(450,815,285,795);ctx.lineTo(285,385);ctx.lineTo(sleeve?180:285,sleeve?585:430);ctx.lineTo(sleeve?80:210,sleeve?600:395);ctx.lineTo(165,245);ctx.closePath();
}
function draw(){
 ctx.clearRect(0,0,900,900);const bg=ctx.createLinearGradient(0,0,900,900);bg.addColorStop(0,'#eeeae3');bg.addColorStop(1,'#d6d2c9');ctx.fillStyle=bg;ctx.fillRect(0,0,900,900);
 ctx.save();ctx.shadowColor='#0004';ctx.shadowBlur=27;ctx.shadowOffsetY=17;shirtPath();ctx.fillStyle=v('shirtColor');ctx.fill();ctx.restore();
 ctx.strokeStyle='#7775';ctx.lineWidth=3;shirtPath();ctx.stroke();
 ctx.beginPath();ctx.ellipse(450,144,88,29,0,0,Math.PI);ctx.strokeStyle='#0004';ctx.lineWidth=5;ctx.stroke();
 ctx.strokeStyle='#ffffff35';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(305,782);ctx.quadraticCurveTo(450,798,595,782);ctx.stroke();
 if(side==='back'){ctx.fillStyle='#777';ctx.font='15px system-ui';ctx.textAlign='center';ctx.fillText('BACK VIEW',450,100);}
 const d=sides[side],sz=d.size/100;ctx.save();ctx.translate(d.position.x,d.position.y);ctx.rotate(d.rotate*Math.PI/180);
 if(d.art){const scale=Math.min(360/d.art.width,380/d.art.height)*sz;ctx.drawImage(d.art,-d.art.width*scale/2,-d.art.height*scale/2,d.art.width*scale,d.art.height*scale);}
 else if(d.text.trim()){ctx.fillStyle=d.textColor;ctx.textAlign='center';ctx.textBaseline='middle';let fs=Math.round(52*sz);ctx.font='900 '+fs+'px system-ui';while(ctx.measureText(d.text).width>360*sz&&fs>12){fs-=2;ctx.font='900 '+fs+'px system-ui';}ctx.fillText(d.text.toUpperCase(),0,0,360*sz);}
 else{ctx.strokeStyle='#9998';ctx.setLineDash([9,8]);ctx.lineWidth=2;ctx.strokeRect(-140*sz,-85*sz,280*sz,170*sz);ctx.setLineDash([]);ctx.fillStyle='#777';ctx.textAlign='center';ctx.font='18px system-ui';ctx.fillText('ADD YOUR DESIGN',0,0);}
 ctx.restore();ctx.fillStyle='#4d4b47';ctx.font='16px system-ui';ctx.textAlign='center';ctx.fillText('TEKNEEK T-SHIRT STUDIO · CONCEPT PREVIEW',450,870);
}
function sync(){const d=sides[side];$('designSide').value=side;$('shirtText').value=d.text;$('placement').value=d.placement;$('textColor').value=d.textColor;$('designSize').value=d.size;$('designRotate').value=d.rotate;$('shirtSizeLabel').textContent=d.size+'%';$('shirtRotateLabel').textContent=d.rotate+'°';$('shirtArtwork').value='';document.querySelectorAll('.shirt-side').forEach(b=>{const on=b.dataset.side===side;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});draw();}
function setSide(s){side=s;sync();}
document.querySelectorAll('.shirt-side').forEach(b=>b.addEventListener('click',()=>setSide(b.dataset.side)));
$('designSide').addEventListener('change',()=>setSide(v('designSide')));
function place(p){const d=sides[side];d.placement=p;d.position={center:{x:450,y:405},left:{x:535,y:325},right:{x:365,y:325},upper:{x:450,y:280}}[p];if(p==='left'||p==='right')d.size=Math.min(d.size,60);sync();}
$('placement').addEventListener('change',()=>place(v('placement')));
$('shirtText').addEventListener('input',()=>{const d=sides[side];d.text=v('shirtText');if(d.text)d.art=null;draw();});
$('textColor').addEventListener('change',()=>{sides[side].textColor=v('textColor');draw();});
$('designSize').addEventListener('input',()=>{sides[side].size=Number(v('designSize'));$('shirtSizeLabel').textContent=v('designSize')+'%';draw();});
$('designRotate').addEventListener('input',()=>{sides[side].rotate=Number(v('designRotate'));$('shirtRotateLabel').textContent=v('designRotate')+'°';draw();});
['shirtType','shirtColor'].forEach(id=>$(id).addEventListener('change',draw));
$('shirtArtwork').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp','image/svg+xml'].includes(file.type)||file.size>8*1024*1024){alert('Use PNG, JPG, WebP or SVG artwork under 8 MB.');e.target.value='';return;}const target=side,url=URL.createObjectURL(file),img=new Image();img.onload=()=>{const c=document.createElement('canvas'),ratio=Math.min(1,1600/Math.max(img.width,img.height));c.width=Math.max(1,Math.round(img.width*ratio));c.height=Math.max(1,Math.round(img.height*ratio));c.getContext('2d').drawImage(img,0,0,c.width,c.height);sides[target].art=c;sides[target].text='';URL.revokeObjectURL(url);if(target===side)sync();};img.onerror=()=>{URL.revokeObjectURL(url);alert('Artwork could not be opened. Please try a PNG.');};img.src=url;});
function xy(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*900/r.width,y:(e.clientY-r.top)*900/r.height};}
canvas.addEventListener('pointerdown',e=>{const p=xy(e),d=sides[side];if(Math.abs(p.x-d.position.x)<200&&Math.abs(p.y-d.position.y)<220){dragging=true;canvas.setPointerCapture(e.pointerId);}});
canvas.addEventListener('pointermove',e=>{if(!dragging)return;const p=xy(e);sides[side].position={x:Math.max(310,Math.min(590,p.x)),y:Math.max(255,Math.min(655,p.y))};draw();});
['pointerup','pointercancel'].forEach(ev=>canvas.addEventListener(ev,()=>dragging=false));
function download(s){const old=side;side=s;draw();const a=document.createElement('a');a.download='tekneek-tshirt-'+s+'.png';a.href=canvas.toDataURL('image/png');a.click();side=old;draw();}
$('downloadFront').addEventListener('click',()=>download('front'));$('downloadBack').addEventListener('click',()=>download('back'));
$('resetShirt').addEventListener('click',()=>{for(const s of ['front','back'])sides[s]={text:'',art:null,position:{x:450,y:405},size:100,rotate:0,placement:'center',textColor:'#ffffff'};$('shirtColor').value='#202124';$('shirtType').value='crew';$('printMethod').value='recommend';setSide('front');});
$('shirtForm').addEventListener('submit',e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;const choice=id=>$(id).selectedOptions[0].textContent;const desc=s=>{const d=sides[s];return(d.art?'Uploaded artwork (attach original)':'Text: '+(d.text||'None'))+', placement '+d.placement+', size '+d.size+'%, rotation '+d.rotate+'°';};const lines=['Hello TekNeek, I would like a quote for custom T-shirts.','','Name: '+v('shirtName'),'Email: '+v('shirtEmail'),'Phone: '+v('shirtPhone'),'Quantity: '+v('shirtQuantity'),'Sizes: '+v('shirtSizes'),'Shirt: '+choice('shirtType'),'Color: '+choice('shirtColor'),'Decoration: '+choice('printMethod'),'Front: '+desc('front'),'Back: '+desc('back'),'Notes: '+v('shirtNotes'),'','I will attach my downloaded front/back mockups and original artwork.'];$('shirtQuoteStatus').textContent='Your email app should open now. Please attach both mockups and any original artwork before sending. Nothing has been submitted automatically.';location.href='mailto:office@tekneekservices.com?subject='+encodeURIComponent('TekNeek T-Shirt Studio - Quote Request')+'&body='+encodeURIComponent(lines.join('\n'));});
sync();
})();