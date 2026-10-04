import {createHash} from 'node:crypto';
export function campaignDigest(campaign){return createHash('sha256').update(JSON.stringify({channel:campaign.channel,account:campaign.account,caption:campaign.caption,asset:campaign.asset,url:campaign.url})).digest('hex');}
export async function publishCampaign(campaign,{approvedDigest,adapter,priorReceipt}={}){
 const digest=campaignDigest(campaign);
 if(priorReceipt?.digest===digest&&priorReceipt.externalId)return {...priorReceipt,replayed:true};
 if(approvedDigest!==digest)return {status:'awaiting_exact_approval',digest};
 if(!adapter)return {status:'connection_required',digest,channel:campaign.channel};
 if(!campaign.account||!campaign.caption||!/^https:\/\//.test(campaign.url||''))throw Error('Campaign needs an account, caption and HTTPS product URL');
 // Adapter must return the platform receipt. A draft or accepted request is not a published post.
 const result=await adapter(campaign,{idempotencyKey:digest});
 if(!result?.externalId||!result?.publishedUrl)return {status:'publication_unverified',digest};
 return {status:'published',digest,externalId:result.externalId,publishedUrl:result.publishedUrl};
}
