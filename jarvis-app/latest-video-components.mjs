// Components reconstructed from the most recent user-provided reel.
// Visual/payment claims are treated as inspiration; external opportunities must be verified.

export const CREATOR_OPPORTUNITY_COMPONENTS=Object.freeze({
  version:'1.0.0',
  source:'most-recent-uploaded-reel',
  components:[
    {
      id:'opportunity-feed',
      name:'Paid Opportunity Feed',
      fields:['title','brandOrProgram','workType','minPayoutUsd','maxPayoutUsd','requirements','deadline','sourceUrl','verificationStatus','fitScore'],
      categories:['contract','reaction','auto-edit','ugc','software-demo','affiliate','sponsorship'],
      rule:'Never present a payout as guaranteed; store source and verification status.'
    },
    {
      id:'fit-matcher',
      name:'Opportunity Fit Matcher',
      inputs:['creator capabilities','portfolio evidence','audience fit','deadline','required deliverables'],
      outputs:['fitScore','missingRequirements','recommendedProof','applicationPriority']
    },
    {
      id:'proof-builder',
      name:'Portfolio / Proof Builder',
      outputs:['sample brief','demo script','mock deliverable plan','case-study template','proof checklist'],
      rule:'Use truthful demos and clearly label mock/spec work.'
    },
    {
      id:'application-queue',
      name:'Authorized Application Queue',
      states:['discovered','verified','qualified','drafted','awaiting-user-authorization','submitted','won','lost'],
      rule:'No impersonation, fake credentials, fake audience metrics or unauthorized submissions.'
    },
    {
      id:'night-build-queue',
      name:'Autonomous Software Build Queue',
      stages:['pain brief','requirements','architecture','independent source generation','tests','security review','preview','deployment gate','measurement'],
      rule:'JARVIS may autonomously build and test software, but external publishing, purchases and consequential actions remain permission-gated.'
    }
  ]
});

const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
export function scoreCreatorOpportunity(input={}){
  const proof=clamp(input.proofFit),skills=clamp(input.skillFit),audience=clamp(input.audienceFit),urgency=clamp(input.deadlineFit),trust=clamp(input.sourceTrust);
  const fit=+(proof*.25+skills*.30+audience*.15+urgency*.10+trust*.20).toFixed(3);
  return {
    fitScore:fit,
    priority:fit>=.8?'high':fit>=.6?'medium':'low',
    verifiedPayoutOnly:Boolean(input.payoutVerified),
    recommendation:fit>=.8?'prepare-authorized-application':fit>=.6?'build-missing-proof':'skip-or-research'
  };
}

export function createBuildQueueItem({goal='',buyerProblem='',acceptanceCriteria=[]}={}){
  return {
    id:'build-'+crypto.randomUUID(),
    createdAt:new Date().toISOString(),
    goal:String(goal).slice(0,1000),
    buyerProblem:String(buyerProblem).slice(0,2000),
    acceptanceCriteria:(acceptanceCriteria||[]).slice(0,20).map(x=>String(x).slice(0,500)),
    stages:CREATOR_OPPORTUNITY_COMPONENTS.components.find(x=>x.id==='night-build-queue').stages.map((name,i)=>({index:i,name,status:i===0?'ready':'queued'})),
    externalDeployment:'approval-or-existing-authorized-pipeline',
    revenueClaim:'none'
  };
}
