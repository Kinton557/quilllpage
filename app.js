const $=id=>document.getElementById(id);
const api=async(m,u,b)=>{const r=await fetch(u,{method:m,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined});let d={};try{d=await r.json()}catch{}
if(r.status===401){location.replace('signin.html');throw new Error('Please sign in.')}if(!r.ok)throw new Error(d.error||'Something went wrong.');return d};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const show=n=>['home','edit','prev'].forEach(s=>$(s).hidden=s!==n);
let me,photos=[],cur=null;
const quota=()=>$('quota').textContent=`AI reports used this month: ${me.used} of ${me.limit}`;
async function list(){const R=await api('GET','/api/reports');quota();const ul=$('list');ul.innerHTML='';$('empty').hidden=R.length>0;
R.sort((a,b)=>b.updated-a.updated).forEach(r=>{const li=document.createElement('li');li.innerHTML=`<span><strong>${esc(r.title)}</strong><br><small>${esc(r.type)} · ${new Date(r.updated).toLocaleDateString()}</small></span><span><button class="btn small" data-o="${r.id}">Open</button> <button class="btn small danger" data-d="${r.id}">Delete</button></span>`;ul.append(li)})}
$('list').onclick=async e=>{const o=e.target.dataset.o,d=e.target.dataset.d;try{
if(o){cur=await api('GET','/api/reports/'+o);$('doc').innerHTML=cur.html;$('qs').hidden=true;show('prev')}
if(d&&confirm('Delete this report?')){await api('DELETE','/api/reports/'+d);list()}}catch(err){alert(err.message)}};
$('out').onclick=async()=>{await api('POST','/api/signout',{}).catch(()=>{});location.href='index.html'};
$('del').onclick=async()=>{if(confirm('Permanently delete your account and all reports?')){await api('DELETE','/api/account');location.href='index.html'}};
$('new').onclick=()=>{$('f').reset();photos=[];pl();$('m').textContent='';show('edit')};
$('cancel').onclick=$('back').onclick=()=>{list();show('home')};
function shrink(file){return new Promise((ok,no)=>{const im=new Image(),u=URL.createObjectURL(file);im.onload=()=>{const s=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.85))};im.onerror=()=>no();im.src=u})}
$('photos').onchange=async e=>{for(const f of e.target.files){if(!/^image\/(jpeg|png|webp)$/.test(f.type)||f.size>15e6){$('m').textContent=f.name+' skipped: use JPG, PNG or WebP under 15 MB.';continue}
if(photos.length>=12){$('m').textContent='Maximum 12 photographs.';break}try{photos.push({src:await shrink(f),cap:''})}catch{$('m').textContent=f.name+' could not be read.'}}e.target.value='';pl()};
function pl(){$('pl').innerHTML='';photos.forEach((p,i)=>{const d=document.createElement('div');d.className='photo';d.innerHTML=`<img src="${p.src}" alt=""><input aria-label="Caption for photo ${i+1}" placeholder="Caption" value="${esc(p.cap)}"><button type="button" class="btn small alt" aria-label="Remove photo ${i+1}">Remove</button>`;
d.querySelector('input').oninput=e=>p.cap=e.target.value;d.querySelector('button').onclick=()=>{photos.splice(i,1);pl()};$('pl').append(d)})}
const flag=t=>`<span class="flag">[${t}: please add]</span>`;
$('f').onsubmit=async e=>{e.preventDefault();const v=id=>$(id).value.trim(),btn=$('gen'),m=$('m');m.textContent='';
const paras=v('notes').split(/\n+/).map(s=>s.trim()).filter(Boolean);
if(!v('title')||!paras.length){m.textContent='Add a title and some notes.';return}
let out=null;
if($('useai').checked){btn.disabled=true;btn.textContent='Writing your draft... up to a minute';
try{out=await api('POST','/api/generate',{title:v('title'),type:$('type').value,date:v('date'),venue:v('venue'),author:v('author'),style:$('style').value,notes:v('notes')});me.used=out.used}
catch(err){m.textContent=err.message;btn.disabled=false;btn.textContent='Generate my report';return}
btn.disabled=false;btn.textContent='Generate my report'}
const d=v('date')?new Date(v('date')+'T00:00').toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}):flag('Date');
const body=out?(out.summary?`<p><strong>${esc(out.summary)}</strong></p>`:'')+out.sections.map(s=>(s.heading?`<h2>${esc(s.heading)}</h2>`:'')+s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')).join(''):paras.map(p=>`<p>${esc(p)}</p>`).join('');
const q=v('quotes').split('\n').map(s=>s.trim()).filter(Boolean).map(s=>`<blockquote>${esc(s)}</blockquote>`).join('');
const fig=photos.map(p=>`<figure><img src="${p.src}" alt="${esc(p.cap)}"><figcaption>${p.cap?esc(p.cap):flag('Caption')}</figcaption></figure>`).join('');
const html=`<h1>${esc((out&&out.headline)||v('title'))}</h1><div class="meta">${esc($('type').value)} · ${d} · ${v('venue')?esc(v('venue')):flag('Venue')} · By ${v('author')?esc(v('author')):flag('Author')}</div>${body}${q}${fig}`;
try{const r=await api('PUT','/api/reports',{title:v('title'),type:$('type').value,html});cur={id:r.id,html}}catch(err){m.textContent=err.message;return}
$('doc').innerHTML=html;const qs=(out&&out.questions)||[];$('qs').hidden=!qs.length;$('qs').innerHTML=qs.length?`<strong>Questions for you</strong><p class="hint">The AI left these out rather than guess. Add the answers to your report if they matter.</p><ul>${qs.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'';show('prev')};
$('save').onclick=async()=>{try{await api('PUT','/api/reports',{id:cur.id,title:$('doc').querySelector('h1')?.textContent||'Untitled',type:'',html:$('doc').innerHTML});alert('Saved.')}catch(err){alert(err.message)}};
$('print').onclick=()=>window.print();
(async()=>{try{me=await api('GET','/api/me');$('who').textContent=me.name;await list();show('home')}catch{}})();
