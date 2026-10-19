// ULTRON v44 fail-closed queue admission. API billing controls remain the
// actual money limit; reservations cannot be mistaken for provider invoices.
export function budgetPolicy(env=process.env){
 const read=(key,def,min,max)=>{const raw=env[key];const n=raw==null?def:Number(raw);return Number.isSafeInteger(n)&&n>=min&&n<=max?n:def};
 const dailyTokens=read('ULTRON_EXECUTIVE_DAILY_TOKEN_CAP',100000,20000,1000000);
 const reservationTokens=read('ULTRON_EXECUTIVE_TOKEN_RESERVATION',20000,1000,50000);
 const firstUtcHour=read('ULTRON_EXECUTIVE_WINDOW_START_UTC',0,0,23);
 const lastUtcHour=read('ULTRON_EXECUTIVE_WINDOW_END_UTC',24,1,24);
 return {dailyTokens,reservationTokens,firstUtcHour,lastUtcHour,
  monetaryHardCap:'PROVIDER_ACCOUNT_BILLING_REQUIRED',
  financialActions:'HUMAN_APPROVAL_ONLY'};
}
export function admission(usage={},env=process.env,at=new Date()){
 const p=budgetPolicy(env);const hour=at.getUTCHours();
 const within=p.firstUtcHour<p.lastUtcHour?hour>=p.firstUtcHour&&hour<p.lastUtcHour
  :hour>=p.firstUtcHour||hour<p.lastUtcHour;
 if(!within)return {allowed:false,reason:'OUTSIDE_EXECUTION_WINDOW',policy:p};
 const reserved=Math.max(0,Number(usage.reservedTokens)||0);
 if(reserved+p.reservationTokens>p.dailyTokens)return {allowed:false,reason:'DAILY_TOKEN_RESERVATIONS_EXHAUSTED',policy:p};
 return {allowed:true,reason:'BOUNDED_QUEUE_ADMISSION',policy:p};
}
export function observedTokens(...results){
 return results.reduce((sum,result)=>{
  const u=result?.usage||{};
  const n=Number(u.total_tokens??u.input_tokens+u.output_tokens);
  return sum+(Number.isFinite(n)&&n>=0?Math.ceil(n):0);
 },0);
}
