/**
 * ULTRON v39 - evidence-labeled hybrid quantum foundation.
 * No QPU, phone account, property database, financial account, or trading exchange is connected here.
 * The bounded statevector simulator runs on an ordinary CPU.
 */
export const QUANTUM_VERSION='39.0.0';
export const SOURCES=[
 {title:'The Psychology of Money in 20 minutes',url:'https://www.youtube.com/watch?v=_5ecgEXLoCA',lesson:'Behavior matters more than exciting forecasts.'},
 {title:'The Untold Truth About Money',url:'https://www.youtube.com/watch?v=6mRbDEtDoyA',lesson:'Solve a measurable customer problem before multiplying offers.'},
 {title:'The 20 Rules of Money',url:'https://www.youtube.com/watch?v=D9cPAuZIigs',lesson:'Define risk limits and test assumptions.'},
 {title:"The Intelligent Investor's Road to $1,000,000",url:'https://www.youtube.com/watch?v=5Vxjyz9DZ6k',lesson:'Plan for measured savings and long-run compounding.'},
 {title:'Escaping the Rat Race',url:'https://www.youtube.com/watch?v=9RJpIqD8MGg',lesson:'Improve the balance of production, consumption and reserves.'}
];
export const VIDEO_MODULES=[
 {id:'property-research',label:'Property Deal Research',state:'CALCULATOR_READY_FEED_NOT_CONNECTED',externalAction:false},
 {id:'managed-agent',label:'Managed Agent Harness',state:'DESIGN_READY_PROVIDER_NOT_CONNECTED',externalAction:false},
 {id:'quantum-simulation',label:'Quantum Circuit Core',state:'BOUNDED_CPU_SIMULATOR_READY',externalAction:false},
 {id:'cloud-quantum',label:'IBM Quantum QPU Adapter',state:'ACCOUNT_AND_APPROVED_TOKEN_REQUIRED',externalAction:false},
 {id:'quantum-consulting',label:'Quantum-AI Readiness Assessment',state:'SCOPING_TEMPLATE_READY_NO_CUSTOMERS',externalAction:false},
 {id:'media-newsletter',label:'Original Quantum-AI Media and Newsletter',state:'EDITORIAL_WORKFLOW_READY_PUBLISHER_NOT_CONNECTED',externalAction:false},
 {id:'digital-guides',label:'Quantum-AI Starter Guide',state:'DRAFT_BRIEF_READY_NOT_ON_SALE',externalAction:false},
 {id:'ai-phone-agent',label:'AI Phone Receptionist',state:'DESIGN_READY_TELEPHONY_NOT_CONNECTED',externalAction:false},
 {id:'finance-research',label:'Money-Education Intelligence',state:'SOURCE_PLAYLIST_READY_RESEARCH_ONLY',externalAction:false},
 {id:'trading',label:'Trading Research',state:'PAPER_RESEARCH_ONLY_NO_AUTONOMOUS_LIVE_ORDERS',externalAction:false}
];
export const quantumManifest=()=>({
 version:QUANTUM_VERSION,architecture:'HYBRID_CLASSICAL_QUANTUM_EXPERIMENTAL',
 runtime:'CLASSICAL_CPU_STATEVECTOR_SIMULATOR',qpuConnected:false,
 truth:'A simulator is not quantum hardware and does not establish a quantum speedup.',
 maxQubits:8,maxGates:48,
 storage:{durable:'Use existing Postgres and encrypted object storage with backups',quantumHardDrive:false},
 qpu:{provider:'IBM Quantum',url:'https://quantum.cloud.ibm.com',status:'REQUIRES_OWN_ACCOUNT_AND_RUNTIME_CREDENTIALS',cost:'Open Plan offers a small free QPU runtime allowance; terms can change.'},
 ai:{role:'Orchestrator, LLM-based explanations, lead research, factual review and deterministic tools',providerKeys:'REQUIRED_FOR_DEPLOYED_API_CALLS'},
 modules:VIDEO_MODULES,playlist:SOURCES,
 businessFirst:['Deliver existing paid orders','Respond to opted-in interested buyers','Validate one measurable pilot','Publish only original fact-checked content'],
 externalActionsTaken:false,verifiedCustomerSalesFromUpgrade:0
});
export function runCircuit({qubits=2,gates=[{op:'H',target:0},{op:'CX',control:0,target:1}]}={}){
 if(!Number.isInteger(qubits)||qubits<1||qubits>8)throw Error('qubits must be an integer from 1 to 8');
 if(!Array.isArray(gates)||gates.length>48)throw Error('Maximum 48 gates');
 const size=2**qubits,s=new Float64Array(size);s[0]=1;
 const valid=x=>Number.isInteger(x)&&x>=0&&x<qubits;
 for(const g of gates){
  if(!g||typeof g!=='object'||!valid(g.target))throw Error('Invalid gate target');
  const op=String(g.op||'').toUpperCase(),bit=1<<g.target;
  if(op==='CX'){
   if(!valid(g.control)||g.control===g.target)throw Error('Invalid CX control');
   const cb=1<<g.control;
   for(let i=0;i<size;i++)if((i&cb)!==0&&(i&bit)===0){const j=i|bit;[s[i],s[j]]=[s[j],s[i]];}
  }else if(op==='H'||op==='X'||op==='RY'){
   const a=op==='H'?Math.SQRT1_2:op==='X'?0:Math.cos(Number(g.theta)/2);
   const b=op==='H'?Math.SQRT1_2:op==='X'?1:Math.sin(Number(g.theta)/2);
   if(op==='RY'&&(!Number.isFinite(Number(g.theta))||Math.abs(Number(g.theta))>2*Math.PI))throw Error('RY theta must be finite and within +/-2pi');
   for(let i=0;i<size;i++)if((i&bit)===0){const j=i|bit,x=s[i],y=s[j];if(op==='H'){s[i]=a*(x+y);s[j]=b*(x-y);}else{s[i]=a*x-b*y;s[j]=b*x+a*y;}}
  }else if(op==='Z'){
   for(let i=0;i<size;i++)if(i&bit)s[i]*=-1;
  }else throw Error('Allowed gates: H, X, Z, RY, CX');
 }
 const probabilities={};let total=0;
 for(let i=0;i<size;i++){const p=s[i]**2;total+=p;if(p>1e-10)probabilities[i.toString(2).padStart(qubits,'0')]=Number(p.toFixed(8));}
 if(Math.abs(total-1)>1e-8)throw Error('Circuit normalization failure');
 return {engine:'CPU_STATEVECTOR_SIMULATOR_NOT_A_QPU',qubits,gateCount:gates.length,probabilities,normalization:Number(total.toFixed(10)),hardwareUsed:false,quantumAdvantageProven:false,measurement:'THEORETICAL_PROBABILITIES_NO_HARDWARE_SHOTS'};
}
export function propertyScenario(input={}){
 const n=(name)=>{const v=Number(input[name]);if(!Number.isFinite(v)||v<0||v>1e9)throw Error('Invalid '+name);return v};
 const purchase=n('purchase'),afterRepairValue=n('afterRepairValue'),repairs=n('repairs'),closing=n('closing'),holding=n('holding'),assignment=n('assignment');
 if(afterRepairValue===0)throw Error('afterRepairValue must be positive');
 const expenses=purchase+repairs+closing+holding+assignment,spread=afterRepairValue-expenses;
 return {expensesUsd:+expenses.toFixed(2),illustrativeSpreadUsd:+spread.toFixed(2),afterRepairValueUsd:afterRepairValue,
 assumption:'All inputs are user-supplied, not independently appraised or verified.',
 status:'HYPOTHETICAL_NOT_AN_OFFER',realDealLocated:false,propertyOwnershipVerified:false,dealClosed:false,
 cautions:['Confirm title, liens, taxes and repair estimates','Confirm contract assignability and state real-estate licensing law','Never market government discounts without source evidence']};
}
export function pilotBlueprint({industry='logistics',problem='routing',units=1000,minutesPerUnit=4,hourlyUsd=25}={}){
 const count=Number(units),minutes=Number(minutesPerUnit),rate=Number(hourlyUsd);
 if(![count,minutes,rate].every(x=>Number.isFinite(x)&&x>=0&&x<=1e6))throw Error('Invalid nonnegative pilot assumptions');
 const hours=count*minutes/60,cost=hours*rate;
 return {industry:String(industry).slice(0,70),problem:String(problem).slice(0,160),
 baseline:{units:count,laborHours:+hours.toFixed(2),estimatedLaborUsd:+cost.toFixed(2)},
 method:['Collect authorized baseline and consent','Run a classical baseline','Prototype a tiny quantum-inspired or simulated circuit','Compare accuracy, runtime, total cost and reproducibility','Write an evidence-backed readiness roadmap'],
 state:'DRAFT_NOT_EXECUTED',expectedQuantumAdvantage:'NONE_ASSUMED',savingsVerifiedUsd:0,
 salesVerifiedUsd:0,automatedOutreach:false};
}
