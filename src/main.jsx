import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { astro } from 'iztro';
import * as Astronomy from 'astronomy-engine';
import './styles.css';

const HOURS=[['早子時','00:00–00:59'],['丑時','01:00–02:59'],['寅時','03:00–04:59'],['卯時','05:00–06:59'],['辰時','07:00–08:59'],['巳時','09:00–10:59'],['午時','11:00–12:59'],['未時','13:00–14:59'],['申時','15:00–16:59'],['酉時','17:00–18:59'],['戌時','19:00–20:59'],['亥時','21:00–22:59'],['晚子時','23:00–23:59']];

const PLACES={
'台北市':[25.0375,121.5637],'新北市':[25.0120,121.4657],'桃園市':[24.9937,121.3010],'台中市':[24.1477,120.6736],
'台南市':[22.9999,120.2269],'高雄市':[22.6273,120.3014],'基隆市':[25.1276,121.7392],'新竹市':[24.8138,120.9675],
'新竹縣':[24.8387,121.0177],'苗栗縣':[24.5602,120.8214],'彰化縣':[24.0756,120.5440],'南投縣':[23.9609,120.9719],
'雲林縣':[23.7092,120.4313],'嘉義市':[23.4801,120.4491],'嘉義縣':[23.4518,120.2555],'屏東縣':[22.5519,120.5488],
'宜蘭縣':[24.7021,121.7378],'花蓮縣':[23.9911,121.6112],'台東縣':[22.7554,121.1500],'澎湖縣':[23.5712,119.5793],
'金門縣':[24.4321,118.3171],'連江縣':[26.1605,119.9517]};

const SIGNS=[
{name:'牡羊座',element:'火',keywords:'直接、行動、開創',emotion:'情緒來得快也去得快，內在需要直接與真實。',mask:'第一印象積極果斷，容易給人有衝勁的感覺。'},
{name:'金牛座',element:'土',keywords:'穩定、審美、價值',emotion:'內在重視安全、節奏與可預期感，情緒需要時間消化。',mask:'第一印象沉穩可靠，重質感與實際感受。'},
{name:'雙子座',element:'風',keywords:'好奇、溝通、反應快速',emotion:'情緒需要透過說話、理解與資訊交換來整理。',mask:'第一印象機靈健談，容易快速融入不同環境。'},
{name:'巨蟹座',element:'水',keywords:'情感、保護、歸屬',emotion:'情緒深受熟悉感與關係影響，內在需要被理解與照顧。',mask:'第一印象溫和敏感，容易讓人感到親切或保護性。'},
{name:'獅子座',element:'火',keywords:'自信、創造、舞台感',emotion:'情緒需要被看見與肯定，也傾向用熱情表達在乎。',mask:'第一印象有存在感、明亮、自信，容易成為焦點。'},
{name:'處女座',element:'土',keywords:'細節、分析、改善',emotion:'內在會透過整理、分析與解決問題取得安全感。',mask:'第一印象俐落謹慎，讓人覺得可靠、有效率。'},
{name:'天秤座',element:'風',keywords:'平衡、審美、協調',emotion:'情緒需要和諧與公平，常會先思考他人的感受。',mask:'第一印象有禮、好相處，重視形象與互動品質。'},
{name:'天蠍座',element:'水',keywords:'洞察、深度、轉化',emotion:'情緒濃度高但不一定直接表達，內在重視信任與深度。',mask:'第一印象神秘、有距離感或洞察力強。'},
{name:'射手座',element:'火',keywords:'自由、探索、遠見',emotion:'情緒需要空間與方向感，受困時容易想換環境。',mask:'第一印象直率樂觀，帶有自由與冒險氣息。'},
{name:'摩羯座',element:'土',keywords:'務實、耐力、責任',emotion:'內在傾向克制與自我要求，需要透過成果建立安全感。',mask:'第一印象成熟穩重，容易讓人覺得有目標感。'},
{name:'水瓶座',element:'風',keywords:'獨立、創新、理念',emotion:'情緒常先理性化，需要自由與不被控制的空間。',mask:'第一印象獨特理性，不容易被既定框架限制。'},
{name:'雙魚座',element:'水',keywords:'敏感、想像、同理',emotion:'情緒感受細膩，容易吸收環境氛圍，需要適度界線。',mask:'第一印象柔和、有想像力，容易讓人感到親近。'}];

const STAR_RULES={
'紫微':'重視格局與掌控，具領導、整合與承擔責任的傾向。','天機':'思考快速、善規劃與應變，適合策略、企劃與知識型工作。',
'太陽':'外向、重責任與影響力，適合公開表達、領導與服務角色。','武曲':'務實果斷，對資源、效率與成果敏感。',
'天同':'溫和、人緣佳，重視舒適與和諧。','廉貞':'有原則與企圖心，重視界線、魅力與自我要求。',
'天府':'穩健、包容、資源整合能力佳。','太陰':'細膩敏感、觀察力強，重視內在安全與生活品質。',
'貪狼':'多才多藝、社交與審美感強。','巨門':'擅長分析、辯證與表達。','天相':'重公平與合作，擅協調與建立信任。',
'天梁':'重原則與助人，具保護與指導傾向。','七殺':'決斷力強，能承擔壓力與開創未知。','破軍':'改革與突破力強，適合變動、創新與重整。'};

const HOUSE_MAP={personality:['命宮','命宫'],love:['夫妻宮','夫妻宫'],career:['官祿宮','官禄宫','事業宮','事业宫'],wealth:['財帛宮','财帛宫'],social:['交友宮','交友宫','僕役宮','仆役宫'],talent:['福德宮','福德宫']};
const ELEMENT_COMPAT={火:{火:8,土:6,風:10,水:4},土:{火:6,土:9,風:5,水:8},風:{火:10,土:5,風:9,水:6},水:{火:4,土:8,風:6,水:10}};
const YEAR_THEMES=['重新定位與啟動','資源整合與累積','關係重整與合作','曝光成長與突破','穩定落地與收成','學習轉型與跨界'];

function norm360(x){return((x%360)+360)%360}
function signFromLon(lon){const x=norm360(lon),idx=Math.floor(x/30)%12;return{...SIGNS[idx],degree:x%30,longitude:x}}
function sunSignFromDate(date){if(!date)return null;const[,m,d]=date.split('-').map(Number);const b=[[1,20,9],[2,19,10],[3,20,11],[4,20,0],[5,21,1],[6,21,2],[7,22,3],[8,23,4],[9,23,5],[10,23,6],[11,22,7],[12,22,8]];const row=b.find(x=>x[0]===m);if(!row)return null;const[,end,prev]=row;return{...SIGNS[d<=end?prev:(prev+1)%12],degree:null}}
function localToUtc(date,time,tz){const[y,m,d]=date.split('-').map(Number),[hh,mm]=time.split(':').map(Number);return new Date(Date.UTC(y,m-1,d,hh-Number(tz),mm,0))}
function timeToIndex(time){const h=Number((time||'00:00').split(':')[0]);if(h===23)return 12;if(h===0)return 0;return Math.floor((h+1)/2)}
function palaceTitle(name){return(name||'').endsWith('宮')||(name||'').endsWith('宫')?name:`${name}宮`}
function findPalace(chart,names){return chart?.palaces?.find(p=>names.includes(p.name))}
function starText(p){const names=p?.majorStars?.map(s=>s.name)||[];if(!names.length)return'此宮無主星，解讀時需搭配對宮與整體命盤。';return names.map(n=>STAR_RULES[n]||`${n}帶來鮮明的個人驅動與生命課題。`).join(' ')}
function calcMoon(utc){return signFromLon(Astronomy.EclipticGeoMoon(utc).lon)}
function calcAscendant(utc,lat,lon){const observer=new Astronomy.Observer(Number(lat),Number(lon),0),ectEqd=Astronomy.Rotation_ECT_EQD(utc),eqdHor=Astronomy.Rotation_EQD_HOR(utc,observer),r=Astronomy.CombineRotation(ectEqd,eqdHor).rot;let lam=Math.atan2(-r[2][0],r[2][1]);if(lam<0)lam+=2*Math.PI;const c=Math.cos(lam),s=Math.sin(lam),yWest=r[1][0]*c+r[1][1]*s;if(yWest>=0)lam=(lam+Math.PI)%(2*Math.PI);return signFromLon(lam*180/Math.PI)}
function signAdvice(sign){return{火:'把行動力轉成穩定節奏，是你放大優勢的關鍵。',土:'你適合長期累積與把想法落地。',風:'溝通、資訊與連結是你的重要資源。',水:'直覺與感受力強，清楚界線能讓你更穩定。'}[sign.element]||''}
function computeWestern(form){const sun=sunSignFromDate(form.date),utc=localToUtc(form.date,form.time,form.tz),moon=calcMoon(utc),asc=calcAscendant(utc,form.latitude,form.longitude);return{sun,moon,asc,utc}}
function makeAnalysis(chart,sun,moon,asc){const p={personality:findPalace(chart,HOUSE_MAP.personality),love:findPalace(chart,HOUSE_MAP.love),career:findPalace(chart,HOUSE_MAP.career),wealth:findPalace(chart,HOUSE_MAP.wealth),social:findPalace(chart,HOUSE_MAP.social),talent:findPalace(chart,HOUSE_MAP.talent)};return[
{icon:'✦',title:'核心性格',source:`命宮 × 太陽${sun.name}`,summary:`太陽${sun.name}代表你的核心意志；${starText(p.personality)}`,strength:`核心傾向是「${sun.keywords}」。`,challenge:signAdvice(sun)},
{icon:'☾',title:'內在情緒',source:`月亮${moon.name}`,summary:`月亮${moon.name}描述你私下的情緒需求與安全感模式。${moon.emotion}`,strength:'理解自己的情緒節奏後，更容易穩定回應壓力。',challenge:'情緒需求未被看見時，容易用習慣性的防衛方式反應。'},
{icon:'↑',title:'外在形象',source:`上升${asc.name}`,summary:`上升${asc.name}代表別人初見你時感受到的氣質。${asc.mask}`,strength:'善用第一印象與行動風格，可以提升人際與職場辨識度。',challenge:'外在形象不一定等於真實內心。'},
{icon:'♡',title:'愛情與感情',source:palaceTitle(p.love?.name||'夫妻宮'),summary:`${starText(p.love)} 月亮${moon.name}也會影響你真正需要的情感安全感。`,strength:'把關係需求說清楚，互動會更成熟。',challenge:'避免只憑外在吸引忽略長期相處節奏。'},
{icon:'⌁',title:'工作與事業',source:palaceTitle(p.career?.name||'官祿宮'),summary:`${starText(p.career)} 太陽${sun.name}補充你想成為什麼樣的人。`,strength:'整合核心動機與工作能力，容易形成個人品牌。',challenge:'方向太多時要設定優先級。'},
{icon:'◈',title:'財富與資源',source:palaceTitle(p.wealth?.name||'財帛宮'),summary:starText(p.wealth),strength:'依自己的決策節奏與專業優勢建立長期資源。',challenge:'財務仍應以真實現金流與風險承受度為準。'}]}
function fourfoldText(chart,sun,moon,asc){const life=findPalace(chart,HOUSE_MAP.personality),stars=life?.majorStars?.map(s=>s.name).join('、')||'無主星';return`你的核心自我是太陽${sun.name}，內在情緒以月亮${moon.name}運作，外在第一印象呈現上升${asc.name}風格；紫微命宮主星為${stars}。太陽描述「我想成為誰」，月亮描述「我需要什麼才安心」，上升描述「我如何進入世界」，紫微命宮補充你在人生結構中的主要驅動。`}
function hashText(s){let h=0;for(const ch of s)h=(h*31+ch.charCodeAt(0))>>>0;return h}
function yearlyForecast(chart,western,year){const seed=hashText(`${year}-${western.sun.name}-${western.moon.name}-${western.asc.name}-${chart.soul||''}`),theme=YEAR_THEMES[seed%YEAR_THEMES.length];const scores={career:62+(seed%31),love:58+((seed>>3)%34),money:56+((seed>>5)%36),growth:65+((seed>>7)%30)};const months=Array.from({length:12},(_,i)=>({m:i+1,score:55+((seed+i*17)%41)}));return{theme,scores,months,summary:`${year} 年的核心主題是「${theme}」。太陽${western.sun.name}提供主動方向，月亮${western.moon.name}提醒你照顧情緒節奏，上升${western.asc.name}則影響外界機會如何進入。`}}
function compatibility(a,b){const pair=(x,y)=>ELEMENT_COMPAT[x.element]?.[y.element]||6;const sun=pair(a.sun,b.sun),moon=pair(a.moon,b.moon),asc=pair(a.asc,b.asc),score=Math.round((sun*3+moon*4+asc*3)*10/10);return{score:Math.min(100,score),sun,moon,asc,summary:score>=82?'高默契組合：吸引力與理解度都不錯，適合建立共同目標。':score>=68?'中高默契：有互補優勢，關鍵在於情緒表達與溝通節奏。':'互補挑戰型：差異明顯，但如果願意理解彼此需求，也可能形成強烈成長關係。'}}
function radarValues(chart,w){const stars=findPalace(chart,HOUSE_MAP.personality)?.majorStars?.length||1;const map={火:[88,58,76,62,82,86],土:[66,72,58,90,64,78],風:[74,62,92,54,88,66],水:[60,94,72,68,86,58]};const base=map[w.sun.element]||[70,70,70,70,70,70];return base.map((v,i)=>Math.min(98,v+(stars*3+i*2)%9))}
function radarPoints(vals,cx=110,cy=110,r=82){return vals.map((v,i)=>{const a=-Math.PI/2+i*Math.PI*2/6,rr=r*v/100;return`${cx+Math.cos(a)*rr},${cy+Math.sin(a)*rr}`}).join(' ')}
function smartAnswer(q,chart,w,forecast){const t=q.trim();if(!t)return'請先輸入你想問的問題。';const career=findPalace(chart,HOUSE_MAP.career),love=findPalace(chart,HOUSE_MAP.love),money=findPalace(chart,HOUSE_MAP.wealth);if(/工作|事業|轉職|職涯/.test(t))return`事業面可先看${palaceTitle(career?.name||'官祿宮')}：${starText(career)}。今年主題是「${forecast.theme}」，建議把重點放在可累積的成果與可被看見的專業。`;if(/愛情|感情|伴侶|戀愛/.test(t))return`感情面：${starText(love)} 月亮${w.moon.name}表示你的安全感需求是重要關鍵。比起只看吸引力，更適合觀察對方是否能回應你的情緒節奏。`;if(/錢|財|投資|收入/.test(t))return`財富面：${starText(money)}。今年財運指數約 ${forecast.scores.money}/100，適合先做現金流與風險分層，不建議把命理結果當作投資依據。`;if(/今年|流年|運勢/.test(t))return`${forecast.summary} 事業 ${forecast.scores.career}/100、感情 ${forecast.scores.love}/100、財富 ${forecast.scores.money}/100、成長 ${forecast.scores.growth}/100。`;return`從四重人格來看：太陽${w.sun.name}是你的核心方向、月亮${w.moon.name}是情緒需求、上升${w.asc.name}是外在行動方式。你可以把問題再聚焦成「工作、感情、財富、今年運勢」，我會用相對應宮位回答。`}
function shareText(name,chart,w){return`${name||'我的'}星命之境｜太陽${w.sun.name}・月亮${w.moon.name}・上升${w.asc.name}・命主${chart.soul||'—'}。紫微×西洋占星四重人格解析。`}

function App(){
const empty={name:'',gender:'',date:'',time:'',city:'',latitude:'',longitude:'',tz:'8'};
const [form,setForm]=useState(empty),[chart,setChart]=useState(null),[western,setWestern]=useState(null),[error,setError]=useState(''),[selected,setSelected]=useState(0);
const [year,setYear]=useState(new Date().getFullYear()),[partner,setPartner]=useState({...empty,name:'對方'}),[partnerWestern,setPartnerWestern]=useState(null),[compat,setCompat]=useState(null);
const [question,setQuestion]=useState(''),[answer,setAnswer]=useState(''),[shareStatus,setShareStatus]=useState('');
const sun=useMemo(()=>form.date?sunSignFromDate(form.date):null,[form.date]),selectedPalace=chart?.palaces?.[selected],palaceRows=useMemo(()=>chart?.palaces||[],[chart]);
const analyses=useMemo(()=>chart&&western?makeAnalysis(chart,western.sun,western.moon,western.asc):[],[chart,western]);
const forecast=useMemo(()=>chart&&western?yearlyForecast(chart,western,year):null,[chart,western,year]);
const radar=useMemo(()=>chart&&western?radarValues(chart,western):null,[chart,western]);

function applyPlace(city,setter){const coords=PLACES[city];setter(f=>({...f,city,...(coords?{latitude:String(coords[0]),longitude:String(coords[1])}:{latitude:'',longitude:''})}))}
function validate(f){return f.gender&&f.date&&f.time&&f.city&&f.latitude!==''&&f.longitude!==''}
function generate(e){e?.preventDefault();setError('');if(!validate(form)){setError('請完整填寫性別、出生日期、出生時間與出生地。');return}try{const idx=timeToIndex(form.time),result=astro.bySolar(form.date,idx,form.gender,true,'zh-TW'),w=computeWestern(form);setChart(result);setWestern(w);setSelected(Math.max(0,result.palaces.findIndex(p=>p.name==='命宮'||p.name==='命宫')));setTimeout(()=>document.getElementById('result')?.scrollIntoView({behavior:'smooth'}),80)}catch(err){console.error(err);setError('計算失敗，請確認日期、時間、時區與出生地經緯度。')}}
function generatePartner(e){e?.preventDefault();if(!validate(partner)){setCompat({error:'請完整填寫對方的出生資料。'});return}try{const w=computeWestern(partner);setPartnerWestern(w);setCompat(compatibility(western,w))}catch(err){setCompat({error:'合盤計算失敗，請檢查資料。'})}}
async function shareResult(){const text=shareText(form.name,chart,western);try{if(navigator.share){await navigator.share({title:'星命之境｜我的四重人格',text})}else{await navigator.clipboard.writeText(text);setShareStatus('結果摘要已複製！');setTimeout(()=>setShareStatus(''),2200)}}catch{}}

return <div className="app">
<header className="nav"><div className="brand"><span className="orb">✦</span><div><b>星命之境</b><small>ASTRO DESTINY</small></div></div><nav><a href="#generate">命盤</a><a href="#year">流年</a><a href="#match">合盤</a><a href="#ask">問命</a><a href="#share">分享</a></nav></header>
<main>
<section id="home" className="hero"><div className="rings"></div><div className="hero-inner"><span className="eyebrow">紫微斗數 × 太陽 × 月亮 × 上升</span><h1>你的出生時刻，<br/>藏著一張<span>專屬的人生地圖</span>。</h1><p>命盤、流年、愛情合盤、智慧問命與分享卡，一站完成。</p><a className="primary" href="#generate">開始我的完整命盤</a></div></section>

<section id="generate" className="section"><div className="section-head"><span>01</span><div><h2>輸入出生資料</h2><p>不預載個人資料；上升星座請盡量使用正確出生時間與地點。</p></div></div>
<form className="form-card" onSubmit={generate}>
<label>姓名／暱稱（選填）<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="請輸入姓名或暱稱"/></label>
<label>性別<select required value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option value="" disabled>請選擇性別</option><option value="女">女</option><option value="男">男</option></select></label>
<label>出生日期<input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>出生時間<input required type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></label>
<label>出生地<input required list="places" value={form.city} onChange={e=>applyPlace(e.target.value,setForm)} placeholder="請選擇或輸入出生地"/><datalist id="places">{Object.keys(PLACES).map(x=><option key={x} value={x}/>)}</datalist></label>
<label>UTC 時區<select value={form.tz} onChange={e=>setForm({...form,tz:e.target.value})}>{[-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,5.5,6,7,8,9,9.5,10,11,12,13,14].map(x=><option key={x} value={x}>{x>=0?'+':''}{x}</option>)}</select></label>
<label>緯度<input required type="number" step="0.0001" value={form.latitude} onChange={e=>setForm({...form,latitude:e.target.value})}/></label><label>經度<input required type="number" step="0.0001" value={form.longitude} onChange={e=>setForm({...form,longitude:e.target.value})}/></label>
<div className="time-hint wide">{form.time&&<>目前時辰：<b>{HOURS[timeToIndex(form.time)]?.[0]}</b>　｜　</>}{sun&&<>太陽星座：<b>{sun.name}</b>　｜　</>}台灣請使用 UTC +8</div>{error&&<div className="error wide">{error}</div>}<button className="primary wide">產生完整命盤</button></form></section>

{chart&&western&&<>
<section id="result" className="section"><div className="section-head"><span>02</span><div><h2>{form.name||'你的'}紫微斗數命盤</h2><p>{form.date}・{form.time}・{form.city}</p></div></div>
<div className="summary-grid"><article><small>農曆</small><b>{chart.lunarDate}</b></article><article><small>時辰</small><b>{chart.time}</b></article><article><small>五行局</small><b>{chart.fiveElementsClass}</b></article><article><small>命主</small><b>{chart.soul}</b></article><article><small>身主</small><b>{chart.body}</b></article><article><small>生肖</small><b>{chart.zodiac}</b></article></div>
<div className="chart-layout"><div className="palace-grid">{palaceRows.map((p,i)=><button key={`${p.name}-${i}`} className={`palace ${i===selected?'active':''}`} onClick={()=>setSelected(i)}><div className="palace-top"><span>{p.heavenlyStem}{p.earthlyBranch}</span>{p.isBodyPalace&&<em>身宮</em>}</div><h3>{palaceTitle(p.name)}</h3><div className="stars">{p.majorStars?.length?p.majorStars.map(s=>s.name).join('・'):'無主星'}</div><small>大限 {p.decadal?.range?.join('–')||'—'}</small></button>)}</div>{selectedPalace&&<aside className="detail-card"><span className="eyebrow">宮位詳細</span><h2>{palaceTitle(selectedPalace.name)}</h2><div className="detail-block"><small>主星</small><p>{selectedPalace.majorStars?.length?selectedPalace.majorStars.map(s=>s.name).join('、'):'無主星'}</p></div><div className="detail-block"><small>主星解析</small><p>{starText(selectedPalace)}</p></div></aside>}</div></section>

<section className="section"><div className="section-head"><span>03</span><div><h2>西洋占星｜三大星座</h2><p>太陽＝核心自我、月亮＝內在情緒、上升＝外在風格。</p></div></div><div className="big-three">
{[['☉','太陽星座',western.sun,'核心自我'],['☾','月亮星座',western.moon,'情緒與安全感'],['↑','上升星座',western.asc,'第一印象與外在風格']].map(([symbol,label,s,desc])=><article className="big-card" key={label}><div className="big-symbol">{symbol}</div><small>{label}</small><h2>{s.name}</h2><b>{desc}</b><p>{s.keywords}</p>{s.degree!=null&&<span>{s.degree.toFixed(1)}°</span>}</article>)}</div></section>

<section className="section"><div className="section-head"><span>04</span><div><h2>四重人格＋雷達圖</h2><p>把紫微命宮、太陽、月亮、上升轉成可視化人格地圖。</p></div></div><div className="fourfold enhanced">
<div className="radar-wrap"><svg viewBox="0 0 220 220" className="radar">{[.25,.5,.75,1].map(k=><polygon key={k} points={radarPoints([k*100,k*100,k*100,k*100,k*100,k*100])}/>) }<polygon className="radar-data" points={radarPoints(radar)}/>{['行動','情緒','社交','穩定','創造','決斷'].map((t,i)=>{const a=-Math.PI/2+i*Math.PI*2/6;return <text key={t} x={110+Math.cos(a)*101} y={114+Math.sin(a)*101} textAnchor="middle">{t}</text>})}</svg></div>
<div><span className="eyebrow">FOURFOLD PERSONALITY</span><h2>你的四重人格地圖</h2><p>{fourfoldText(chart,western.sun,western.moon,western.asc)}</p></div></div>
<div className="analysis-grid">{analyses.map((a,i)=><article className="analysis-card" key={a.title}><div className="analysis-icon">{a.icon}</div><small>{String(i+1).padStart(2,'0')}・{a.source}</small><h3>{a.title}</h3><p>{a.summary}</p><div className="analysis-note"><b>優勢</b><span>{a.strength}</span></div><div className="analysis-note"><b>留意</b><span>{a.challenge}</span></div></article>)}</div></section>

<section id="year" className="section"><div className="section-head"><span>05</span><div><h2>{year} 流年運勢</h2><p>以你的命盤與三大星座產生年度主題與月份節奏。</p></div></div>
<div className="forecast-card"><div><span className="eyebrow">YEAR THEME</span><h2>{forecast.theme}</h2><p>{forecast.summary}</p><select className="year-select" value={year} onChange={e=>setYear(Number(e.target.value))}>{[year-1,year,year+1,year+2].map(y=><option key={y}>{y}</option>)}</select></div>
<div className="score-grid">{Object.entries({事業:forecast.scores.career,感情:forecast.scores.love,財富:forecast.scores.money,成長:forecast.scores.growth}).map(([k,v])=><div key={k}><span>{k}</span><b>{v}</b><div className="meter"><i style={{width:`${v}%`}}/></div></div>)}</div></div>
<div className="months">{forecast.months.map(x=><div key={x.m}><b>{x.m}月</b><span>{x.score}</span><i style={{height:`${x.score}%`}}/></div>)}</div></section>

<section id="match" className="section"><div className="section-head"><span>06</span><div><h2>愛情合盤</h2><p>輸入第二個人的出生資料，比較太陽、月亮與上升的互動。</p></div></div>
<form className="form-card compact" onSubmit={generatePartner}><label>對方姓名<input value={partner.name} onChange={e=>setPartner({...partner,name:e.target.value})}/></label><label>性別<select required value={partner.gender} onChange={e=>setPartner({...partner,gender:e.target.value})}><option value="" disabled>請選擇</option><option value="女">女</option><option value="男">男</option></select></label><label>出生日期<input required type="date" value={partner.date} onChange={e=>setPartner({...partner,date:e.target.value})}/></label><label>出生時間<input required type="time" value={partner.time} onChange={e=>setPartner({...partner,time:e.target.value})}/></label><label>出生地<input required list="places" value={partner.city} onChange={e=>applyPlace(e.target.value,setPartner)} placeholder="請選擇出生地"/></label><label>UTC 時區<select value={partner.tz} onChange={e=>setPartner({...partner,tz:e.target.value})}><option value="8">+8 台灣</option><option value="9">+9</option><option value="0">+0</option><option value="-5">-5</option></select></label><input type="hidden" value={partner.latitude}/><input type="hidden" value={partner.longitude}/><button className="primary wide">計算愛情合盤</button></form>
{compat&&<div className="match-result">{compat.error?<p>{compat.error}</p>:<><div className="compat-score"><b>{compat.score}</b><span>默契指數</span></div><div><h3>{form.name||'你'} × {partner.name||'對方'}</h3><p>{compat.summary}</p><div className="chips"><span>太陽 {compat.sun*10}%</span><span>月亮 {compat.moon*10}%</span><span>上升 {compat.asc*10}%</span></div></div></>}</div>}</section>

<section id="ask" className="section"><div className="section-head"><span>07</span><div><h2>智慧問命</h2><p>目前是「命盤規則版」智慧解讀，不會把出生資料傳到外部 AI。</p></div></div><div className="ask-card"><div className="quick-asks">{['今年工作運如何？','我的感情模式？','財運要注意什麼？','今年整體運勢？'].map(q=><button key={q} onClick={()=>{setQuestion(q);setAnswer(smartAnswer(q,chart,western,forecast))}}>{q}</button>)}</div><textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="例如：我今年適合轉職嗎？"/><button className="primary" onClick={()=>setAnswer(smartAnswer(question,chart,western,forecast))}>解析我的問題</button>{answer&&<div className="answer-box"><span>ASTRO ANSWER</span><p>{answer}</p></div>}</div></section>

<section id="share" className="section"><div className="section-head"><span>08</span><div><h2>命盤分享卡</h2><p>把四重人格摘要分享給朋友或複製到社群貼文。</p></div></div><div className="share-card"><span className="share-star">✦</span><small>ASTRO DESTINY</small><h2>{form.name||'我的'}四重人格</h2><div className="share-signs"><span>太陽<b>{western.sun.name}</b></span><span>月亮<b>{western.moon.name}</b></span><span>上升<b>{western.asc.name}</b></span><span>命主<b>{chart.soul||'—'}</b></span></div><p>{shareText(form.name,chart,western)}</p><button className="primary" onClick={shareResult}>分享我的結果</button>{shareStatus&&<em>{shareStatus}</em>}</div></section>
<p className="disclaimer">占星與命理內容供文化、娛樂與自我探索參考，不應作為醫療、法律、財務或重大人生決策的唯一依據。</p>
</>}
</main></div>}
createRoot(document.getElementById('root')).render(<App/>);
