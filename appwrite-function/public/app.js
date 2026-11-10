'use strict';
const $=id=>document.getElementById(id);
const state={account:null,config:null,mode:'assistant',projectId:null,projects:[]};
function status(message){$('status').textContent=message;}
function log(message,kind='answer'){const el=document.createElement('article');el.className='message '+kind;el.textContent=String(message);$('messages').appendChild(el);$('messages').scrollTop=$('messages').scrollHeight;}
async function token(){return (await state.account.createJWT()).jwt;}
async function request(path,body){
  const response=await fetch(path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+await token(),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const value=await response.json();
  if(!response.ok)throw new Error(value.error||'Request failed');
  return value;
}
async function authenticated(){
  const response=await request('/api/me');
  const user=response.user;
  const projects=await request('/api/projects');
  state.projects=projects.projects||[];
  const control=$('projectSelect');
  control.replaceChildren();
  for(const project of state.projects){
    const option=document.createElement('option');
    option.value=project.id;
    option.textContent=project.name+' ('+project.role+')';
    control.appendChild(option);
  }
  state.projectId=state.projects[0]?.id||null;
  if(!state.projectId)throw new Error('ما عندك مشاريع مشتركة مفعّلة حالياً');
  $('identity').textContent=user.email+' · '+user.role;
  $('workspace').hidden=false;
  $('login').hidden=true;
  $('logout').hidden=false;
  status('أهلاً بك. اختار مشروعاً لتبدأ.');
}
function reset(){
  state.projectId=null;state.projects=[];
  $('workspace').hidden=true;$('login').hidden=false;$('logout').hidden=true;
}
(async function initialize(){
  try{
    state.config=await (await fetch('/api/config')).json();
    if(!window.Appwrite)throw new Error('تعذر تحميل Appwrite SDK.');
    const client=new window.Appwrite.Client().setEndpoint(state.config.endpoint).setProject(state.config.project);
    state.account=new window.Appwrite.Account(client);
    const params=new URLSearchParams(window.location.search);
    if(params.has('secret')&&params.has('userId')){
      try{
        await state.account.createSession({userId:params.get('userId'),secret:params.get('secret')});
      }finally{
        window.history.replaceState({},'',window.location.pathname);
      }
    }
    try{await authenticated();}catch(error){reset();status(error.message);}
  }catch(error){reset();status(error.message);}
})();
$('magicForm').addEventListener('submit',async event=>{
  event.preventDefault();
  const btn=$('magicButton');btn.disabled=true;
  try{
    const email=$('email').value.trim();
    if(!email)throw new Error('أدخل البريد الإلكتروني');
    await state.account.createMagicURLToken({
      userId:window.Appwrite.ID.unique(),
      email,
      url:window.location.origin+'/'
    });
    status('إذا كان البريد صحيحاً، رح توصلك رسالة دخول. فتّش كمان في Spam.');
  }catch(error){status('تعذّر إرسال الرابط: '+error.message);}
  finally{btn.disabled=false;}
});
$('projectSelect').addEventListener('change',value=>{
  state.projectId=$('projectSelect').value;
  $('messages').replaceChildren();
  status('تم اختيار المشروع.');
});
$('logout').addEventListener('click',async()=>{
  try{await state.account.deleteSession({sessionId:'current'});}catch{}
  reset();status('تم تسجيل الخروج');
});
$('browse').addEventListener('click',async()=>{
  if(!state.projectId)return;
  try{
    const selected=state.projects.find(p=>p.id===state.projectId);
    const r=await request('/api/tool',{projectId:state.projectId,op:'list_children',args:{parent_id:selected.rootId,cursor:null}});
    log(JSON.stringify(r.result,null,2));
    status('');
  }catch(error){status(error.message);}
});
$('search').addEventListener('click',()=>{
  state.mode='search';status('ابحث بعنوان صفحة داخل المشروع المحدد.');
});
$('assistant').addEventListener('click',()=>{
  state.mode='assistant';status('اكتب سؤالاً عن المشروع المحدد. يحتاج تفعيل مفتاح AI على الخادم.');
});
$('queryForm').addEventListener('submit',async event=>{
  event.preventDefault();
  const value=$('query').value.trim();
  if(!value||!state.projectId)return;
  const button=$('send');button.disabled=true;
  $('query').value='';log(value,'question');
  try{
    if(state.mode==='search'){
      const r=await request('/api/tool',{projectId:state.projectId,op:'search_pages',args:{query:value}});
      log(JSON.stringify(r.result,null,2));
    }else{
      const r=await request('/api/chat',{projectId:state.projectId,message:value});
      log(r.answer);
    }
    status('');
  }catch(error){status(error.message);}
  finally{button.disabled=false;}
});