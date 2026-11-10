'use strict';
const $ = id => document.getElementById(id);
const state = {account:null,config:null,mode:'assistant'};
function status(message) {$('status').textContent=message;}
function log(message,kind='answer') {const el=document.createElement('article');el.className='message '+kind;el.textContent=String(message);$('messages').appendChild(el);$('messages').scrollTop=$('messages').scrollHeight;}
async function token(){return (await state.account.createJWT()).jwt;}
async function request(path, body){
  const res=await fetch(path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+await token(),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const value=await res.json();
  if(!res.ok)throw new Error(value.error||'Request failed');
  return value;
}
function authenticated(user){
  $('identity').textContent=user.email+' · '+user.role;
  $('workspace').hidden=false;$('login').hidden=true;$('logout').hidden=false;
}
function reset(){$('workspace').hidden=true;$('login').hidden=false;$('logout').hidden=true;}
(async function init(){
  try{
    state.config=await (await fetch('/api/config')).json();
    if(!window.Appwrite)throw new Error('Failed to load Appwrite SDK');
    const client=new window.Appwrite.Client().setEndpoint(state.config.endpoint).setProject(state.config.project);
    state.account=new window.Appwrite.Account(client);
    try{authenticated((await request('/api/me')).user);}catch{reset();}
  }catch(error){status(error.message);}
})();
$('loginForm').addEventListener('submit',async event=>{
  event.preventDefault();const btn=event.target.querySelector('button');btn.disabled=true;
  try{
    await state.account.createEmailPasswordSession({email:$('email').value,password:$('password').value});
    authenticated((await request('/api/me')).user);$('password').value='';status('');
  }catch(error){status('فشل تسجيل الدخول: '+error.message);}finally{btn.disabled=false;}
});
$('logout').addEventListener('click',async ()=>{
  try{await state.account.deleteSession({sessionId:'current'});}catch{}
  reset();status('تم تسجيل الخروج');
});
$('browse').addEventListener('click',async()=>{
  try{
    const data=await request('/api/tool',{op:'list_children',args:{parent_id:state.config.root,cursor:null}});
    log(JSON.stringify(data.result,null,2));
  }catch(error){status(error.message);}
});
$('search').addEventListener('click',()=>{state.mode='search';status('أدخل عنوان الصفحة المطلوبة أو جزءاً منه');});
$('assistant').addEventListener('click',()=>{state.mode='assistant';status('اكتب سؤالك البحثي. يتطلب تفعيل مفتاح OpenAI على الاستضافة.');});
$('queryForm').addEventListener('submit',async event=>{
  event.preventDefault();const value=$('query').value.trim();if(!value)return;
  const btn=$('send');btn.disabled=true;$('query').value='';log(value,'question');
  try{
    if(state.mode==='search'){const r=await request('/api/tool',{op:'search_pages',args:{query:value}});log(JSON.stringify(r.result,null,2));}
    else{const r=await request('/api/chat',{message:value});log(r.answer);}
    status('');
  }catch(error){status(error.message);}
  finally{btn.disabled=false;}
});
