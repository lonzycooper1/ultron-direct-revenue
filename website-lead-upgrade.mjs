// ULTRON Website + Lead Conversion Upgrade — productized service factory.
// Produces an original audit/demo specification from public business facts.
export const WEBSITE_LEAD_UPGRADE=Object.freeze({
 id:'website-lead-conversion-upgrade',
 name:'AI Website + Lead Conversion Upgrade',
 currency:'USD',
 price:299,
 delivery:'digital audit + conversion blueprint + landing-page specification after verified payment',
 targetBuyers:['local service businesses','professional services','home services','auto services','beauty and wellness','independent retailers'],
 promise:'Identify measurable website and lead-conversion friction and deliver an original implementation-ready upgrade plan.',
 rules:['public-business-information-only','no fabricated claims','no fake reviews','no spam','verified-payment-only','original-output-only']
});

function clean(v){return String(v??'').trim()}
function uniq(xs){return [...new Set(xs.filter(Boolean))]}
export function qualifyProspect(input={}){
 const business=clean(input.businessName), website=clean(input.website), category=clean(input.category)||'local business';
 if(!business) throw Error('businessName required');
 const observations=uniq((input.observations||[]).map(clean)).slice(0,12);
 const signals={hasWebsite:!!website,observationCount:observations.length,hasBooking:!!input.hasBooking,hasClearCTA:!!input.hasClearCTA,hasLeadForm:!!input.hasLeadForm,hasMobileIssue:!!input.hasMobileIssue};
 let score=20+(website?10:0)+(observations.length*5)+(input.hasMobileIssue?15:0)+(!input.hasClearCTA?15:0)+(!input.hasLeadForm?10:0)+(!input.hasBooking?5:0);
 score=Math.max(0,Math.min(100,score));
 return {business,website,category,observations,signals,score,qualified:score>=45};
}

export function buildUpgradeAudit(input={}){
 const q=qualifyProspect(input);
 const findings=[];
 if(!q.signals.hasClearCTA)findings.push({priority:'high',issue:'Primary call-to-action is absent or unclear',fix:'Use one dominant action above the fold and repeat it at decision points.',metric:'CTA click-through rate'});
 if(!q.signals.hasLeadForm)findings.push({priority:'high',issue:'No obvious low-friction lead capture',fix:'Add a short lead form asking only for information required to respond.',metric:'visitor-to-lead conversion rate'});
 if(!q.signals.hasBooking)findings.push({priority:'medium',issue:'No obvious direct booking path',fix:'Add a booking path when the business can operationally support appointments.',metric:'qualified bookings'});
 if(q.signals.hasMobileIssue)findings.push({priority:'high',issue:'Observed mobile conversion friction',fix:'Prioritize mobile speed, readable hierarchy, tap targets and persistent contact action.',metric:'mobile conversion rate'});
 for(const observation of q.observations)findings.push({priority:'review',issue:observation,fix:'Validate the observation against the live site, then address it with the smallest measurable change.',metric:'before/after conversion evidence'});
 if(!findings.length)findings.push({priority:'review',issue:'No specific conversion defect supplied yet',fix:'Run baseline CTA, form, mobile, trust and speed review before proposing changes.',metric:'baseline conversion funnel'});
 return {type:'ULTRON_WEBSITE_LEAD_UPGRADE',offer:WEBSITE_LEAD_UPGRADE,prospect:q,deliverables:{executiveAudit:findings,landingPageSpec:['Outcome-focused hero','single primary CTA','proof/trust section','service/value section','friction-reducing FAQ','short lead form','mobile-first contact path'],leadFlow:['capture','validate','route','respond','follow-up','measure'],measurement:['visitors','CTA clicks','leads','qualified leads','bookings','conversion rate']},acceptanceCriteria:['All factual claims are verified by the business before publication','No copied proprietary page/source code','Primary CTA and lead path work on mobile','Analytics events defined for CTA and lead submission','Customer approves brand/legal claims before production publishing'],generatedAt:new Date().toISOString()};
}

export function buildPersonalizedPreview(input={}){
 const audit=buildUpgradeAudit(input), p=audit.prospect;
 return {business:p.business,headline:`Conversion upgrade plan for ${p.business}`,summary:`We found ${audit.deliverables.executiveAudit.length} items worth validating in the current ${p.category} lead journey. The upgrade focuses on making the next action clearer, reducing lead-capture friction and measuring the result.`,topFindings:audit.deliverables.executiveAudit.slice(0,3),offer:{name:WEBSITE_LEAD_UPGRADE.name,price:WEBSITE_LEAD_UPGRADE.price,currency:'USD'},disclaimer:'Preview is based only on supplied/public observations. Findings must be validated before making factual claims or production changes.'};
}
