// PROTOTYPE AUTH: accounts live in this browser only (localStorage). Replace with a server before real launch.
const U='qp_users',S='qp_session',$=id=>document.getElementById(id);
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function hash(pw,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);
return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:Uint8Array.from(salt.match(/../g).map(h=>parseInt(h,16))),iterations:210000,hash:'SHA-256'},k,256))}
const users=()=>JSON.parse(localStorage.getItem(U)||'{}');
if(localStorage.getItem(S))location.replace('app.html');
const form=document.querySelector('form'),msg=$('msg');
form.addEventListener('submit',async e=>{e.preventDefault();msg.textContent='';
const email=$('email').value.trim().toLowerCase(),pw=$('pw').value;
if(!/^\S+@\S+\.\S+$/.test(email))return msg.textContent='Enter a valid email address.';
if(pw.length<8)return msg.textContent='Password must be at least 8 characters.';
try{const all=users();
if(form.id==='signup'){const name=$('name').value.trim();
if(!name)return msg.textContent='Enter your name.';
if(!$('agree').checked)return msg.textContent='Please accept the Terms and Privacy Policy.';
if(all[email])return msg.textContent='An account with this email already exists. Try signing in.';
const salt=hex(crypto.getRandomValues(new Uint8Array(16)));
all[email]={name,salt,hash:await hash(pw,salt),created:Date.now()};localStorage.setItem(U,JSON.stringify(all));}
else{const u=all[email];
if(!u||await hash(pw,u.salt)!==u.hash)return msg.textContent='Email or password is incorrect.';}
localStorage.setItem(S,email);location.href='app.html';}
catch(err){msg.textContent='Sign-in needs a secure connection (https). '+err.message}});
