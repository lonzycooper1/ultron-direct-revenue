/** Stop HTTP admission and drain in-flight work; unfinished durable leases remain for reconciliation. */
export function attachShutdown(server,{beforeClose=()=>{},drain=async()=>{},timeoutMs=25000,signals=process,exit=code=>process.exit(code),log=message=>console.log(JSON.stringify(message))}={}){
 let stopping=false;
 const shutdown=async signal=>{
  if(stopping)return;stopping=true;log({event:'service.shutdown',phase:'draining',signal});
  const deadline=setTimeout(()=>{log({event:'service.shutdown',phase:'deadline',unfinishedWork:'REQUIRES_DURABLE_RECONCILIATION'});server.closeAllConnections?.();exit(0)},timeoutMs);deadline.unref?.();
  try{await beforeClose();await Promise.all([new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve())),drain()]);clearTimeout(deadline);log({event:'service.shutdown',phase:'drained'});exit(0)}catch{clearTimeout(deadline);log({event:'service.shutdown',phase:'failed',unfinishedWork:'REQUIRES_DURABLE_RECONCILIATION'});exit(1)}
 };
 signals.once('SIGTERM',()=>shutdown('SIGTERM'));signals.once('SIGINT',()=>shutdown('SIGINT'));return {shutdown,isStopping:()=>stopping};
}
