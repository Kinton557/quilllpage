const $=id=>document.getElementById(id),email=localStorage.getItem('qp_session'),users=JSON.parse(localStorage.getItem('qp_users')||'{}');
if(!email||!users[email])location.replace('signin.html');
const K='qp_reports_'+email;let R=JSON.parse(localStorage.getItem(K)||'[]'),photos=[],cur=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const persist=()=>{try{localStorage.setItem(K,JSON.stringify(R));return true}catch(e){alert('Browser storage is full. Delete an older report or use fewer photos.');return false}};
const show=n=>['home','edit','prev'].forEach(s=>$(s).hidden=s!==n);
$('who').textContent=users[email]?.name||'';
$('out').onclick=()=>{localStorage.removeItem('qp_session');location.href='index.html'};
$('del').onclick=()=>{if(confirm('Permanently delete your account and all reports?')){delete users[email];localStorage.setItem('qp_users',JSON.stringify(users));localStorage.removeItem(K);localStorage.removeItem('qp_session');location.href='index.html'}};
function list(){const ul=$('list');ul.innerHTML='';$('empty').hidden=R.length>0;
R.slice().reverse().forEach(r=>{const li=document.createElement('li');li.innerHTML=`<span><strong>${esc(r.title)}</strong><br><small>${esc(r.type)} · ${new Date(r.updated).toLocaleDateString()}</small></span><span><button class="btn small" data-o="${r.id}">Open</button> <button class="btn small danger" data-d="${r.id}">Delete</button></span>`;ul.append(li)})}
$('list').onclick=e=>{const o=e.target.dataset.o,d=e.target.dataset.d;
if(o){cur=R.find(r=>r.id===o);$('doc').innerHTML=cur.html;show('prev')}
if(d&&confirm('Delete this report?')){R=R.filter(r=>r.id!==d);persist();list()}};
$('new').onclick=()=>{$('f').reset();photos=[];pl();$('m').textContent='';show('edit')};
$('cancel').onclick=$('back').onclick=()=>{list();show('home')};
function shrink(file){return new Promise((ok,no)=>{const im=new Image(),u=URL.createObjectURL(file);im.onload=()=>{const s=Math.min(1,1200/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.8))};im.onerror=()=>no();im.src=u})}
$('photos').onchange=async e=>{for(const f of e.target.files){if(!/^image\/(jpeg|png|webp)$/.test(f.type)||f.size>15e6){$('m').textContent=f.name+' skipped: use JPG, PNG or WebP under 15 MB.';continue}
if(photos.length>=12){$('m').textContent='Maximum 12 photographs.';break}try{photos.push({src:await shrink(f),cap:''})}catch{$('m').textContent=f.name+' could not be read.'}}e.target.value='';pl()};
function pl(){$('pl').innerHTML='';photos.forEach((p,i)=>{const d=document.createElement('div');d.className='photo';d.innerHTML=`<img src="${p.src}" alt=""><input aria-label="Caption for photo ${i+1}" placeholder="Caption" value="${esc(p.cap)}"><button type="button" class="btn small alt" aria-label="Remove photo ${i+1}">Remove</button>`;
d.querySelector('input').oninput=e=>p.cap=e.target.value;d.querySelector('button').onclick=()=>{photos.splice(i,1);pl()};$('pl').append(d)})}
const flag=t=>`<span class="flag">[${t}: please add]</span>`;
$('f').onsubmit=e=>{e.preventDefault();
const v=id=>$(id).value.trim(),paras=v('notes').split(/\n\s*\n|\n/).map(s=>s.trim()).filter(Boolean);
if(!v('title')||!paras.length){$('m').textContent='Add a title and some notes.';return}
const d=v('date')?new Date(v('date')+'T00:00').toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}):flag('Date'),
q=v('quotes').split('\n').map(s=>s.trim()).filter(Boolean).map(s=>`<blockquote>${esc(s)}</blockquote>`).join(''),
fig=photos.map(p=>`<figure><img src="${p.src}" alt="${esc(p.cap)}"><figcaption>${p.cap?esc(p.cap):flag('Caption')}</figcaption></figure>`).join('');
const html=`<h1>${esc(v('title'))}</h1><div class="meta">${esc($('type').value)} · ${d} · ${v('venue')?esc(v('venue')):flag('Venue')} · By ${v('author')?esc(v('author')):flag('Author')}</div>${paras.map(p=>`<p>${esc(p)}</p>`).join('')}${q}${fig}`;
cur={id:crypto.randomUUID(),title:v('title'),type:$('type').value,html,updated:Date.now()};R.push(cur);
if(!persist()){R.pop();return}$('doc').innerHTML=html;show('prev')};
$('save').onclick=()=>{cur.html=$('doc').innerHTML;cur.updated=Date.now();if(persist())alert('Saved.')};
$('print').onclick=()=>window.print();
list();show('home');
