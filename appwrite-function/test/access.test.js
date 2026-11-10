import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../index.js';

process.env.NOTION_TOKEN='test-token-only';
const person='member1', inRoot='41071da3367981e68f76fd7485e6618b';
const outOfScope='bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const memberId='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function mockFetch(url,options={}){
  const path=String(url);
  const ok=data=>Promise.resolve({ok:true,status:200,json:async()=>data});
  const missing=()=>Promise.resolve({ok:false,status:404,json:async()=>({})});
  if(path.endsWith('/account'))return ok({$id:person,email:'test@example.com',emailVerification:true});
  if(path.includes('/members/rows/'+person))return ok({data:{role:'viewer',active:true}});
  if(path.includes('/project_grants/rows?'))return ok({rows:[{data:{userId:person,projectId:'solar_intelligence',active:true,role:'viewer'}}]});
  if(path.includes('/projects/rows/solar_intelligence'))return ok({data:{rootId:inRoot,active:true,name:'Solar Intelligence'}});
  if(path.includes('/pages/'+outOfScope))return ok({id:outOfScope,parent:{type:'workspace',workspace:true}});
  if(path.includes('/blocks/'+outOfScope))return missing();
  if(path.includes('/blocks/'+inRoot+'/children'))return ok({results:[],next_cursor:null,has_more:false});
  return missing();
}
async function call(method,path,body,authenticated=true){
  const captured={};
  const req={method,path,scheme:'https',host:'portal.example',
    headers:authenticated?{authorization:'Bearer fake-jwt','x-appwrite-key':'test-only-key'}:{},
    ...(body?{bodyJson:body}:{})};
  const res={
    json(data,status){captured.status=status;captured.data=data;return captured;},
    text(content,status){captured.status=status;captured.body=content;return captured;}
  };
  return handler({req,res,error:()=>{}});
}
test('Unauthenticated user cannot enumerate projects',async()=>{
  global.fetch=mockFetch;
  const r=await call('GET','/api/projects',null,false);
  assert.equal(r.status,401);
});
test('Only a granted research project is visible',async()=>{
  global.fetch=mockFetch;
  const r=await call('GET','/api/projects');
  assert.equal(r.status,200);
  assert.deepEqual(r.data.projects.map(p=>p.id),['solar_intelligence']);
});
test('Cross-project access is rejected before Notion retrieval',async()=>{
  global.fetch=mockFetch;
  const r=await call('POST','/api/tool',{op:'list_children',projectId:'another_project',args:{parent_id:inRoot}});
  assert.equal(r.status,403);
});
test('Allowed research root is readable',async()=>{
  global.fetch=mockFetch;
  const r=await call('POST','/api/tool',{op:'list_children',projectId:'solar_intelligence',args:{parent_id:inRoot}});
  assert.equal(r.status,200);
  assert.deepEqual(r.data.result.results,[]);
});
test('Out-of-scope Notion page is blocked',async()=>{
  global.fetch=mockFetch;
  const r=await call('POST','/api/tool',{op:'list_children',projectId:'solar_intelligence',args:{parent_id:outOfScope}});
  assert.equal(r.status,403);
});
test('Project viewer cannot invoke write',async()=>{
  global.fetch=mockFetch;
  process.env.ENABLE_WRITES='true';
  try{
    const r=await call('POST','/api/write',{projectId:'solar_intelligence',op:'create_page',confirm:'I AUTHORIZE THIS CHANGE',args:{parent_id:inRoot,title:'Blocked'}});
    assert.equal(r.status,403);
  }finally{process.env.ENABLE_WRITES='false';}
});
