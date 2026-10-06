// ULTRON short-horizon objective layer.
// Urgency changes prioritization, not risk controls. No profit guarantee.

export const SHORT_HORIZON_OBJECTIVE_VERSION='2026.10.06';

export const CORPORATE_OBJECTIVE=Object.freeze({
 primary:'maximize verified net cash generation quickly while preserving solvency, legality, reputation and owner control',
 horizons:['same-day','24-72-hours','7-days','30-days'],
 ranking:['time-to-cash','probability-of-cash','net-margin','capital-required','downside-risk','repeatability','legal/platform-compliance'],
 constraints:['no fabricated revenue','no self-payments','no circular transactions','no guaranteed-return claims','no unauthorized account actions','no irreversible financial action without owner approval'],
 principle:'fastest expected path to verified cash, not maximum risk'
});

export const CRYPTO_SHORT_HORIZON=Object.freeze({
 objective:'identify short-duration, risk-adjusted trading opportunities after fees/slippage; prioritize capital preservation over trade frequency',
 horizons:['5m','15m','1h','4h','1d'],
 styles:['scalp-research','intraday','short-swing'],
 inputs:['price/volume','spread','liquidity','volatility','momentum','trend','market regime','support/resistance','relative strength','BTC/ETH beta','news/events','fees','slippage'],
 output:['BUY','SELL','WAIT','EXIT'],
 confidencePolicy:'confidence is calibrated from out-of-sample historical hit rates by asset, horizon and regime; never display 95% merely from indicator agreement',
 rangePolicy:'range regime requires mean-reversion confirmation or breakout confirmation; otherwise WAIT',
 executionPolicy:'paper trading may automate; every live order requires explicit owner approval',
 prohibited:['martingale','loss-chasing','guaranteed-profit language','automatic leverage escalation','all-in sizing','unapproved live orders'],
 validation:['walk-forward tests','fees/slippage included','max drawdown','profit factor','expectancy','win rate','calibration error','sample size','regime breakdown']
});

export function calibrateSignal({rawConfidence=.5,sampleSize=0,hitRate=.5,regime='unknown',spreadBps=0,slippageBps=0}={}){
 const sampleWeight=Math.min(1,Math.max(0,Number(sampleSize)||0)/500);
 const empirical=.5+((Math.max(0,Math.min(1,Number(hitRate)||.5))-.5)*sampleWeight);
 const raw=Math.max(.5,Math.min(.99,Number(rawConfidence)||.5));
 const regimePenalty=regime==='range'?.06:regime==='unknown'?.04:0;
 const frictionPenalty=Math.min(.12,(Math.max(0,Number(spreadBps)||0)+Math.max(0,Number(slippageBps)||0))/10000);
 const calibrated=Math.max(.5,Math.min(.95,(empirical*.7+raw*.3)-regimePenalty-frictionPenalty));
 return {calibratedConfidence:+calibrated.toFixed(4),sampleSize,hitRate,regime,frictionBps:(Number(spreadBps)||0)+(Number(slippageBps)||0),label:calibrated<.58?'LOW':calibrated<.68?'MEDIUM':calibrated<.78?'HIGH':'VERY_HIGH'};
}

export function shortHorizonManifest(){return {version:SHORT_HORIZON_OBJECTIVE_VERSION,corporate:CORPORATE_OBJECTIVE,crypto:CRYPTO_SHORT_HORIZON};}
