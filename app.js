const $=id=>document.getElementById(id);const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(n):'—';
let lastAlert={};
function ema(values,period){let k=2/(period+1),out=[];let e=values.slice(0,period).reduce((a,b)=>a+b,0)/period;out[period-1]=e;for(let i=period;i<values.length;i++){e=values[i]*k+e*(1-k);out[i]=e}return out}
function rsi(values,p=14){if(values.length<=p)return NaN;let gains=0,loss=0;for(let i=values.length-p;i<values.length;i++){let d=values[i]-values[i-1];if(d>0)gains+=d;else loss-=d}return loss===0?100:100-100/(1+(gains/p)/(loss/p))}
function sayAlert(key,msg){let today=new Date().toISOString().slice(0,10);if(lastAlert[key]===today)return;lastAlert[key]=today;localStorage.setItem('vfv-alerts',JSON.stringify(lastAlert));$('log').textContent=new Date().toLocaleTimeString()+' · '+msg+' · '+$('log').textContent;if('Notification'in window&&Notification.permission==='granted')new Notification('VFV Smart Trader',{body:msg})}
async function load(){
 $('status').textContent='Fetching quote…';
 try{
  // Yahoo Finance chart endpoint; quote data may be delayed and endpoint availability can change.
  const url='https://query1.finance.yahoo.com/v8/finance/chart/VFV.TO?range=1y&interval=1d';
  const res=await fetch(url);if(!res.ok)throw Error('Quote service unavailable ('+res.status+')');
  const j=await res.json(),r=j.chart.result?.[0];if(!r)throw Error('No quote data returned');
  const q=r.indicators.quote[0],closes=q.close.map(Number).filter(Number.isFinite),last=closes.at(-1),prev=closes.at(-2);
  if(closes.length<60)throw Error('Not enough history for indicators');
  const high52=Math.max(...closes),high3=Math.max(...closes.slice(-63)),drop52=(last/high52-1)*100,drop3=(last/high3-1)*100,reference=Math.max(high52,high3);
  $('price').textContent=fmt(last);$('change').textContent=(last-prev>=0?'+':'')+fmt(last-prev)+' ('+((last/prev-1)*100).toFixed(2)+'%) today';
  $('change').style.color=last>=prev?'#9ce0c4':'#f0aaa2';$('high52').textContent=fmt(high52);$('high3m').textContent=fmt(high3);
  $('drop52').textContent=drop52.toFixed(2)+'% from high';$('drop3m').textContent=drop3.toFixed(2)+'% from high';
  $('level5').textContent=fmt(reference*.95);$('level8').textContent=fmt(reference*.92);
  $('bar5').style.width=Math.min(100,Math.max(0,Math.abs(drop52)/8*100))+'%';$('bar8').style.width=Math.min(100,Math.max(0,Math.abs(drop52)/8*100))+'%';
  const e=ema(closes,50).at(-1),rv=rsi(closes),e12=ema(closes,12),e26=ema(closes,26),macd=e12.at(-1)-e26.at(-1);
  $('rsi').textContent=rv.toFixed(1);$('rsiNote').textContent=rv<30?'Oversold zone':rv>70?'Overbought zone':'Neutral range';
  $('ema').textContent=fmt(e);$('emaNote').textContent=last>=e?'Above EMA 50':'Below EMA 50';
  $('macd').textContent=macd.toFixed(3);$('macdNote').textContent=macd>=0?'Positive momentum':'Negative momentum';
  let score=(last>=e?1:-1)+(rv<40?1:rv>70?-1:0)+(macd>=0?1:-1),sig=score>=2?'Favorable trend':score<=-2?'Weak trend':'Mixed / wait';
  $('signal').textContent=sig;$('signal').className='pill '+(score>=2?'good':score<=-2?'bad':'warn');
  $('reason').textContent=`Assessment: ${sig}. Price is ${last>=e?'above':'below'} its 50-day EMA; RSI is ${rv.toFixed(1)}; MACD is ${macd>=0?'positive':'negative'}. These are context signals, not a prediction or personalized recommendation.`;
  $('status').textContent='Quote loaded';$('status').className='pill good';$('updated').textContent='Updated '+new Date().toLocaleTimeString();
  if(drop52<=-5)sayAlert('pullback5','VFV is at least 5% below its 52-week high: observation zone.');
  if(drop52<=-8)sayAlert('pullback8','VFV is at least 8% below its 52-week high: review opportunity.');
 }catch(err){$('status').textContent='Data unavailable';$('status').className='pill bad';$('reason').textContent=err.message+'. Try again later. If the quote endpoint blocks browser access, a market-data API key or small proxy service will be needed.'}
}
$('refresh').onclick=load;$('notify').onclick=async()=>{if(!('Notification'in window)){alert('Notifications are not supported in this browser.');return}let p=await Notification.requestPermission();$('notify').textContent=p==='granted'?'Alerts enabled':'Permission not granted'};
lastAlert=JSON.parse(localStorage.getItem('vfv-alerts')||'{}');load();setInterval(load,15*60*1000);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
