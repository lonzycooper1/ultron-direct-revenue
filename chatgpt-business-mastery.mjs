// ULTRON ChatGPT Business Mastery Engine
// Encodes repeatable patterns from documented ChatGPT-assisted businesses.
// Revenue claims are evidence-labeled and never treated as guarantees.

export const OWNER_OPERATING_CONTRACT = Object.freeze({
  version:'2026-10-05',
  stretchObjective:{
    verifiedRevenueUsd:1_000_000_000_000,
    deadline:'2027-04-05',
    horizon:'6 months',
    classification:'owner-defined stretch objective, not a forecast or guarantee'
  },
  priorValidationObjective:{
    verifiedRevenueUsd:1_900_000,
    horizonDays:60,
    classification:'earlier owner-defined milestone retained for progress comparison'
  },
  executionStyle:[
    'complete authorized reversible work without repeated routine questions',
    'optimize for the shortest legitimate path to unrelated paying customers',
    'count revenue only after verified external payment',
    'measure conversion, retention, margin, refunds and fulfillment quality',
    'use real buyer feedback to decide what to build next',
    'prefer reusable systems over one-off manual work'
  ],
  approvalBoundaries:[
    'login or MFA that only the owner can complete',
    'identity verification or legal acceptance',
    'banking or payout authorization',
    'secret/credential entry when not already configured',
    'real-money crypto order execution requires one-order explicit human approval',
    'other irreversible or consequential external actions when authorization is required'
  ],
  prohibited:[
    'fabricated revenue','fake customers','fake reviews','spam','phishing','credential theft',
    'deceptive claims','counterfeit content','market manipulation','autonomous real-money trading'
  ]
});

export const CHATGPT_BUSINESS_CASES = Object.freeze([
  {
    id:'mitts',
    company:'Mitts',
    founders:['Lee Kojanis','Daniele Orellana'],
    type:'physical consumer product',
    evidenceLevel:'documented revenue + current operating storefront',
    documentedEconomics:{
      launched:'2024-11',
      earlyRevenueUsd:15000,
      earlyWindow:'about three months after launch',
      projected2025SalesUsd:75000,
      currentObservedOffers:['Starter Kitt $18-$25','Three-Up $21','Dinner Party Bundle $43','Re-Up $8'],
      recurringMechanic:'replaceable sponge refills; average replacement guidance about every 3 months',
      channels:['direct ecommerce','retail/wholesale','press/editorial','email']
    },
    startToFinish:[
      'experienced a painful personal problem: fragile wine glasses breaking during cleaning',
      'began market research immediately after identifying the idea',
      'contacted more than five engineering firms and selected a specialist',
      'iterated prototypes for several months',
      'tested with likely users such as wine enthusiasts and bartenders before scaling',
      'filed a utility patent after design validation',
      'used outside branding help for name, identity and packaging',
      'used ChatGPT for CPG questions and much of go-to-market strategy',
      'launched, hit fulfillment delays, directly communicated with affected buyers and learned from failure',
      'expanded with refills, bundles, retail/wholesale and editorial proof'
    ],
    reusableLessons:[
      'start from costly pain, not from a generic AI idea',
      'validate prototypes with target users before scaling inventory',
      'design replenishment and bundles into the product',
      'convert rejection into structured feedback',
      'build launch buffers and fulfillment readiness before promotion',
      'use third-party proof and retail expansion after product-market evidence'
    ]
  },
  {
    id:'data',
    company:'DATA / HeyDATA',
    founder:'Steve Moraco',
    type:'AI assistant / agent platform',
    evidenceLevel:'third-party documented MRR + founder operating history + current product',
    documentedEconomics:{
      replitReportedMrrUsd:18000,
      replitReportedPaidSubscribers:800,
      replitReportedImpressions:'100k+',
      founderLaunchDate:'2023-04-02',
      launchPrice:'$30/month or $300/year',
      laterEarlyPricing:'$39 minimum / $89 suggested',
      currentCreatorPricing:['$99/month','$499/month'],
      currentTeamOffer:'DATA Partners',
      churnHistory:['~20% challenge in 2023','founder later describes ~2% churn by summer 2024']
    },
    startToFinish:[
      'founder used AI to teach himself coding in 2022-2023',
      'built a narrow wedge: replace/augment Siri with persistent ChatGPT access',
      'launched with 20+ iOS shortcuts, memory and a simple subscription',
      'iterated weekly from user feedback instead of waiting for a perfect platform',
      'added automation, voice, memory, calendar and API integrations',
      'created a creator marketplace for reusable skills/shortcuts',
      'used analytics and newsletter exposure to understand traffic spikes',
      'treated churn as a primary product problem and improved onboarding/support/value',
      'expanded from single-user assistant to cross-platform, multi-model and team plans',
      'monetized both access and an ecosystem of reusable capabilities'
    ],
    reusableLessons:[
      'sell a persistent job-to-be-done, not raw model access',
      'ship a small useful wedge fast and expand from real usage',
      'make capabilities modular and reusable as skills',
      'track churn as aggressively as acquisition',
      'raise ARPU through tiers and teams only after utility exists',
      'make the system model-agnostic and cross-platform',
      'build distribution loops around demos, newsletters and creator/community participation'
    ]
  },
  {
    id:'butler',
    company:'Butler',
    founder:'Elizabeth Rider',
    type:'consumer subscription software',
    evidenceLevel:'live paid app + first-party build history; public revenue not found',
    documentedEconomics:{
      audienceBeforeProduct:['2M readers over prior business history','60k newsletter subscribers','10k+ healthy-eating program participants'],
      firstVersionBuildTime:'12 weeks',
      secondVersionTiming:'three months later',
      earlyTesters:'100+',
      currentPricing:['$9.99/month','$49/year'],
      currentDistribution:['iPhone','Android','web presence'],
      googlePlayObservedDownloads:'1K+'
    },
    startToFinish:[
      'spent years building expertise and audience in healthy cooking',
      'identified an implementation problem rather than an information problem: dinner logistics',
      'personally tested competing meal-planning apps and documented friction',
      'designed around existing user behavior: saved/familiar recipes rather than forcing unfamiliar plans',
      'used ChatGPT for pricing models, growth models, app-store requirements and UI/UX exploration',
      'used a small human product team for implementation while compressing decision cycles with AI',
      'tested with 100+ people before broader launch',
      'bootstrapped rather than raising outside capital',
      'launched a paid subscription with monthly/annual options and cross-platform expansion'
    ],
    reusableLessons:[
      'domain expertise + existing audience sharply lowers distribution risk',
      'solve implementation/logistics, not merely information access',
      'study alternatives and remove their highest-friction steps',
      'use AI to compress product decisions before expensive engineering work',
      'beta-test before broad promotion',
      'pair monthly pricing with a discounted annual plan',
      'build around retained user data/context so utility compounds over time'
    ]
  },
  {
    id:'original-tamale',
    company:'The Original Tamale Co.',
    operator:'Christian Ortega',
    type:'existing family food business + internal/customer utility',
    evidenceLevel:'first-party documented workflow; no ChatGPT-attributed revenue figure',
    startToFinish:[
      'started with an already-proven business and an obvious customer friction: finding market locations',
      'defined a tiny tool with one useful job: searchable farmers-market locator',
      'used ChatGPT despite having no prior coding experience',
      'built and launched the tool the same afternoon',
      'used ChatGPT for social-content creation as well',
      'used AI to speed communication and operations without changing the core product'
    ],
    reusableLessons:[
      'look for friction adjacent to existing demand',
      'a tiny utility can improve conversion without becoming a standalone company',
      'speed matters when the problem and acceptance criteria are clear',
      'build customer-facing utilities that shorten the path from interest to purchase',
      'use content and tools together: attention plus conversion utility'
    ]
  },
  {
    id:'otm-careers',
    company:'On the Move Careers',
    founder:'Vaneese Johnson',
    type:'existing workforce strategy consultancy',
    evidenceLevel:'first-party workflow case + current operating consultancy; no ChatGPT-attributed revenue figure',
    documentedBusinessModel:{
      funnel:['book strategy session','receive customized proposal','build workforce roadmap'],
      focus:'workforce strategy, leadership pipelines, coaching and consulting'
    },
    startToFinish:[
      'operated a domain-expert consulting business before the ChatGPT workflow',
      'identified lead leakage after networking events because business cards were not consistently entered/followed up',
      'used ChatGPT and phone-camera input to turn business cards into structured leads',
      'created a follow-up tracking process instead of relying on memory',
      'connected lead capture to the existing consultative sales funnel',
      'continued productizing expertise through assessment, proposal and roadmap workflows'
    ],
    reusableLessons:[
      'revenue is often lost in follow-up rather than product quality',
      'capture leads at the moment of contact',
      'turn unstructured inputs into structured CRM records',
      'systematize next actions and follow-up cadence',
      'productize expert services into an assessment -> proposal -> implementation sequence',
      'AI should amplify domain expertise rather than replace proof of expertise'
    ]
  }
]);

export const MASTERY_PRINCIPLES = Object.freeze([
  {id:'pain-first',weight:16,question:'Does this solve a painful, specific, observable problem?'},
  {id:'proof-before-scale',weight:14,question:'Is there direct buyer/user evidence before significant build or promotion?'},
  {id:'speed-to-value',weight:12,question:'Can a useful version reach a buyer quickly?'},
  {id:'distribution-edge',weight:12,question:'Is there an owned, earned, partner or permissioned path to buyers?'},
  {id:'recurring-replenishment',weight:12,question:'Can value recur via subscription, repeat purchase, refill, support or expansion?'},
  {id:'retention-compounding',weight:10,question:'Does continued use create more context, convenience or switching value?'},
  {id:'feedback-loop',weight:8,question:'Can rejection, churn and usage data improve the next version?'},
  {id:'offer-ladder',weight:6,question:'Can buyers enter cheaply and expand into higher-value outcomes?'},
  {id:'unit-economics',weight:6,question:'Are fulfillment cost, gross margin and support load measurable?'},
  {id:'operational-readiness',weight:4,question:'Can payment, fulfillment and support work reliably before scale?'}
]);

const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
export function scoreOpportunity(input={}){
  const signals=input.signals||{};
  const map={
    'pain-first':signals.pain,
    'proof-before-scale':signals.proof,
    'speed-to-value':signals.speed,
    'distribution-edge':signals.distribution,
    'recurring-replenishment':signals.recurring,
    'retention-compounding':signals.retention,
    'feedback-loop':signals.feedback,
    'offer-ladder':signals.offerLadder,
    'unit-economics':signals.unitEconomics,
    'operational-readiness':signals.operations
  };
  const components=MASTERY_PRINCIPLES.map(p=>({id:p.id,weight:p.weight,value:clamp(map[p.id]),points:+(p.weight*clamp(map[p.id])).toFixed(2)}));
  const total=+components.reduce((s,x)=>s+x.points,0).toFixed(2);
  return {
    score:total,
    grade:total>=80?'A':total>=65?'B':total>=50?'C':'D',
    decision:total>=80?'scale-tested-channel':total>=65?'validate-and-improve':total>=50?'prototype-only':'do-not-prioritize',
    components
  };
}

export function buildRevenuePortfolio({verifiedRevenueUsd=0,completedOrders=0}={}){
  const r=Math.max(0,Number(verifiedRevenueUsd)||0),orders=Math.max(0,Number(completedOrders)||0);
  const stage=r>=10_000_000?'scale':r>=1_000_000?'enterprise':r>=100_000?'growth':r>=10_000?'repeatability':r>=1_000?'validation':orders>0?'first-customer':'pre-revenue';
  return {
    stage,
    objective:OWNER_OPERATING_CONTRACT.stretchObjective,
    truthRule:'Only externally verified captured payments count as revenue.',
    engines:[
      {
        id:'service-cash-engine',
        priority:stage==='pre-revenue'||stage==='first-customer'?'highest':'high',
        archetypes:['On the Move Careers','Mitts validation discipline'],
        motion:'diagnose a painful workflow -> paid audit/implementation -> measurable result -> case study -> referral/retainer',
        goal:'fastest path to meaningful verified cash with low upfront capital'
      },
      {
        id:'recurring-software-engine',
        priority:stage==='pre-revenue'?'medium':'highest',
        archetypes:['DATA','Butler'],
        motion:'narrow useful software -> paid users -> activation/retention measurement -> recurring plan -> team/annual expansion',
        goal:'build compounding recurring revenue and higher lifetime value'
      },
      {
        id:'utility-distribution-engine',
        priority:'high',
        archetypes:['Original Tamale Co.','Butler audience leverage'],
        motion:'free/useful tool or content -> capture explicit buyer intent -> route to relevant paid offer -> measure conversion',
        goal:'lower acquisition friction with utility before the sales ask'
      },
      {
        id:'catalog-replenishment-engine',
        priority:'medium',
        archetypes:['Mitts refills/bundles','DATA skill marketplace'],
        motion:'validated core offer -> complementary products/skills -> bundles/upgrades/repeat purchase',
        goal:'increase repeat purchase and average customer value without inventing demand'
      }
    ],
    milestoneLadder:[
      {name:'first unrelated paying customer',thresholdUsd:1,achieved:r>=1&&orders>=1},
      {name:'first $100 verified',thresholdUsd:100,achieved:r>=100},
      {name:'first $1K verified',thresholdUsd:1000,achieved:r>=1000},
      {name:'first $10K verified',thresholdUsd:10000,achieved:r>=10000},
      {name:'first $100K verified',thresholdUsd:100000,achieved:r>=100000},
      {name:'first $1M verified',thresholdUsd:1000000,achieved:r>=1000000},
      {name:'first $10M verified',thresholdUsd:10000000,achieved:r>=10000000},
      {name:'stretch objective',thresholdUsd:OWNER_OPERATING_CONTRACT.stretchObjective.verifiedRevenueUsd,achieved:r>=OWNER_OPERATING_CONTRACT.stretchObjective.verifiedRevenueUsd}
    ]
  };
}

export function interpretOwnerDirective(text=''){
  const raw=String(text||'').trim(),lower=raw.toLowerCase();
  return {
    raw:raw.slice(0,4000),
    wantsCompletion:/complete|finish|done|don't come back|do not come back/.test(lower),
    wantsAutonomy:/autonomous|self[- ]?sufficient|don't ask|do not ask|handle it|do everything/.test(lower),
    wantsRevenue:/revenue|money|sell|sales|customer|profit|paypal/.test(lower),
    wantsMastery:/master|learn|teach|capabilit|break down|analy/.test(lower),
    executionContract:{
      actWithoutRoutineQuestions:true,
      verifyBeforeClaimingComplete:true,
      preserveHumanApprovalForConsequentialActions:true,
      neverFabricateRevenue:true,
      optimizeForBuyerValueBeforeInventoryVolume:true
    }
  };
}

export function caseStudyMasteryManifest(){
  return {
    version:'1.0.0',
    status:'integrated',
    ownerOperatingContract:OWNER_OPERATING_CONTRACT,
    cases:CHATGPT_BUSINESS_CASES,
    principles:MASTERY_PRINCIPLES,
    coreRule:'ULTRON must learn the business mechanism, not copy the product or repeat unverified earnings claims.'
  };
}
