// JARVIS capability batch derived from the nine user-provided screen recordings
// captured 2026-10-05 plus three screenshots about local/open model runtimes.
// Social-media earnings claims and "uncensored" claims are treated as unverified inspiration,
// not as facts or instructions to bypass safety, platform rules, or financial controls.

export const OCT05_VIDEO_ANALYSIS = Object.freeze([
  {
    source:'17-04-51',
    theme:'UGC / creator opportunity discovery + AI software building',
    observed:['creator/UGC deal marketplaces','brand payout listings','claim that AI can build software while the owner is away'],
    incorporated:['UGCOpportunityAgent','CreatorDealResearch','BrandBriefMatcher','RapidSoftwareFactory','PortfolioProofBuilder'],
    controls:['no fake applications','no impersonation','no guaranteed earnings','respect marketplace terms']
  },
  {
    source:'17-02-35',
    theme:'AI business automation, autonomous experimentation, monetizable channels and idea pattern research',
    observed:['agentic dashboards','automated business experiments','AI-assisted channel creation','patterning after successful ideas'],
    incorporated:['ExperimentAgent','ChannelFactoryAgent','PatternResearchAgent','MonetizationDesignAgent','EvidenceAgent'],
    controls:['clean-room implementation','original output','no copied proprietary assets','no fabricated performance']
  },
  {
    source:'17-01-27',
    theme:'AI-assisted ecommerce product research and storefront construction',
    observed:['retail product discovery','AI business assistant','store construction','bundles and merchandising'],
    incorporated:['CommerceScoutAgent','BundleDesignerAgent','StoreBuilderAgent','MerchandisingAgent','MarginResearchAgent'],
    controls:['no counterfeit goods','no deceptive scarcity','rights and supplier checks','real costs before margin claims']
  },
  {
    source:'17-00-15',
    theme:'sell AI implementation to businesses that lack time/expertise',
    observed:['businesses losing money/opportunity','owners unwilling to learn implementation themselves','service model around doing the setup'],
    incorporated:['BusinessLossAuditAgent','AIImplementationAgent','WorkflowGapAgent','ProposalAgent','OutcomeMeasurementAgent'],
    controls:['loss estimates labeled estimates','no invented savings','scope and permissions required']
  },
  {
    source:'16-59-07',
    theme:'AI-assisted business opportunity/loss audit',
    observed:['scan a business','estimate missed revenue or coverage gaps','produce an audit used to sell implementation'],
    incorporated:['PublicBusinessAuditAgent','GapEstimatorAgent','EvidenceReportAgent','ROIModelAgent'],
    controls:['public/authorized data only','confidence intervals','no unsupported revenue-loss claims']
  },
  {
    source:'16-54-57',
    theme:'Web3 protocol research and smart-contract security review',
    observed:['DeFi protocol discovery','wallet/protocol inspection','proxy-contract verification','Solidity review','security report'],
    incorporated:['Web3ResearchAgent','ContractMetadataAgent','ProxyVerificationAgent','StaticSecurityReviewAgent','BugReportAgent'],
    controls:['defensive analysis only','no credential theft','no exploit deployment','no fund movement','responsible disclosure']
  },
  {
    source:'16-53-43',
    theme:'TradingView indicator combinations and strategy research',
    observed:['chart indicators','combine multiple signals','buy/sell visualizations','strategy construction'],
    incorporated:['IndicatorResearchAgent','StrategyComposerAgent','BacktestAgent','RegimeAgent','RiskReviewAgent'],
    controls:['research/backtest first','no guaranteed returns','live orders require explicit one-order human approval']
  },
  {
    source:'16-52-16',
    theme:'original ambient audio production and music-platform publishing',
    observed:['split long ambience into short tracks','publish catalog to streaming platforms','royalty monetization claim'],
    incorporated:['AmbientAudioAgent','TrackSegmentAgent','MetadataAgent','RightsAgent','ReleasePackagingAgent'],
    controls:['original/licensed audio only','no stream manipulation','no royalty guarantees','platform policy review']
  },
  {
    source:'16-50-42',
    theme:'faceless media, trend research, automated publishing and open/local AI models',
    observed:['shadow/faceless pages','research top posts','recreate patterns','automated scheduling','open-source/local model alternatives'],
    incorporated:['FacelessMediaAgent','ViralPatternAgent','OriginalityAgent','PublishingSchedulerAgent','LocalModelRouterAgent'],
    controls:['learn patterns, do not copy protected expression','no fake engagement','authorized publishing only','model safety layer remains active']
  }
]);

export const LOCAL_MODEL_RESOURCES=Object.freeze({
  runtimes:[
    {name:'Ollama',mode:'local-or-hosted',api:'POST /api/chat',defaultLocal:'http://localhost:11434',status:'adapter-supported'},
    {name:'LM Studio',mode:'local',api:'OpenAI-compatible /v1/responses and /v1/chat/completions',defaultLocal:'http://localhost:1234/v1',status:'adapter-supported'},
    {name:'AnythingLLM',mode:'workspace/local orchestration',api:'optional external workspace adapter',status:'adapter-ready'}
  ],
  modelFamilies:['Llama-family','Mistral/Mixtral-family','Qwen-family','other user-selected compatible local models'],
  principle:'JARVIS may route eligible generation/research tasks to a configured local model, but model choice never disables JARVIS policy, financial approval, privacy, rights, or security controls.'
});

export const OCT05_CAPABILITY_PACK=Object.freeze({
  version:'2026.10.05-nucleus',
  status:'integrated',
  videoCount:9,
  screenshotCount:3,
  capabilities:[
    'creator deal discovery','UGC brief matching','creator portfolio planning','AI software factory','autonomous bounded experiments',
    'channel concept factory','idea-pattern research','ecommerce product research','bundle design','storefront planning',
    'business workflow loss audit','AI implementation service design','ROI estimate modeling','public business gap research',
    'Web3 protocol research','smart-contract metadata inspection','proxy verification','defensive Solidity review','responsible security report',
    'indicator research','strategy composition','backtesting','market-regime analysis','risk review',
    'ambient audio concepting','audio segmentation plan','release metadata','rights checks','distribution packaging',
    'faceless media research','viral pattern decomposition','original script generation','publishing scheduling','local model routing',
    'Ollama adapter','LM Studio OpenAI-compatible adapter','AnythingLLM workspace adapter','model capability scoring','model fallback routing',
    'mission decomposition','persistent memory','event audit log','outcome feedback','skill scoring','division health monitoring'
  ],
  boundaries:[
    'no phishing or credential theft','no exploit deployment or fund theft','no copied proprietary code','no fake engagement',
    'no spam or purchased private lists','no fabricated revenue/savings','no guaranteed investment returns',
    'no autonomous real-money trading','no safety-boundary removal'
  ]
});

export function capabilityMission({goal='',division='general'}={}){
  const clean=String(goal||'').trim().slice(0,2000);
  const lower=clean.toLowerCase();
  const selected=[];
  const add=(...x)=>x.forEach(v=>{if(!selected.includes(v))selected.push(v)});
  if(/creator|ugc|brand|content/.test(lower))add('UGCOpportunityAgent','FacelessMediaAgent','OriginalityAgent','PublishingSchedulerAgent');
  if(/software|app|website|build|code/.test(lower))add('RapidSoftwareFactory','TestAgent','DeploymentAgent');
  if(/store|ecommerce|product|bundle/.test(lower))add('CommerceScoutAgent','BundleDesignerAgent','StoreBuilderAgent');
  if(/business|audit|lead|workflow|automation/.test(lower))add('BusinessLossAuditAgent','WorkflowGapAgent','AIImplementationAgent');
  if(/web3|solidity|contract|defi|security/.test(lower))add('Web3ResearchAgent','StaticSecurityReviewAgent','BugReportAgent');
  if(/trade|indicator|strategy|crypto|market/.test(lower))add('IndicatorResearchAgent','BacktestAgent','RiskReviewAgent');
  if(/audio|music|rain|ambient|streaming/.test(lower))add('AmbientAudioAgent','RightsAgent','ReleasePackagingAgent');
  if(/local model|ollama|lm studio|qwen|mistral|llama/.test(lower))add('LocalModelRouterAgent','ModelBenchmarkAgent','PolicyAgent');
  if(!selected.length)add('PlannerAgent','ResearchAgent','BuilderAgent','CriticAgent','PolicyAgent');
  const financial=/\b(trade|buy crypto|sell crypto|withdraw|transfer money|place order|purchase)\b/i.test(clean);
  return {
    goal:clean,division,
    specialists:selected,
    stages:['understand','retrieve evidence','plan','delegate','build or draft','test/evaluate','external-action approval when required','record outcome','learn'],
    approvalRequired:financial,
    externalExecution:financial?'human-approved-only':'within configured permissions'
  };
}
