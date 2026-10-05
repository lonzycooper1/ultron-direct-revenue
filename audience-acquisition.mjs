// ULTRON Audience Acquisition — target 1,000 distinct qualified prospects without bulk unsolicited spam.
export const ACQUISITION_RULES=Object.freeze({
 targetDistinctProspects:1000,
 channels:['owned SEO pages','authorized social accounts','permissioned email','affiliate/referral partners','communities where promotion is allowed','direct response to explicit buyer-intent posts'],
 requirePersonalization:true,
 prohibited:['purchased or leaked email lists','bulk unsolicited spam','fake identities','fake engagement','deceptive urgency','scraping private contact data','ignoring opt-outs'],
 metrics:['distinctQualifiedProspects','qualifiedVisits','replies','checkoutStarts','verifiedPurchases','unsubscribeRate','complaintRate']
});

const SEGMENTS=Object.freeze([
 {id:'ai-starter',need:'people asking how to start an AI-enabled business',offer:'starter playbooks and prompt/workflow kits',priceBand:'$1-$100'},
 {id:'solo-operator',need:'solo operators trying to automate repetitive work',offer:'automation maps, SOPs and agent workflows',priceBand:'$25-$500'},
 {id:'local-business',need:'local businesses losing leads or appointments',offer:'lead intake, follow-up and booking systems',priceBand:'$50-$1,500'},
 {id:'creator',need:'creators who need repeatable content systems',offer:'content research, scripts, media briefs and publishing systems',priceBand:'$25-$1,000'},
 {id:'agency',need:'agencies needing delivery scale',offer:'white-label automation, research and implementation kits',priceBand:'$250-$5,000'},
 {id:'enterprise',need:'teams needing custom AI operating systems',offer:'custom systems blueprint and implementation sprint',priceBand:'$2,500-$10,000'}
]);

export function acquisitionPlan({target=1000}={}){
 const t=Math.max(1,Math.min(10000,Number(target)||1000));
 return {targetDistinctProspects:t,segments:SEGMENTS,rules:ACQUISITION_RULES,
 stages:['discover public buyer intent','deduplicate identity/company','qualify actual problem','match offer and budget','prepare personalized message or content','publish/send only through authorized lawful channel','route to relevant product page','measure response and verified purchase','suppress opt-outs','reallocate effort to converting segment'],
 allocation:SEGMENTS.map((s,i)=>({...s,target:Math.floor(t/SEGMENTS.length)+(i<t%SEGMENTS.length?1:0)})),
 status:'active-research-and-permissioned-acquisition'};
}

export function outreachDraft({firstName='there',problem='a business workflow you are trying to improve',company='your business',url='https://ultron-direct-revenue-production.up.railway.app/market'}={}){
 return {subject:`A practical AI resource for ${company}`,body:`Hi ${firstName},\n\nI noticed ${problem}. ULTRON AI Market has practical AI-assisted resources and implementation systems across startup, content, sales, automation, commerce, research, productivity and AI-agent workflows, with options from $1 through $10,000.\n\nIf it is relevant, I can point you to one resource matched to the exact problem rather than send a generic pitch.\n\n${url}\n\nBest,\nHunter`,rule:'send only where contact is lawful/permissioned and personalize from real context'};
}
