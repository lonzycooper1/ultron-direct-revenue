import {mutateJson,getJson} from './state-store.mjs';

const KEY='acquisition-leads-v1';
const NICHES=Object.freeze({
  hvac:{label:'HVAC',headline:'Stop losing HVAC jobs to slow lead response',pain:'missed calls, after-hours inquiries and quote follow-up',offer:'missed-lead-recovery-99'},
  plumbing:{label:'Plumbing',headline:'Turn missed plumbing calls into booked follow-up',pain:'emergency calls, missed inquiries and estimate follow-up',offer:'missed-lead-recovery-99'},
  roofing:{label:'Roofing',headline:'Recover roofing leads that fall between inspection and follow-up',pain:'inspection requests, storm leads and estimate follow-up',offer:'ai-revenue-audit-500'},
  medspa:{label:'Med Spa',headline:'Reduce lead and booking drop-off for med spa inquiries',pain:'inquiry response, consultation scheduling and no-show follow-up',offer:'ai-revenue-audit-500'},
  auto:{label:'Auto Repair',headline:'Convert more repair inquiries into scheduled appointments',pain:'missed calls, estimate requests and appointment scheduling',offer:'missed-lead-recovery-99'},
  services:{label:'Local Services',headline:'Find where customer inquiries are leaking before they book',pain:'lead intake, response speed, qualification and follow-up',offer:'ai-revenue-audit-500'}
});
const clean=(v,max=500)=>String(v??'').replace(/[\u0000-\u001F]/g,' ').trim().slice(0,max);
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));

export function nicheConfig(id='services'){return NICHES[id]||NICHES.services}
export function nicheIds(){return Object.keys(NICHES)}
export function scoreResponseGap(input={}){
  const leads=clamp(input.monthlyLeads,0,100000);
  const missed=clamp(input.missedCallRate,0,100);
  const response=clamp(input.responseMinutes,0,10080);
  const followup=String(input.followup||'').toLowerCase();
  let score=0;
  if(leads>=20)score+=15;if(leads>=50)score+=10;if(leads>=100)score+=10;
  if(missed>=10)score+=15;if(missed>=20)score+=15;
  if(response>5)score+=10;if(response>30)score+=10;if(response>240)score+=10;
  if(/manual|inconsistent|none|no/.test(followup))score+=10;
  score=Math.min(100,score);
  const severity=score>=70?'high':score>=40?'medium':'low';
  const recommendation=severity==='high'
    ?'Start with a fixed-scope Revenue Leak Audit, then implement the single highest-impact response or follow-up workflow.'
    :severity==='medium'
      ?'Start with the Missed-Lead Recovery System and measure response-to-booking performance for 30 days.'
      :'Keep the current process, add a response-time KPI, and test one low-risk follow-up improvement before buying more software.';
  return {score,severity,recommendation};
}
export async function captureLead(input={}){
  const email=clean(input.email,254).toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('valid business email required');
  const niche=Object.hasOwn(NICHES,input.niche)?input.niche:'services';
  const gap=scoreResponseGap(input);
  const lead={
    id:'lead-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),
    createdAt:new Date().toISOString(),
    company:clean(input.company,160),
    email,niche,
    monthlyLeads:clamp(input.monthlyLeads,0,100000),
    missedCallRate:clamp(input.missedCallRate,0,100),
    responseMinutes:clamp(input.responseMinutes,0,10080),
    followup:clean(input.followup,120),
    notes:clean(input.notes,1000),
    source:clean(input.source||('free-response-gap-scan:'+niche),180),
    score:gap.score,severity:gap.severity,status:'new'
  };
  await mutateJson(KEY,{leads:[]},s=>{s.leads=s.leads||[];s.leads.unshift(lead);s.leads=s.leads.slice(0,5000)});
  return {leadId:lead.id,...gap,niche:nicheConfig(niche)};
}
export async function leadSummary(){
  const s=await getJson(KEY,{leads:[]}),leads=s.leads||[];
  return {
    total:leads.length,
    new:leads.filter(x=>x.status==='new').length,
    high:leads.filter(x=>x.severity==='high').length,
    medium:leads.filter(x=>x.severity==='medium').length,
    byNiche:Object.fromEntries(nicheIds().map(id=>[id,leads.filter(x=>x.niche===id).length]))
  };
}
export async function listLeads(limit=100){
  const s=await getJson(KEY,{leads:[]});
  return (s.leads||[]).slice(0,Math.max(1,Math.min(500,Number(limit)||100)));
}
export function acquisitionManifest(){
  return {
    version:'1.0.0',
    funnel:'high-intent niche page -> free response-gap scan -> qualified lead capture -> matched offer -> PayPal checkout -> verified fulfillment',
    niches:NICHES,
    qualification:['active business','real inbound lead flow','observable response/follow-up friction','business email voluntarily submitted or public business contact for targeted outreach'],
    channels:['owned SEO','authorized social','small personalized B2B outreach','referrals','buyer-intent communities where promotion is permitted'],
    prohibited:['bulk unsolicited spam','fake reviews','fake traffic','private-contact scraping','fabricated urgency','guaranteed revenue']
  };
}
