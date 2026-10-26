const $=id=>document.getElementById(id),form=document.querySelector('form'),msg=$('msg');
fetch('/api/me',{credentials:'same-origin'}).then(r=>{if(r.ok)location.replace('app.html')}).catch(()=>{});
form.addEventListener('submit',async e=>{e.preventDefault();msg.textContent='';
const email=$('email').value.trim(),password=$('pw').value,body={email,password};
if(!/^\S+@\S+\.\S+$/.test(email))return msg.textContent='Enter a valid email address.';
if(password.length<8)return msg.textContent='Password must be at least 8 characters.';
if(form.id==='signup'){body.name=$('name').value.trim();if(!body.name)return msg.textContent='Enter your name.';if(!$('agree').checked)return msg.textContent='Please accept the Terms and Privacy Policy.'}
try{const r=await fetch('/api/'+form.id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();
if(!r.ok)return msg.textContent=d.error||'Something went wrong.';location.href='app.html'}
catch{msg.textContent='Could not reach the server. Check your connection and try again.'}});
