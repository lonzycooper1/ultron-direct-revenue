// ULTRON zero-capital growth doctrine.
// The system does not create money from nothing: it creates useful work, sells it,
// verifies outside customer payment, fulfills, measures, then reinvests verified profit.

export const ZERO_CAPITAL_FLYWHEEL = Object.freeze({
  objective: 'Turn useful AI-assisted work into legitimate verified customer revenue with no required ad spend.',
  firstMilestoneUsd: 10,
  validationMilestoneUsd: 250,
  stages: [
    'discover-real-demand',
    'identify-business-problem',
    'qualify-prospect',
    'research-prospect',
    'create-original-demo-or-audit',
    'prepare-personalized-permitted-outreach',
    'route-interested-prospect-to-offer',
    'verify-customer-payment',
    'fulfill-purchased-work',
    'record-actual-revenue',
    'measure-conversion-margin-retention',
    'reinvest-verified-profit',
    'repeat-and-scale'
  ],
  agentRoles: [
    'demand-scout', 'prospect-qualifier', 'business-researcher', 'demo-builder',
    'original-content-agent', 'outreach-prep-agent', 'sales-router',
    'fulfillment-agent', 'revenue-accountant', 'experiment-optimizer'
  ],
  initialOffers: [
    {id:'audit',priceUsd:250,purpose:'paid workflow/website/lead-system audit'},
    {id:'lead',priceUsd:750,purpose:'lead-system implementation'},
    {id:'full',priceUsd:2500,purpose:'full scoped automation implementation'}
  ],
  cashFlowRule: 'identify buyer -> demonstrate value -> buyer pays -> fulfill digitally -> reinvest verified profit',
  accounting: {
    actualRevenue: 'Only successfully verified customer payments.',
    projections: 'Stored separately and explicitly labeled as projections.',
    reinvestmentBase: 'Verified collected revenue/profit only.'
  },
  scalingPath: ['service','productized-service','recurring-software','licensing','transaction-fees','enterprise-contracts'],
  prohibited: ['fake-transactions','fabricated-revenue','deceptive-marketing','unauthorized-charges','spam','phishing','impersonation','market-manipulation']
});

export function nextZeroCapitalMission({verifiedRevenueUsd=0,customerCount=0}={}){
  const revenue=Math.max(0,Number(verifiedRevenueUsd)||0);
  const customers=Math.max(0,Number(customerCount)||0);
  if(customers===0) return {priority:'FIRST_CUSTOMER',targetUsd:10,action:'Find one unrelated prospect with a real problem, create a useful original demo/audit, make a truthful offer, and count revenue only after verified payment.'};
  if(revenue<250) return {priority:'VALIDATE',targetUsd:250,action:'Repeat the first working acquisition path and validate willingness to pay.'};
  if(revenue<1000) return {priority:'REPEAT',targetUsd:1000,action:'Measure conversion, delivery cost and margin; standardize the best-performing offer.'};
  return {priority:'SCALE',targetUsd:null,action:'Scale only channels and offers supported by verified conversion and margin data.'};
}
