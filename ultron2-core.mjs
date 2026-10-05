const now=()=>new Date().toISOString();
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,Number(n)||0));
const clean=s=>String(s??'').trim();
export const ROLE_DEFINITIONS=Object.freeze({
 commander:{mission:'Decompose goals, assign work, resolve conflicts and verify outcomes',outputs:['plan','assignments','acceptance-criteria']},
 researcher:{mission:'Collect evidence, demand signals and constraints',outputs:['evidence','opportunities','risks']},
 productArchitect:{mission:'Turn validated demand into original products, tools and workflows',outputs:['brief','product-spec','prototype-plan']},
 critic:{mission:'Challenge assumptions, identify failure modes and improve candidates',outputs:['critique','revisions','rejection-reasons']},
 growth:{mission:'Create compliant acquisition experiments and prioritize channels',outputs:['campaigns','seo','creative-tests']},
 sales:{mission:'Convert qualified demand into clear offers and proposals',outputs:['offer','proposal','follow-up-plan']},
 fulfillment:{mission:'Deliver paid work only after verified payment',outputs:['delivery-plan','artifact-checklist']},
 analyst:{mission:'Measure funnel, revenue and experiment performance',outputs:['metrics','rankings','next-tests']},
 risk:{mission:'Block deceptive, unauthorized, unsafe or unverified actions',outputs:['approval','limits','blocks']},
 wizard:{mission:'Convert a conversation or objective into a persistent project graph',outputs:['project','tasks','skills','milestones']}
});
export const SKILL_GRAPH=Object.freeze({
 research:['market-research','competitor-analysis','customer-problem-mining','evidence-ranking'],
 product:['product-briefing','template-generation','workflow-design','micro-saas-specification','qa-review'],
 commerce:['offer-design','pricing-tests','paypal-checkout','verified-fulfillment','refund-policy'],
 growth:['seo','owned-content','short-form-creative','permissioned-social','affiliate-referrals','conversion-attribution'],
 operations:['project-planning','task-routing','progress-tracking','history','recovery'],
 intelligence:['knowledge-indexing','retrieval','multi-candidate-generation','adversarial-critique','strategy-correction'],
 markets:['market-data','technical-analysis','fundamental-analysis','news-sentiment','backtesting','paper-trading','portfolio-risk']
});
export function wizardFromConversation({title='ULTRON Project',objective='',constraints=[],inputs=[]}={}){
 const goal=clean(objective);if(!goal)throw Error('objective required');
 const id='proj-'+crypto.randomUUID();
 const milestones=[
  ['discover','Validate demand, evidence and constraints'],['design','Create multiple candidate solutions and critique them'],['build','Produce the selected product/workflow'],['commercialize','Connect offer, checkout and verified fulfillment'],['optimize','Measure results and adapt strategy']
 ].map(([key,name],i)=>({id:`${id}-${key}`,name,order:i+1,status:i===0?'ready':'blocked'}));
 return {id,title:clean(title).slice(0,120),objective:goal.slice(0,1000),constraints:constraints.map(String).slice(0,50),inputs:inputs.map(String).slice(0,100),skills:Object.values(SKILL_GRAPH).flat(),milestones,createdAt:now(),status:'active'};
}
export function generateCandidates({problem,audience='general',count=6}={}){
 const p=clean(problem);if(!p)throw Error('problem required');const n=Math.max(3,Math.min(12,Number(count)||6));
 const forms=['checklist','template pack','automation workflow','research report','micro-tool','implementation playbook','audit kit','planner','dashboard','script pack','decision framework','training kit'];
 return Array.from({length:n},(_,i)=>({id:`cand-${i+1}`,name:`${audience} ${forms[i%forms.length]} for ${p}`.slice(0,160),format:forms[i%forms.length],hypothesis:`Buyers with ${p} will pay for a faster, clearer way to achieve the outcome.`,status:'candidate'}));
}
export function critiqueCandidate(candidate,{evidenceStrength=.5,differentiation=.5,fulfillmentCost=.2,complianceRisk=.1}={}){
 const score=100*(.35*clamp(evidenceStrength)+.3*clamp(differentiation)+.2*(1-clamp(fulfillmentCost))+.15*(1-clamp(complianceRisk)));
 const risks=[];if(evidenceStrength<.45)risks.push('weak demand evidence');if(differentiation<.35)risks.push('low differentiation');if(fulfillmentCost>.65)risks.push('high fulfillment cost');if(complianceRisk>.35)risks.push('compliance review required');
 return {...candidate,score:Number(score.toFixed(1)),decision:score>=65&&complianceRisk<=.35?'ADVANCE':'REVISE',risks};
}
export function buildAcquisitionPlan({product,channels=['seo','owned-content','short-form-creative','permissioned-social','affiliate-referrals']}={}){
 const name=clean(product?.name||product||'offer');return {product:name,experiments:channels.map((channel,i)=>({id:`exp-${i+1}`,channel,status:'draft',successMetric:channel==='seo'?'qualified organic visits':channel==='affiliate-referrals'?'verified referred purchases':'qualified clicks to product page',guardrail:'No spam, fake traffic, fake reviews, impersonation or unauthorized messaging'})),createdAt:now()};
}
export function prospectToPaymentWorkflow({prospect,offer,amountUsd}={}){
 const amount=Number(amountUsd);if(!clean(prospect)||!clean(offer)||!Number.isFinite(amount)||amount<=0)throw Error('valid prospect, offer and amount required');
 return {prospect:clean(prospect),offer:clean(offer),amountUsd:Number(amount.toFixed(2)),steps:[
  {stage:'qualify',requires:'lawful source + relevant need'},{stage:'proposal',requires:'truthful scope, price and terms'},{stage:'checkout',requires:'buyer-initiated PayPal approval'},{stage:'verify-payment',requires:'provider-confirmed completed payment'},{stage:'fulfill',requires:'verified payment + delivery entitlement'},{stage:'attribute',requires:'source/campaign recorded'},{stage:'optimize',requires:'real outcome metrics only'}],accountingRule:'Only verified completed payments count as revenue'};
}
export function capabilityManifest(){return {version:'2.0',roles:ROLE_DEFINITIONS,skills:SKILL_GRAPH,systems:['AI Market','Project Wizard','Product Factory','Critic/Reviewer','Growth Engine','Sales Workflow','PayPal Verified Checkout','Fulfillment','Analytics','Market Intelligence','Trading Research (simulation/paper until separately authorized)'],safety:['verified-payments-only','permissioned-distribution','no fabricated results','no autonomous live trading']};}
