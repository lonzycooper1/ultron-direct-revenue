import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
import crypto from 'node:crypto';
import {invokeOpenAIOmni,planOmniTask,omniStatus} from './omni-runtime.mjs';

const PATH=process.env.JARVIS_CHAT_STATE_PATH||'/data/jarvis-chats.json';
const MAX_CHATS=100,MAX_MESSAGES=120,MAX_STORED_CHARS=12000;
let state=null,writeChain=Promise.resolve();

const clean=(v,max=MAX_STORED_CHARS)=>String(v??'').replace(/[\u0000-\u001F]/g,' ').trim().slice(0,max);
function seed(){return {version:'1.0.0',createdAt:new Date().toISOString(),chats:[]}}
async function persist(){
 const tmp=PATH+'.tmp',snap=JSON.stringify(state,null,2);
 writeChain=writeChain.then(async()=>{await mkdir(dirname(PATH),{recursive:true});await writeFile(tmp,snap,'utf8');await rename(tmp,PATH)});
 await writeChain;
}
export async function initChats(){
 if(state)return state;
 try{state=JSON.parse(await readFile(PATH,'utf8'))}catch{state=seed();await persist()}
 if(!Array.isArray(state.chats))state.chats=[];
 return state;
}
export async function createChat({title='New chat'}={}){
 await initChats();
 const chat={id:'chat-'+crypto.randomUUID(),title:clean(title,120)||'New chat',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),messages:[]};
 state.chats.unshift(chat);state.chats=state.chats.slice(0,MAX_CHATS);await persist();return chat;
}
export async function listChats(){
 await initChats();
 return state.chats.map(c=>({id:c.id,title:c.title,createdAt:c.createdAt,updatedAt:c.updatedAt,messageCount:c.messages.length,lastMessage:c.messages.at(-1)?.content?.slice(0,160)||''}));
}
export async function getChat(id){
 await initChats();const c=state.chats.find(x=>x.id===id);if(!c)throw Error('chat not found');return c;
}
export async function renameChat(id,title){
 const c=await getChat(id);c.title=clean(title,120)||c.title;c.updatedAt=new Date().toISOString();await persist();return c;
}
export async function deleteChat(id){
 await initChats();const i=state.chats.findIndex(x=>x.id===id);if(i<0)throw Error('chat not found');const [removed]=state.chats.splice(i,1);await persist();return {id:removed.id,deleted:true};
}
export async function sendChatMessage({chatId,prompt='',mode='auto',files=[],images=[],connectors=[],instructions=''}={}){
 await initChats();
 let chat=chatId?state.chats.find(x=>x.id===chatId):null;
 if(!chat)chat=await createChat({title:clean(prompt,80)||'New chat'});
 const userText=clean(prompt,24000);if(!userText)throw Error('prompt required');
 const history=chat.messages.slice(-24).filter(x=>['user','assistant'].includes(x.role)).map(x=>({role:x.role,content:x.content}));
 const plan=planOmniTask({prompt:userText,mode,connectors});
 if(!plan.canExecuteNow&&!omniStatus().openai.configured)throw Error('required capability is not configured');
 const userMessage={id:'msg-'+crypto.randomUUID(),role:'user',content:userText,createdAt:new Date().toISOString(),attachments:{files:(files||[]).length,images:(images||[]).length},mode:plan.mode};
 chat.messages.push(userMessage);chat.messages=chat.messages.slice(-MAX_MESSAGES);chat.updatedAt=new Date().toISOString();await persist();
 let result;
 try{
   result=await invokeOpenAIOmni({prompt:userText,mode:plan.mode,files,images,connectors,instructions,history});
 }catch(e){
   const failed={id:'msg-'+crypto.randomUUID(),role:'assistant',content:'Execution failed: '+clean(e?.message||e,1200),createdAt:new Date().toISOString(),status:'failed'};
   chat.messages.push(failed);chat.updatedAt=new Date().toISOString();await persist();throw e;
 }
 const assistantMessage={
   id:'msg-'+crypto.randomUUID(),role:'assistant',content:clean(result.text||'',MAX_STORED_CHARS),createdAt:new Date().toISOString(),status:result.status||'completed',
   model:result.model||null,provider:result.provider||null,
   toolSummary:{
     webSearchCalls:(result.webSearch||[]).length,
     approvalRequests:(result.approvalRequests||[]).length,
     images:(result.images||[]).length,
     codeInterpreterCalls:(result.codeInterpreter||[]).length,
     citations:(result.citations||[]).length
   }
 };
 chat.messages.push(assistantMessage);chat.messages=chat.messages.slice(-MAX_MESSAGES);chat.updatedAt=new Date().toISOString();
 if(chat.messages.filter(x=>x.role==='user').length===1)chat.title=clean(userText.replace(/\s+/g,' '),72)||chat.title;
 await persist();
 return {chatId:chat.id,plan,message:assistantMessage,result};
}
export function chatManifest(){
 return {version:'1.0.0',persistent:true,maxChats:MAX_CHATS,maxMessagesPerChat:MAX_MESSAGES,historyTurnsSentToModel:24,attachments:'current-turn image/file inputs supported; binary attachment data is not persisted in chat history'};
}
