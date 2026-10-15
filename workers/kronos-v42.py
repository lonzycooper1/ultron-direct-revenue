"""Offline file-based Kronos inference. Never places trades or sends data to a broker.
Install reviewed official source https://github.com/shiyu-coder/Kronos and its deps.
Set PYTHONPATH to that source; cache approved model/tokenizer weights locally.
Usage: python workers/kronos-v42.py input.json output.json
Input: candles (12..512), horizon (1..120), intervalSeconds, local tokenizerPath/modelPath.
"""
import json, sys, pathlib, math

def validate(data):
    rows = data.get('candles', [])
    if not isinstance(rows,list) or not 12 <= len(rows) <= 512:
        raise ValueError('Provide 12..512 historical candles')
    horizon=data.get('horizon', 12)
    interval=data.get('intervalSeconds', 3600)
    if type(horizon) is not int or not 1 <= horizon <= 120:
        raise ValueError('horizon must be an integer 1..120')
    if type(interval) is not int or not 1 <= interval <= 86400:
        raise ValueError('intervalSeconds must be 1..86400')
    for row in rows:
        for key in ('open','high','low','close'):
            value=row.get(key)
            if type(value) not in (int,float) or not math.isfinite(value) or value<=0:
                raise ValueError('Invalid OHLC')
        if row['low']>min(row['open'],row['close']) or row['high']<max(row['open'],row['close']):
            raise ValueError('OHLC envelope invalid')
    for key in ('tokenizerPath','modelPath'):
        p=pathlib.Path(data.get(key,''))
        if not data.get(key) or not p.is_dir():
            raise ValueError('Local reviewed '+key+' directory required')
    return rows,horizon,interval

def infer(data):
    rows,horizon,interval=validate(data)
    import os
    os.environ['HF_HUB_OFFLINE']='1'
    os.environ['TRANSFORMERS_OFFLINE']='1'
    import pandas as pd
    from model import Kronos, KronosTokenizer, KronosPredictor
    df=pd.DataFrame(rows)
    ts=pd.to_datetime(df['timestamp'],utc=True).dt.tz_localize(None)
    if not ts.is_monotonic_increasing or ts.duplicated().any():
        raise ValueError('Timestamps must strictly increase')
    if not ((ts.diff().dropna().dt.total_seconds()-interval).abs()<0.001).all():
        raise ValueError('Candles must match intervalSeconds')
    tokenizer=KronosTokenizer.from_pretrained(data['tokenizerPath'])
    model=Kronos.from_pretrained(data['modelPath'])
    predictor=KronosPredictor(model,tokenizer,device='cpu',max_context=512)
    future=pd.Series(pd.date_range(ts.iloc[-1]+pd.Timedelta(seconds=interval),periods=horizon,freq=pd.Timedelta(seconds=interval)))
    columns=[key for key in ('open','high','low','close','volume','amount') if key in df.columns]
    forecast=predictor.predict(df=df[columns],x_timestamp=ts,y_timestamp=future,pred_len=horizon,T=1.0,top_p=0.9,sample_count=1,verbose=False)
    return {'engine':'KRONOS_LOCAL_CPU','forecast':json.loads(forecast.to_json(orient='records')),'timestamps':[t.isoformat() for t in future], 'liveTrading':False,'providerConnected':False,'profitVerified':False,'note':'Stochastic research forecast; evaluate against held-out observations'}

if __name__=='__main__':
    if len(sys.argv)!=3:
        raise SystemExit('Usage: kronos-v42.py input.json output.json')
    with open(sys.argv[1]) as f:
        data=json.load(f)
    result=infer(data)
    with open(sys.argv[2],'w') as f:
        json.dump(result,f,indent=2,allow_nan=False)
