export const VIDEO_ANALYSIS=Object.freeze([
 {source:'17-04-51',theme:'UGC/creator opportunities + AI software',agents:['UGCOpportunityAgent','BrandBriefMatcher','RapidSoftwareFactory','PortfolioProofAgent']},
 {source:'17-02-35',theme:'agentic business experiments + monetizable channels + winning-pattern research',agents:['ExperimentAgent','ChannelFactoryAgent','PatternResearchAgent','EvidenceAgent']},
 {source:'17-01-27',theme:'AI ecommerce research, storefronts and bundles',agents:['CommerceScoutAgent','BundleDesignerAgent','StoreBuilderAgent','MarginResearchAgent']},
 {source:'17-00-15',theme:'AI implementation services for businesses',agents:['BusinessLossAuditAgent','AIImplementationAgent','WorkflowGapAgent','ProposalAgent']},
 {source:'16-59-07',theme:'business gap/loss audits',agents:['PublicBusinessAuditAgent','GapEstimatorAgent','EvidenceReportAgent','ROIModelAgent']},
 {source:'16-54-57',theme:'Web3 protocol and smart-contract security review',agents:['Web3ResearchAgent','ContractMetadataAgent','ProxyVerificationAgent','StaticSecurityReviewAgent','BugReportAgent']},
 {source:'16-53-43',theme:'indicator combinations and strategy research',agents:['IndicatorResearchAgent','StrategyComposerAgent','BacktestAgent','RegimeAgent','RiskReviewAgent']},
 {source:'16-52-16',theme:'original ambient audio publishing workflows',agents:['AmbientAudioAgent','TrackSegmentAgent','MetadataAgent','RightsAgent','ReleasePackagingAgent']},
 {source:'16-50-42',theme:'faceless media, trend research, scheduled publishing and local/open models',agents:['FacelessMediaAgent','ViralPatternAgent','OriginalityAgent','PublishingSchedulerAgent','LocalModelRouterAgent']}
]);
export const LOCAL_MODEL_RESOURCES=Object.freeze({
 runtimes:[
  {name:'Ollama',api:'POST /api/chat',defaultLocal:'http://localhost:11434',adapter:'supported'},
  {name:'LM Studio',api:'OpenAI-compatible /v1/responses and /v1/chat/completions',defaultLocal:'http://localhost:1234/v1',adapter:'supported'},
  {name:'AnythingLLM',api:'workspace adapter',adapter:'supported-when-configured'}
 ],
 modelFamilies:['Llama-family','Mistral/Mixtral-family','Qwen-family','other compatible local models'],
 rule:'Local/open models can be used for eligible tasks, but JARVIS policy, rights, privacy, security and approval controls remain active.'
});
export const CAPABILITY_PACK=Object.freeze({
 version:'2026.10.05-nucleus',videoCount:9,screenshotCount:3,status:'integrated',
 capabilities:[
 'creator deal discovery','UGC brief matching','creator portfolio planning','AI software factory','bounded autonomous experiments',
 'channel concept factory','idea-pattern research','ecommerce product research','bundle design','storefront planning','margin research',
 'business workflow audit','lost-opportunity estimate','AI implementation design','ROI estimate modeling',
 'Web3 protocol research','contract metadata inspection','proxy verification','defensive Solidity review','responsible security reporting',
 'indicator research','strategy composition','backtesting','market regime research','risk review',
 'ambient audio planning','track segmentation','release metadata','rights review','distribution packaging',
 'faceless media systems','viral pattern decomposition','original script generation','publishing scheduling',
 'Ollama routing','LM Studio routing','AnythingLLM adapter','model benchmarking','model fallback routing',
 'persistent memory','mission decomposition','skill routing','audit events','outcome feedback','division health monitoring'
 ],
 boundaries:['no phishing','no credential theft','no exploit deployment','no fund theft','no spam','no fake engagement','no copied proprietary assets','no fabricated revenue','no guaranteed returns','no autonomous real-money trading','no safety-boundary removal']
});
export function capabilityMission({goal='',division='general'}={}){
 const clean=String(goal||'').trim().slice(0,2000),lower=clean.toLowerCase(),selected=[];
 const add=(...xs)=>xs.forEach(x=>{if(!selected.includes(x))selected.push(x)});
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
 return {goal:clean,division,specialists:selected,stages:['understand','retrieve evidence','plan','delegate','build or draft','test/evaluate','external-action approval when required','record outcome','learn'],approvalRequired:financial,externalExecution:financial?'human-approved-only':'within-configured-permissions'};
}