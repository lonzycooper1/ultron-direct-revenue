// ULTRON compliant 1,000-prospect acquisition engine.
// Targets public/permissioned B2B prospects and generates individualized drafts.
// It deliberately does NOT scrape private personal data or auto-send unsolicited mail.

export const PROSPECT_MISSION=Object.freeze({
  targetDistinctProspects:1000,
  mode:'public-or-permissioned-b2b-prospecting',
  channels:['public business websites','public business directories','owned Instagram audience signals','permissioned CRM contacts','referrals/partners'],
  prohibited:['private-contact scraping','purchased/leaked lists','fake identities','bulk unsolicited spam','ignoring opt-outs','misleading personalization'],
  contactPreference:['published business role inbox','published work email','contact form','existing CRM contact with lawful basis'],
  sending:'draft-first; external sending remains approval/compliance gated'
});

export const TARGET_VERTICALS=Object.freeze([
  {id:'home-services',label:'Home services',pains:['missed calls','slow quote follow-up','appointment scheduling','estimate handoff']},
  {id:'professional-services',label:'Professional services',pains:['lead intake','qualification','proposal follow-up','client onboarding']},
  {id:'dental-medspa',label:'Dental / med spa',pains:['appointment intake','missed-call recovery','no-show reduction','lead follow-up']},
  {id:'legal',label:'Law firms',pains:['intake','lead qualification','consult scheduling','follow-up']},
  {id:'real-estate',label:'Real estate teams',pains:['lead routing','speed-to-lead','showing coordination','follow-up']},
  {id:'auto-services',label:'Auto services',pains:['missed calls','estimate requests','appointment scheduling','status updates']},
  {id:'agencies',label:'Marketing / creative agencies',pains:['lead qualification','client reporting','delivery capacity','white-label automation']},
  {id:'healthcare-nonemergency',label:'Non-emergency healthcare practices',pains:['inquiry routing','appointment requests','follow-up','admin workflow']},
  {id:'retail-ecommerce',label:'Retail / ecommerce',pains:['customer support','product discovery','abandoned checkout','content operations']},
  {id:'b2b-software',label:'B2B software / SaaS',pains:['inbound qualification','demo routing','support triage','customer success workflows']}
]);

export const TARGET_METROS=Object.freeze([
  'Houston TX','Dallas-Fort Worth TX','Austin TX','San Antonio TX','Atlanta GA',
  'Miami-Fort Lauderdale FL','Tampa Bay FL','Orlando FL','Phoenix AZ','Las Vegas NV',
  'Los Angeles CA','San Diego CA','San Francisco Bay Area CA','Denver CO','Chicago IL',
  'New York NY','Philadelphia PA','Charlotte NC','Nashville TN','Seattle WA'
]);

export function targetingMatrix(){
  const rows=[];
  let n=0;
  for(const metro of TARGET_METROS){
    for(const vertical of TARGET_VERTICALS){
      for(let slot=1;slot<=5;slot++){
        n++;
        rows.push({
          slot:n,metro,verticalId:vertical.id,vertical:vertical.label,slotWithinSegment:slot,
          pains:vertical.pains,
          searchIntent:`${vertical.label} in ${metro} with public website and active lead/customer intake`,
          requiredEvidence:['public business identity','public or permissioned contact path','observable workflow fit'],
          status:'needs-enrichment'
        });
      }
    }
  }
  return rows;
}

function clean(v,max=500){return String(v??'').replace(/\s+/g,' ').trim().slice(0,max)}
export function scoreProspect(p={}){
  const publicContact=Boolean(p.publicBusinessEmail||p.contactFormUrl||p.permissionedContact);
  const painMatch=Math.max(0,Math.min(1,Number(p.painMatch)||0));
  const activeBusiness=Math.max(0,Math.min(1,Number(p.activeBusiness)||0));
  const digitalGap=Math.max(0,Math.min(1,Number(p.digitalGap)||0));
  const buyerFit=Math.max(0,Math.min(1,Number(p.buyerFit)||0));
  const score=+(painMatch*.35+buyerFit*.30+activeBusiness*.20+digitalGap*.15).toFixed(3);
  return {
    score,
    qualified:publicContact&&score>=0.62,
    publicContact,
    tier:score>=.82?'A':score>=.70?'B':score>=.62?'C':'D'
  };
}

export function personalizedEmailDraft(p={}){
  const s=scoreProspect(p);
  if(!s.qualified)throw Error('prospect is not qualified or lacks a public/permissioned contact path');
  const company=clean(p.companyName,120),person=clean(p.contactFirstName,80),pain=clean(p.primaryPain||'lead follow-up',180);
  const observation=clean(p.publicObservation||'your business appears to rely on timely customer follow-up',320);
  const offer=p.recommendedOffer||'ai-revenue-audit-500';
  const offerMap={
    'ai-revenue-audit-500':{name:'AI Revenue Leak Audit',price:'$500',cta:'I can send a one-page outline showing exactly what the audit would cover for your workflow.'},
    'ai-automation-sprint-2500':{name:'AI Automation Sprint',price:'$2,500',cta:'I can send a scoped one-workflow implementation outline with acceptance criteria.'},
    'ai-revenue-ops-7500':{name:'AI Revenue Operations Build',price:'$7,500',cta:'I can send a concise implementation map for intake, qualification, follow-up and measurement.'},
    'ai-business-os-10000':{name:'AI Business OS Implementation',price:'$10,000',cta:'I can send a scoped architecture and implementation outline for one defined business workflow.'}
  };
  const o=offerMap[offer]||offerMap['ai-revenue-audit-500'];
  const first=person?person:'there';
  const subject=`${company}: idea to improve ${pain}`;
  const body=[
    `Hi ${first},`,
    '',
    `I was looking at ${company} and noticed ${observation}. I work on AI-assisted business workflows focused on problems like ${pain}.`,
    '',
    `Rather than pitching a generic AI package, I’d start with a fixed-scope ${o.name} (${o.price}) to map the current workflow, identify measurable friction, and show which automation opportunities are worth implementing first.`,
    '',
    o.cta,
    '',
    'If this is not relevant, reply “no thanks” and I will not follow up.',
    '',
    'Best,',
    'ULTRON / AI Market'
  ].join('\n');
  return {
    to:p.publicBusinessEmail||null,
    contactFormUrl:p.publicBusinessEmail?null:(p.contactFormUrl||null),
    subject,body,
    personalization:{
      company,contactFirstName:person||null,primaryPain:pain,publicObservation:observation,
      evidenceSource:clean(p.evidenceSource||'',500)
    },
    compliance:{
      draftOnly:true,optOutIncluded:true,privateDataUsed:false,
      sourceType:p.permissionedContact?'permissioned-contact':'public-business-contact'
    }
  };
}

export function prospectMissionStatus(enriched=[]){
  const qualified=enriched.filter(p=>{try{return scoreProspect(p).qualified}catch{return false}});
  const drafted=qualified.filter(p=>p.draftGeneratedAt||p.emailDraft);
  const suppressed=enriched.filter(p=>p.optedOut||p.suppressed);
  return {
    target:PROSPECT_MISSION.targetDistinctProspects,
    enriched:enriched.length,
    qualified:qualified.length,
    drafted:drafted.length,
    suppressed:suppressed.length,
    remainingToEnrich:Math.max(0,1000-enriched.length),
    remainingToDraft:Math.max(0,1000-drafted.length),
    matrixSlots:targetingMatrix().length,
    sending:'not autonomous'
  };
}
