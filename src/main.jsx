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
const MUTAGEN_LABELS=['祿','權','科','忌'];
const MUTAGEN_TEXT={祿:'資源、機會、順勢與獲得感',權:'推進、掌控、責任與執行力',科:'名聲、學習、表現與被看見',忌:'卡點、執著、壓力與需要修正的課題'};
const PALACE_TOPIC={命宮:'自我定位',兄弟宮:'手足與合作',夫妻宮:'感情與伴侶',子女宮:'創造與子女',財帛宮:'財務與資源',疾厄宮:'身心節奏',遷移宮:'外部機會',交友宮:'人脈與社群',僕役宮:'人脈與社群',官祿宮:'事業與方向',田宅宮:'家庭與資產',福德宮:'內在與幸福感',父母宮:'長輩與支持'};

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
function calcSun(utc){return signFromLon(planetLongitude('Sun',utc))}
function computeWestern(form){const utc=localToUtc(form.date,form.time,form.tz),sun=calcSun(utc),moon=calcMoon(utc),asc=calcAscendant(utc,form.latitude,form.longitude);return{sun,moon,asc,utc}}
function makeAnalysis(chart,sun,moon,asc){const p={personality:findPalace(chart,HOUSE_MAP.personality),love:findPalace(chart,HOUSE_MAP.love),career:findPalace(chart,HOUSE_MAP.career),wealth:findPalace(chart,HOUSE_MAP.wealth),social:findPalace(chart,HOUSE_MAP.social),talent:findPalace(chart,HOUSE_MAP.talent)};return[
{icon:'✦',title:'核心性格',source:`命宮 × 太陽${sun.name}`,summary:`太陽${sun.name}代表你的核心意志；${starText(p.personality)}`,strength:`核心傾向是「${sun.keywords}」。`,challenge:signAdvice(sun)},
{icon:'☾',title:'內在情緒',source:`月亮${moon.name}`,summary:`月亮${moon.name}描述你私下的情緒需求與安全感模式。${moon.emotion}`,strength:'理解自己的情緒節奏後，更容易穩定回應壓力。',challenge:'情緒需求未被看見時，容易用習慣性的防衛方式反應。'},
{icon:'↑',title:'外在形象',source:`上升${asc.name}`,summary:`上升${asc.name}代表別人初見你時感受到的氣質。${asc.mask}`,strength:'善用第一印象與行動風格，可以提升人際與職場辨識度。',challenge:'外在形象不一定等於真實內心。'},
{icon:'♡',title:'愛情與感情',source:palaceTitle(p.love?.name||'夫妻宮'),summary:`${starText(p.love)} 月亮${moon.name}也會影響你真正需要的情感安全感。`,strength:'把關係需求說清楚，互動會更成熟。',challenge:'避免只憑外在吸引忽略長期相處節奏。'},
{icon:'⌁',title:'工作與事業',source:palaceTitle(p.career?.name||'官祿宮'),summary:`${starText(p.career)} 太陽${sun.name}補充你想成為什麼樣的人。`,strength:'整合核心動機與工作能力，容易形成個人品牌。',challenge:'方向太多時要設定優先級。'},
{icon:'◈',title:'財富與資源',source:palaceTitle(p.wealth?.name||'財帛宮'),summary:starText(p.wealth),strength:'依自己的決策節奏與專業優勢建立長期資源。',challenge:'財務仍應以真實現金流與風險承受度為準。'}]}
function fourfoldText(chart,sun,moon,asc){const life=findPalace(chart,HOUSE_MAP.personality),stars=life?.majorStars?.map(s=>s.name).join('、')||'無主星';return`你的核心自我是太陽${sun.name}，內在情緒以月亮${moon.name}運作，外在第一印象呈現上升${asc.name}風格；紫微命宮主星為${stars}。太陽描述「我想成為誰」，月亮描述「我需要什麼才安心」，上升描述「我如何進入世界」，紫微命宮補充你在人生結構中的主要驅動。`}
function allPalaceStars(p){return[...(p?.majorStars||[]),...(p?.minorStars||[]),...(p?.adjectiveStars||[])]}
function originMutagens(chart){
  const rows=[];
  chart?.palaces?.forEach(p=>allPalaceStars(p).forEach(st=>{if(st.mutagen)rows.push({type:st.mutagen,star:st.name,palace:palaceTitle(p.name),text:MUTAGEN_TEXT[st.mutagen]||''})}));
  return MUTAGEN_LABELS.map(type=>rows.find(x=>x.type===type)||{type,star:'—',palace:'—',text:MUTAGEN_TEXT[type]});
}
function normalizePalaceName(name){return palaceTitle((name||'').replace('仆役','僕役').replace('官禄','官祿').replace('财帛','財帛').replace('迁移','遷移').replace('疾厄','疾厄').replace('夫妻','夫妻').replace('命宫','命').replace('父母','父母').replace('福德','福德').replace('田宅','田宅').replace('兄弟','兄弟').replace('子女','子女'))}
function palaceHostForScope(chart,item,target){
  if(!item?.palaceNames?.length)return null;
  const names=[target,target.replace('宮',''),target.replace('宮','宫')];
  const idx=item.palaceNames.findIndex(n=>names.includes(palaceTitle(n))||names.includes(n));
  return idx>=0?chart?.palaces?.[idx]:null;
}
function findStarPalace(chart,starName){return chart?.palaces?.find(p=>allPalaceStars(p).some(s=>s.name===starName))}
function yearlyForecast(chart,western,year){
  try{
    const anchor=`${year}-07-01`;
    const h=chart.horoscope(anchor,6);
    const yearly=h?.yearly||{};
    const decadal=h?.decadal||{};
    const muts=(yearly.mutagen||[]).map((star,i)=>({type:MUTAGEN_LABELS[i]||'—',star,palace:palaceTitle(findStarPalace(chart,star)?.name||'—'),text:MUTAGEN_TEXT[MUTAGEN_LABELS[i]]||''}));
    const focus=[['命宮','年度自我主題'],['官祿宮','事業與職涯'],['財帛宮','財務與資源'],['夫妻宮','感情與合作']].map(([palace,label])=>{
      const host=palaceHostForScope(chart,yearly,palace);
      return{palace,label,host:host?palaceTitle(host.name):'—',stars:host?.majorStars?.map(s=>s.name).join('、')||'無主星',text:host?starText(host):'暫無資料'};
    });
    const months=Array.from({length:12},(_,i)=>{
      try{const mm=String(i+1).padStart(2,'0'),mh=chart.horoscope(`${year}-${mm}-15`,6)?.monthly||{};return{m:i+1,stem:`${mh.heavenlyStem||''}${mh.earthlyBranch||''}`,mutagen:(mh.mutagen||[]).map((x,j)=>`${x}化${MUTAGEN_LABELS[j]}`).slice(0,2).join('・')||'觀察節奏'}}catch{return{m:i+1,stem:'',mutagen:'觀察節奏'}}
    });
    const life=focus[0];
    return{source:'iztro 運限',yearly,decadal,mutagens:muts,focus,months,theme:`${yearly.heavenlyStem||''}${yearly.earthlyBranch||''}流年・${life?.host||'命宮主題'}`,summary:`${year} 年以流年命宮落在「${life?.host||'—'}」作為主軸。${life?.text||''} 同時參考流年四化與目前大限，較適合用來理解年度重點，而不是把運勢壓成單一分數。`};
  }catch(err){console.warn('yearly horoscope failed',err);return{source:'基礎模式',yearly:{},decadal:{},mutagens:[],focus:[],months:[],theme:`${year} 年度觀察`,summary:`目前無法取得 ${year} 的紫微運限資料，仍可參考本命與西洋星盤。`}}
}
function compatibility(a,b){const pair=(x,y)=>ELEMENT_COMPAT[x.element]?.[y.element]||6;const sun=pair(a.sun,b.sun),moon=pair(a.moon,b.moon),asc=pair(a.asc,b.asc),score=Math.round((sun*3+moon*4+asc*3)*10/10);return{score:Math.min(100,score),sun,moon,asc,summary:score>=82?'高默契組合：吸引力與理解度都不錯，適合建立共同目標。':score>=68?'中高默契：有互補優勢，關鍵在於情緒表達與溝通節奏。':'互補挑戰型：差異明顯，但如果願意理解彼此需求，也可能形成強烈成長關係。'}}
function radarValues(chart,w){const stars=findPalace(chart,HOUSE_MAP.personality)?.majorStars?.length||1;const map={火:[88,58,76,62,82,86],土:[66,72,58,90,64,78],風:[74,62,92,54,88,66],水:[60,94,72,68,86,58]};const base=map[w.sun.element]||[70,70,70,70,70,70];return base.map((v,i)=>Math.min(98,v+(stars*3+i*2)%9))}
function radarPoints(vals,cx=110,cy=110,r=82){return vals.map((v,i)=>{const a=-Math.PI/2+i*Math.PI*2/6,rr=r*v/100;return`${cx+Math.cos(a)*rr},${cy+Math.sin(a)*rr}`}).join(' ')}
function smartAnswer(q,chart,w,forecast){
  const t=q.trim();if(!t)return'請先輸入你想問的問題。';
  const career=findPalace(chart,HOUSE_MAP.career),love=findPalace(chart,HOUSE_MAP.love),money=findPalace(chart,HOUSE_MAP.wealth);
  const yearlyFocus=(key)=>forecast?.focus?.find(x=>x.palace===key);
  const mutagenText=forecast?.mutagens?.length?`流年四化為：${forecast.mutagens.map(x=>`${x.star}化${x.type}（${x.palace}）`).join('、')}。`:'';
  if(/工作|事業|轉職|職涯/.test(t)){const f=yearlyFocus('官祿宮');return`本命事業宮：${starText(career)} ${f?`${forecast.yearly.heavenlyStem||''}${forecast.yearly.earthlyBranch||''}流年的官祿主題落在${f.host}，${f.text}`:''} ${mutagenText}若要評估是否轉職，建議把命理訊號與薪資、成長性、現金流及實際職缺一起比較。`}
  if(/愛情|感情|伴侶|戀愛/.test(t)){const f=yearlyFocus('夫妻宮');return`本命夫妻宮：${starText(love)} 月亮${w.moon.name}顯示你的情緒安全感需求。${f?`流年夫妻主題落在${f.host}，${f.text}`:''} ${mutagenText}`}
  if(/錢|財|投資|收入/.test(t)){const f=yearlyFocus('財帛宮');return`本命財帛宮：${starText(money)} ${f?`流年財帛主題落在${f.host}，${f.text}`:''} ${mutagenText}命理內容不應取代資產配置、風險承受度與專業財務建議。`}
  if(/今年|流年|運勢/.test(t))return`${forecast.summary} ${mutagenText}`;
  return`四重人格上，太陽${w.sun.name}代表核心方向、月亮${w.moon.name}代表情緒需求、上升${w.asc.name}代表進入世界的方式；紫微命宮則提供人生結構的另一個視角。${forecast?.summary||''}`;
}
function shareText(name,chart,w){return`${name||'我的'}星命之境｜太陽${w.sun.name}・月亮${w.moon.name}・上升${w.asc.name}・命主${chart.soul||'—'}。紫微×西洋占星四重人格解析。`}


// ===== V8 專業命理深度分析引擎 =====
const BRANCH_TRIADS=[['申','子','辰'],['寅','午','戌'],['亥','卯','未'],['巳','酉','丑']];
const BRANCH_OPPOSITE={子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
const PALACE_DEEP_MEANING={
  命宮:'人格核心、人生方向與面對世界的基本方式',兄弟宮:'手足、同輩、合作資源與互助模式',夫妻宮:'親密關係、婚姻、合作與擇偶模式',子女宮:'創造力、子女緣、作品與延伸成果',財帛宮:'賺錢方式、資源觀、現金流與價值交換',疾厄宮:'身心節奏、壓力反應與日常健康管理',遷移宮:'外出、變動、遠方機會與外部舞台',交友宮:'人脈、朋友、社群、合作夥伴與團隊互動',僕役宮:'人脈、朋友、社群、合作夥伴與團隊互動',官祿宮:'職涯定位、成就方式、工作責任與社會角色',田宅宮:'家庭、居所、不動產、生活基地與安全感',福德宮:'精神狀態、休息方式、內在滿足與人生幸福感',父母宮:'長輩、主管、制度、支持來源與權威關係'
};
const BRIGHTNESS_NOTE={廟:'星曜力量較完整，較容易主動發揮其優勢。',旺:'能量活躍，通常較容易被看見與運用。',得:'具有可用優勢，仍需搭配宮位與會照星曜判讀。',利:'表現較順手，但仍受整體命盤結構影響。',平:'能量中性，優缺點較取決於搭配與情境。',不:'力量較受限制，宜透過後天策略調整。',陷:'表現較容易出現壓力面，並不等同絕對凶象。'};
const DOMAIN_CONFIG=[
  {key:'career',icon:'⌁',title:'事業與職涯',palace:'官祿宮',support:['命宮','財帛宮','遷移宮'],western:['Mercury','Jupiter','Saturn']},
  {key:'love',icon:'♡',title:'感情與婚姻',palace:'夫妻宮',support:['命宮','福德宮','遷移宮'],western:['Venus','Mars','Moon']},
  {key:'wealth',icon:'◈',title:'財富與資源',palace:'財帛宮',support:['官祿宮','田宅宮','福德宮'],western:['Venus','Jupiter','Saturn']},
  {key:'self',icon:'✦',title:'人生定位',palace:'命宮',support:['官祿宮','財帛宮','遷移宮'],western:['Sun','Moon']},
  {key:'social',icon:'◎',title:'人際與外部機會',palace:'交友宮',support:['遷移宮','命宮','官祿宮'],western:['Mercury','Jupiter']},
  {key:'wellbeing',icon:'☾',title:'身心與福德',palace:'福德宮',support:['疾厄宮','命宮','田宅宮'],western:['Moon','Saturn']}
];
function canonicalPalaceName(name){
  let s=palaceTitle(name||'').replace('宫','宮').replace('官禄','官祿').replace('财帛','財帛').replace('迁移','遷移').replace('仆役','僕役');
  if(s==='僕役宮')s='交友宮';
  return s;
}
function palaceByCanonical(chart,name){return chart?.palaces?.find(p=>canonicalPalaceName(p.name)===canonicalPalaceName(name))||null}
function starNames(p,kind='all'){
  const rows=kind==='major'?(p?.majorStars||[]):kind==='minor'?(p?.minorStars||[]):allPalaceStars(p);
  return rows.map(s=>`${s.name}${s.brightness?`（${s.brightness}）`:''}${s.mutagen?`・化${s.mutagen}`:''}`).join('、')||'—';
}
function starBrightnessReading(p){
  const rows=(p?.majorStars||[]).filter(s=>s.brightness);
  if(!rows.length)return'主星亮度資料未提供，應搭配主星組合、四化與三方四正閱讀。';
  return rows.map(s=>`${s.name}${s.brightness}：${BRIGHTNESS_NOTE[s.brightness]||'需搭配整體命盤判讀。'}`).join(' ');
}
function sanFangSiZheng(chart,p){
  if(!p?.earthlyBranch)return{triad:[],opposite:null,all:[]};
  const triadGroup=BRANCH_TRIADS.find(g=>g.includes(p.earthlyBranch))||[];
  const triad=(chart?.palaces||[]).filter(x=>triadGroup.includes(x.earthlyBranch)&&x!==p);
  const opposite=(chart?.palaces||[]).find(x=>x.earthlyBranch===BRANCH_OPPOSITE[p.earthlyBranch])||null;
  const all=[p,...triad,...(opposite?[opposite]:[])].filter((x,i,a)=>a.indexOf(x)===i);
  return{triad,opposite,all};
}
function mutagensAround(chart,p){
  const frame=sanFangSiZheng(chart,p).all;
  const rows=[];
  frame.forEach(x=>allPalaceStars(x).forEach(s=>{if(s.mutagen)rows.push({type:s.mutagen,star:s.name,palace:canonicalPalaceName(x.name)})}));
  return rows;
}
function palaceDeepAnalysis(chart,p){
  if(!p)return null;
  const name=canonicalPalaceName(p.name),frame=sanFangSiZheng(chart,p),muts=mutagensAround(chart,p);
  const core=starText(p);
  const triadText=frame.triad.length?frame.triad.map(x=>`${canonicalPalaceName(x.name)}（${starNames(x,'major')}）`).join('、'):'—';
  const oppositeText=frame.opposite?`${canonicalPalaceName(frame.opposite.name)}（${starNames(frame.opposite,'major')}）`:'—';
  const mutText=muts.length?muts.map(x=>`${x.star}化${x.type}在${x.palace}`).join('、'):'本宮三方四正未讀到生年四化標記';
  const bodyNote=p.isBodyPalace?'此宮同時為身宮，代表後天投入、實際行動與人生重心更容易在此領域被放大。':'此宮不是身宮，仍需與身宮所在領域交叉閱讀。';
  return{
    name,topic:PALACE_DEEP_MEANING[name]||PALACE_TOPIC[name]||'人生特定領域',core,
    brightness:starBrightnessReading(p),major:starNames(p,'major'),minor:starNames(p,'minor'),
    triadText,oppositeText,mutText,bodyNote,
    synthesis:`${name}主要看「${PALACE_DEEP_MEANING[name]||'此人生領域'}」。${core} ${bodyNote} 三方會照為${triadText}；對宮為${oppositeText}。${muts.length?`四化會照：${mutText}。`:''}`
  };
}
function domainDeepAnalysis(chart,natal,western,config){
  const p=palaceByCanonical(chart,config.palace),deep=palaceDeepAnalysis(chart,p);
  const supports=config.support.map(n=>palaceByCanonical(chart,n)).filter(Boolean);
  const westernRows=(natal||[]).filter(x=>config.western.includes(x.key));
  const supportText=supports.map(x=>`${canonicalPalaceName(x.name)}：${starNames(x,'major')}`).join('；')||'—';
  const westText=westernRows.map(x=>`${x.name}${x.sign.name}第${x.house}宮`).join('、')||`${western.sun.name}／${western.moon.name}`;
  return{...config,deep,supportText,westText,text:`紫微主軸以${config.palace}為核心：${deep?.core||'—'} 旁參${supportText}。西洋占星交叉參考：${westText}。解讀時優先看是否出現重複主題，而不是用單一星曜直接下結論。`};
}
function decadalProfessional(chart,forecast){
  const d=forecast?.decadal||{};
  const focus=['命宮','官祿宮','財帛宮','夫妻宮'].map(name=>{
    const host=palaceHostForScope(chart,d,name);
    return{name,host:host?canonicalPalaceName(host.name):'—',stars:host?starNames(host,'major'):'—',text:host?starText(host):'暫無資料'};
  });
  const mutagens=(d.mutagen||[]).map((star,i)=>({type:MUTAGEN_LABELS[i]||'—',star,palace:canonicalPalaceName(findStarPalace(chart,star)?.name||'—')}));
  return{focus,mutagens,label:`${d.heavenlyStem||''}${d.earthlyBranch||''}大限`,summary:`大限用來觀察約十年的舞台與長期課題。這一層不應只看單一吉凶，而要把大限命宮、官祿、財帛、夫妻與大限四化一起閱讀，再疊加流年確認當年的觸發點。`};
}
function professionalOverview(chart,western,natal,forecast){
  const life=palaceByCanonical(chart,'命宮'),body=(chart?.palaces||[]).find(p=>p.isBodyPalace),career=palaceByCanonical(chart,'官祿宮'),wealth=palaceByCanonical(chart,'財帛宮'),love=palaceByCanonical(chart,'夫妻宮'),bless=palaceByCanonical(chart,'福德宮');
  const lifeDeep=palaceDeepAnalysis(chart,life),yearMuts=forecast?.mutagens||[];
  const strongest=(natalAspects(natal||[])[0]);
  return{
    headline:`${starNames(life,'major')}命格 × 太陽${western.sun.name} × 月亮${western.moon.name} × 上升${western.asc.name}`,
    identity:`命宮落在${life?.earthlyBranch||'—'}，主星為${starNames(life,'major')}。${lifeDeep?.brightness||''}${body?` 身宮位於${canonicalPalaceName(body.name)}，後天重心容易往「${PALACE_DEEP_MEANING[canonicalPalaceName(body.name)]||'該領域'}」集中。`:''}`,
    career:`事業宮主星為${starNames(career,'major')}，財帛宮為${starNames(wealth,'major')}。這兩宮適合一起看「做什麼」與「如何形成資源」；再由遷移宮確認外部舞台。`,
    relation:`夫妻宮主星為${starNames(love,'major')}，福德宮為${starNames(bless,'major')}。感情判讀除了伴侶互動，也要看內在安全感與休息方式；月亮${western.moon.name}提供情緒需求的交叉線索。`,
    timing:`${forecast?.summary||''}${yearMuts.length?` 流年四化：${yearMuts.map(x=>`${x.star}化${x.type}→${x.palace}`).join('、')}。`:''}`,
    west:`西洋本命盤以${western.sun.name}太陽、${western.moon.name}月亮、${western.asc.name}上升構成三大核心。${strongest?`目前最緊密的主要相位之一為${strongest.a.name}與${strongest.b.name}${strongest.name}（容許度${strongest.orb.toFixed(1)}°），可作為心理動力的補充線索。`:''}`
  };
}


const PLANETS=[
['Sun','太陽','☉','核心自我與生命意志'],['Moon','月亮','☾','情緒、安全感與本能'],
['Mercury','水星','☿','思考、學習與溝通'],['Venus','金星','♀','愛情、審美與價值'],
['Mars','火星','♂','行動、慾望與競爭'],['Jupiter','木星','♃','擴張、機會與信念'],
['Saturn','土星','♄','責任、界線與成熟'],['Uranus','天王星','♅','自由、改革與突破'],
['Neptune','海王星','♆','想像、直覺與理想'],['Pluto','冥王星','♇','深層轉化與力量']
];
const MODES={牡羊座:'基本',巨蟹座:'基本',天秤座:'基本',摩羯座:'基本',金牛座:'固定',獅子座:'固定',天蠍座:'固定',水瓶座:'固定',雙子座:'變動',處女座:'變動',射手座:'變動',雙魚座:'變動'};
const PLANET_TEXT={
Sun:'你建立自我認同、展現意志與追求成就的方式。',Moon:'你在私下如何感受、尋找安全感與回應情緒。',
Mercury:'你吸收資訊、做判斷、說話與學習的方式。',Venus:'你如何喜歡一個人、建立價值感，以及被什麼美感吸引。',
Mars:'你採取行動、競爭、表達慾望與捍衛界線的方式。',Jupiter:'你容易擴張、獲得信心與看見機會的領域。',
Saturn:'你需要耐心練習、承擔責任並建立成熟能力的課題。',Uranus:'你不願被框架限制、想創新與突破傳統的地方。',
Neptune:'你的想像、理想、同理與容易投射期待的部分。',Pluto:'你面對控制、失去、重生與深層心理力量的方式。'
};
function planetLongitude(bodyName,utc){
  if(bodyName==='Moon') return calcMoon(utc).longitude;
  const body=Astronomy.Body[bodyName];
  const vec=Astronomy.GeoVector(body,utc,true);
  return norm360(Astronomy.Ecliptic(vec).elon);
}
function fullNatal(utc){
  return PLANETS.map(([key,name,symbol,meaning])=>{
    const lon=planetLongitude(key,utc),sign=signFromLon(lon);
    return {key,name,symbol,meaning,lon,sign,mode:MODES[sign.name]};
  });
}
function angularDiff(a,b){const d=Math.abs(norm360(a-b));return d>180?360-d:d}
const ASPECTS=[['合相',0,8,'融合／放大'],['六分相',60,5,'機會／協調'],['四分相',90,7,'張力／成長'],['三分相',120,7,'天賦／流動'],['對分相',180,8,'拉扯／平衡']];
function natalAspects(planets){
  const rows=[];
  for(let i=0;i<planets.length;i++)for(let j=i+1;j<planets.length;j++){
    const d=angularDiff(planets[i].lon,planets[j].lon);
    for(const [name,angle,orb,nature] of ASPECTS){
      const delta=Math.abs(d-angle);
      if(delta<=orb){rows.push({a:planets[i],b:planets[j],name,angle,orb:delta,nature});break}
    }
  }
  return rows.sort((x,y)=>x.orb-y.orb).slice(0,18);
}
function natalBalance(planets){
  const elements={火:0,土:0,風:0,水:0},modes={基本:0,固定:0,變動:0};
  planets.forEach(p=>{elements[p.sign.element]++;modes[p.mode]++});
  return {elements,modes};
}
function planetInterpret(p){
  const flavor={火:'表現較直接、主動，重視行動與熱情。',土:'傾向務實、穩定，重視可落地的成果。',風:'偏向思考、溝通與交換觀點。',水:'感受細膩，重視情緒、直覺與關係深度。'}[p.sign.element];
  return `${PLANET_TEXT[p.key]} ${p.name}落在${p.sign.name}，${flavor}`;
}
function aspectInterpret(a){
  const core={合相:'兩股能量彼此融合，感受通常較強烈。',六分相:'兩股能量容易找到合作機會，需要主動運用。',四分相:'容易形成內在張力，但也是推動成長的重要力量。',三分相:'兩股能量自然流動，常形成容易被忽略的天賦。',對分相:'兩端需求彼此拉扯，課題是找到平衡與整合。'}[a.name];
  return `${a.a.name} × ${a.b.name}｜${core}`;
}


const HOUSE_MEANINGS=[
'自我、外在形象、人生起點','金錢、價值感、資源與收入','溝通、學習、手足與日常移動',
'家庭、根源、居所與內在安全','戀愛、創造、子女與自我表達','工作習慣、健康管理與服務',
'伴侶、婚姻、合作與公開關係','親密、共享資源、危機與轉化','高等學習、遠行、信念與視野',
'事業、名聲、社會角色與目標','朋友、社群、願景與團體','潛意識、休息、靈性與隱藏模式'
];
const SIGN_RULERS={牡羊座:'Mars',金牛座:'Venus',雙子座:'Mercury',巨蟹座:'Moon',獅子座:'Sun',處女座:'Mercury',天秤座:'Venus',天蠍座:'Pluto',射手座:'Jupiter',摩羯座:'Saturn',水瓶座:'Uranus',雙魚座:'Neptune'};
function equalHouseData(ascLon){
  const cusps=Array.from({length:12},(_,i)=>norm360(ascLon+i*30));
  return {system:'等宮制 Equal House',cusps,mc:null};
}
function houseForLongitude(lon,ascLon){return Math.floor(norm360(lon-ascLon)/30)+1}
function enrichNatalHouses(planets,ascLon){return planets.map(p=>({...p,house:houseForLongitude(p.lon,ascLon)}))}
function houseInterpret(p){return `${p.name}落第${p.house}宮：${HOUSE_MEANINGS[p.house-1]}。${planetInterpret(p)}`}
function dominant(items){return Object.entries(items).sort((a,b)=>b[1]-a[1])[0]}
function rulerAnalysis(planets,asc){
  const key=SIGN_RULERS[asc.name],p=planets.find(x=>x.key===key);
  return p?{...p,text:`你的上升是${asc.name}，命主星為${p.name}。命主星落${p.sign.name}第${p.house}宮，表示人生主線特別容易透過「${HOUSE_MEANINGS[p.house-1]}」展開。`}:null
}
function careerLoveSynthesis(planets,western,chart){
  const venus=planets.find(p=>p.key==='Venus'),mars=planets.find(p=>p.key==='Mars'),mercury=planets.find(p=>p.key==='Mercury'),jupiter=planets.find(p=>p.key==='Jupiter'),saturn=planets.find(p=>p.key==='Saturn');
  const career=findPalace(chart,HOUSE_MAP.career),love=findPalace(chart,HOUSE_MAP.love);
  return {
    love:`紫微夫妻宮：${starText(love)} 西洋占星中，金星${venus.sign.name}落第${venus.house}宮描述你的喜愛與關係價值；火星${mars.sign.name}落第${mars.house}宮描述你主動追求、慾望與界線的方式。月亮${western.moon.name}則補充真正的情緒安全感。`,
    career:`紫微事業宮：${starText(career)} 水星${mercury.sign.name}第${mercury.house}宮反映思考與溝通優勢；木星${jupiter.sign.name}第${jupiter.house}宮指出較容易擴張的領域；土星${saturn.sign.name}第${saturn.house}宮則是需要長期累積與承擔責任的課題。`
  }
}
function aspectTone(name){return name==='三分相'||name==='六分相'?'flow':name==='四分相'||name==='對分相'?'challenge':'blend'}

function App(){
const empty={name:'',gender:'',date:'',time:'',city:'',latitude:'',longitude:'',tz:'8'};
const [form,setForm]=useState(empty),[chart,setChart]=useState(null),[western,setWestern]=useState(null),[error,setError]=useState(''),[selected,setSelected]=useState(0);
const [year,setYear]=useState(new Date().getFullYear()),[partner,setPartner]=useState({...empty,name:'對方'}),[partnerWestern,setPartnerWestern]=useState(null),[compat,setCompat]=useState(null);
const [question,setQuestion]=useState(''),[answer,setAnswer]=useState(''),[shareStatus,setShareStatus]=useState('');
const sun=useMemo(()=>form.date?sunSignFromDate(form.date):null,[form.date]),selectedPalace=chart?.palaces?.[selected],palaceRows=useMemo(()=>chart?.palaces||[],[chart]);
const analyses=useMemo(()=>chart&&western?makeAnalysis(chart,western.sun,western.moon,western.asc):[],[chart,western]);
const forecast=useMemo(()=>chart&&western?yearlyForecast(chart,western,year):null,[chart,western,year]);
const natalMutagens=useMemo(()=>chart?originMutagens(chart):[],[chart]);
const radar=useMemo(()=>chart&&western?radarValues(chart,western):null,[chart,western]);
const natalRaw=useMemo(()=>western?fullNatal(western.utc):[],[western]);
const houses=useMemo(()=>western?equalHouseData(western.asc.longitude):null,[western]);
const natal=useMemo(()=>western?enrichNatalHouses(natalRaw,western.asc.longitude):[],[natalRaw,western]);
const aspects=useMemo(()=>natal.length?natalAspects(natal):[],[natal]);
const balance=useMemo(()=>natal.length?natalBalance(natal):null,[natal]);
const ruler=useMemo(()=>western&&natal.length?rulerAnalysis(natal,western.asc):null,[natal,western]);
const synthesis=useMemo(()=>chart&&western&&natal.length?careerLoveSynthesis(natal,western,chart):null,[natal,western,chart]);
const selectedDeep=useMemo(()=>chart&&selectedPalace?palaceDeepAnalysis(chart,selectedPalace):null,[chart,selectedPalace]);
const deepPalaces=useMemo(()=>chart?(chart.palaces||[]).map(p=>palaceDeepAnalysis(chart,p)):[],[chart]);
const professional=useMemo(()=>chart&&western&&natal.length?professionalOverview(chart,western,natal,forecast):null,[chart,western,natal,forecast]);
const domainReadings=useMemo(()=>chart&&western&&natal.length?DOMAIN_CONFIG.map(c=>domainDeepAnalysis(chart,natal,western,c)):[],[chart,western,natal]);
const decadalPro=useMemo(()=>chart&&forecast?decadalProfessional(chart,forecast):null,[chart,forecast]);

function applyPlace(city,setter){const coords=PLACES[city];setter(f=>({...f,city,...(coords?{latitude:String(coords[0]),longitude:String(coords[1])}:{latitude:'',longitude:''})}))}
function validate(f){const lat=Number(f.latitude),lon=Number(f.longitude);return Boolean(f.gender&&f.date&&f.time&&f.city&&f.latitude!==''&&f.longitude!==''&&Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=-90&&lat<=90&&lon>=-180&&lon<=180)}
function generate(e){e?.preventDefault();setError('');if(!validate(form)){setError('請完整填寫性別、出生日期、出生時間與出生地。');return}try{const idx=timeToIndex(form.time),result=astro.bySolar(form.date,idx,form.gender,true,'zh-TW'),w=computeWestern(form);setChart(result);setWestern(w);setSelected(Math.max(0,result.palaces.findIndex(p=>p.name==='命宮'||p.name==='命宫')));setTimeout(()=>document.getElementById('result')?.scrollIntoView({behavior:'smooth'}),80)}catch(err){console.error(err);setError('計算失敗，請確認日期、時間、時區與出生地經緯度。')}}
function generatePartner(e){e?.preventDefault();if(!validate(partner)){setCompat({error:'請完整填寫對方的出生資料。'});return}try{const w=computeWestern(partner);setPartnerWestern(w);setCompat(compatibility(western,w))}catch(err){setCompat({error:'合盤計算失敗，請檢查資料。'})}}
async function shareResult(){const text=shareText(form.name,chart,western);try{if(navigator.share){await navigator.share({title:'星命之境｜我的四重人格',text})}else{await navigator.clipboard.writeText(text);setShareStatus('結果摘要已複製！');setTimeout(()=>setShareStatus(''),2200)}}catch{}}

return <div className="app">
<header className="nav"><div className="brand"><span className="orb">✦</span><div><b>星命之境</b><small>紫微 × 星座命運解析</small></div></div><nav><a href="#generate">命盤</a><a href="#professional">專業總論</a><a href="#natal">本命星盤</a><a href="#year">流年</a><a href="#match">合盤</a><a href="#ask">問命</a><a href="#share">分享</a></nav></header>
<main>
<section id="home" className="hero"><div className="rings"></div><div className="hero-inner"><span className="eyebrow">ASTRO DESTINY V8｜專業命理深度分析</span><h1>你的出生時刻，<br/>藏著一張<span>專屬的人生地圖</span>。</h1><p>V8 專業深度版：整合紫微十二宮、主星亮度、三方四正、四化、大限流年與完整西洋本命星盤，建立多層次的人生地圖。</p><a className="primary" href="#generate">開始我的完整命盤</a></div></section>

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
<div className="chart-layout"><div className="palace-grid">{palaceRows.map((p,i)=><button key={`${p.name}-${i}`} className={`palace ${i===selected?'active':''}`} onClick={()=>setSelected(i)}><div className="palace-top"><span>{p.heavenlyStem}{p.earthlyBranch}</span>{p.isBodyPalace&&<em>身宮</em>}</div><h3>{palaceTitle(p.name)}</h3><div className="stars">{p.majorStars?.length?p.majorStars.map(s=>`${s.name}${s.mutagen?`化${s.mutagen}`:''}`).join('・'):'無主星'}</div><small>大限 {p.decadal?.range?.join('–')||'—'}</small></button>)}</div>{selectedPalace&&selectedDeep&&<aside className="detail-card pro-detail"><span className="eyebrow">V8 PROFESSIONAL PALACE</span><h2>{selectedDeep.name}</h2><div className="detail-badges">{selectedPalace.isBodyPalace&&<span>身宮</span>}<span>{selectedPalace.heavenlyStem}{selectedPalace.earthlyBranch}</span>{selectedPalace.changsheng12&&<span>長生十二神・{selectedPalace.changsheng12}</span>}</div><div className="detail-block"><small>宮位主題</small><p>{selectedDeep.topic}</p></div><div className="detail-block"><small>主星與亮度</small><p>{selectedDeep.major}</p><p className="sub-reading">{selectedDeep.brightness}</p></div><div className="detail-block"><small>輔星／煞曜</small><p>{selectedDeep.minor}</p></div><div className="detail-block"><small>三方會照</small><p>{selectedDeep.triadText}</p></div><div className="detail-block"><small>對宮</small><p>{selectedDeep.oppositeText}</p></div><div className="detail-block"><small>四化會照</small><p>{selectedDeep.mutText}</p></div><div className="detail-block emphasis"><small>老師式綜合判讀</small><p>{selectedDeep.synthesis}</p></div></aside>}</div></section>
<section className="section compact-section"><div className="section-head"><span>02A</span><div><h2>本命四化｜祿・權・科・忌</h2><p>把四化放回「星曜 × 宮位」閱讀，比單看吉凶更有意義。</p></div></div><div className="mutagen-grid">{natalMutagens.map(x=><article className={`mutagen-card mutagen-${x.type}`} key={x.type}><span>化{x.type}</span><h3>{x.star}</h3><b>{x.palace}</b><p>{x.text}</p></article>)}</div></section>

{professional&&<section id="professional" className="section pro-section"><div className="section-head"><span>02B</span><div><h2>30年老師式｜命盤專業總論</h2><p>依「本命結構 → 身宮 → 三方四正 → 四化 → 大限／流年 → 西洋星盤」逐層交叉閱讀。</p></div></div><div className="teacher-hero"><span className="eyebrow">PROFESSIONAL SYNTHESIS</span><h2>{professional.headline}</h2><p>這一區不是用單一星曜下結論，而是把多個重複訊號整合成較完整的命盤敘事。</p></div><div className="teacher-grid"><article><small>01・先天格局</small><h3>命宮 × 身宮</h3><p>{professional.identity}</p></article><article><small>02・事業資源</small><h3>官祿 × 財帛</h3><p>{professional.career}</p></article><article><small>03・感情內在</small><h3>夫妻 × 福德</h3><p>{professional.relation}</p></article><article><small>04・運限觸發</small><h3>大限 × 流年四化</h3><p>{professional.timing}</p></article><article className="wide-card"><small>05・東西交叉</small><h3>紫微 × 西洋本命盤</h3><p>{professional.west}</p></article></div></section>}

<section id="deep-palaces" className="section"><div className="section-head"><span>02C</span><div><h2>十二宮深度論盤</h2><p>每一宮加入主星亮度、輔星、三方四正、對宮、四化會照與綜合判讀；手機版可逐宮展開。</p></div></div><div className="deep-palace-grid">{deepPalaces.map((d,i)=><details className="deep-palace-card" key={`${d.name}-${i}`} open={d.name==='命宮'}><summary><span>{String(i+1).padStart(2,'0')}</span><div><h3>{d.name}</h3><small>{d.topic}</small></div><b>{d.major}</b></summary><div className="deep-palace-body"><p><strong>主星基調</strong>{d.core}</p><p><strong>亮度判讀</strong>{d.brightness}</p><p><strong>三方會照</strong>{d.triadText}</p><p><strong>對宮</strong>{d.oppositeText}</p><p><strong>四化</strong>{d.mutText}</p><div className="teacher-note"><b>綜合</b><span>{d.synthesis}</span></div></div></details>)}</div></section>

<section className="section"><div className="section-head"><span>03</span><div><h2>西洋占星｜三大星座</h2><p>太陽＝核心自我、月亮＝內在情緒、上升＝外在風格。</p></div></div><div className="big-three">
{[['☉','太陽星座',western.sun,'核心自我'],['☾','月亮星座',western.moon,'情緒與安全感'],['↑','上升星座',western.asc,'第一印象與外在風格']].map(([symbol,label,s,desc])=><article className="big-card" key={label}><div className="big-symbol">{symbol}</div><small>{label}</small><h2>{s.name}</h2><b>{desc}</b><p>{s.keywords}</p>{s.degree!=null&&<span>{s.degree.toFixed(1)}°</span>}</article>)}</div></section>

<section className="section"><div className="section-head"><span>04</span><div><h2>四重人格＋雷達圖</h2><p>把紫微命宮、太陽、月亮、上升轉成可視化人格地圖。</p></div></div><div className="fourfold enhanced">
<div className="radar-wrap"><svg viewBox="0 0 220 220" className="radar">{[.25,.5,.75,1].map(k=><polygon key={k} points={radarPoints([k*100,k*100,k*100,k*100,k*100,k*100])}/>) }<polygon className="radar-data" points={radarPoints(radar)}/>{['行動','情緒','社交','穩定','創造','決斷'].map((t,i)=>{const a=-Math.PI/2+i*Math.PI*2/6;return <text key={t} x={110+Math.cos(a)*101} y={114+Math.sin(a)*101} textAnchor="middle">{t}</text>})}</svg></div>
<div><span className="eyebrow">FOURFOLD PERSONALITY</span><h2>你的四重人格地圖</h2><p>{fourfoldText(chart,western.sun,western.moon,western.asc)}</p></div></div>
<div className="analysis-grid">{analyses.map((a,i)=><article className="analysis-card" key={a.title}><div className="analysis-icon">{a.icon}</div><small>{String(i+1).padStart(2,'0')}・{a.source}</small><h3>{a.title}</h3><p>{a.summary}</p><div className="analysis-note"><b>優勢</b><span>{a.strength}</span></div><div className="analysis-note"><b>留意</b><span>{a.challenge}</span></div></article>)}</div></section>

<section id="natal" className="section"><div className="section-head"><span>05</span><div><h2>完整西洋本命星盤</h2><p>十大行星 × 十二宮位 × 主要相位 × 元素模式，從單一星座升級為完整心理結構閱讀。</p></div></div>
<div className="natal-intro"><span className="eyebrow">NATAL CHART PRO</span><h2>你的完整本命星盤</h2><p>本版採熱帶黃道，宮位採等宮制（以精確上升點為第一宮宮頭）。出生時間越準確，宮位解讀越有參考價值。</p><div className="natal-badges"><span>上升 {western.asc.name} {western.asc.degree.toFixed(1)}°</span><span>{houses.system}</span>{ruler&&<span>命主星 {ruler.name}</span>}</div></div>

<div className="section-subhead"><div><span className="eyebrow">10 PLANETS × 12 HOUSES</span><h2>十大行星落座與落宮</h2><p>「星座」描述能量如何表現，「宮位」描述這股能量最常在哪個人生領域發生。</p></div></div>
<div className="planet-grid">{natal.map(p=><article className="planet-card" key={p.key}><div className="planet-head"><span>{p.symbol}</span><div><small>{p.name}</small><h3>{p.sign.name} <em>{p.sign.degree.toFixed(1)}°</em></h3></div><strong>第 {p.house} 宮</strong></div><b>{p.meaning}</b><p>{houseInterpret(p)}</p><div className="chips"><span>{p.sign.element}元素</span><span>{p.mode}宮</span><span>第{p.house}宮</span></div></article>)}</div>

<div className="section-subhead"><div><span className="eyebrow">12 HOUSES</span><h2>十二宮人生領域</h2><p>從上升點開始，每 30° 為一宮；點開可快速理解每一宮代表的人生主題。</p></div></div>
<div className="house-grid">{houses.cusps.map((c,i)=>{const s=signFromLon(c),inside=natal.filter(p=>p.house===i+1);return <article className="house-card" key={i}><small>HOUSE {String(i+1).padStart(2,'0')}</small><h3>第{i+1}宮・{s.name}</h3><b>{HOUSE_MEANINGS[i]}</b><p>{inside.length?`此宮行星：${inside.map(p=>`${p.symbol}${p.name}`).join('、')}`:'此宮無十大行星落入；仍可透過宮頭星座與命主星延伸解讀。'}</p></article>})}</div>

{ruler&&<div className="ruler-card"><div className="ruler-symbol">{ruler.symbol}</div><div><span className="eyebrow">CHART RULER</span><h2>命主星｜{ruler.name}</h2><p>{ruler.text}</p><div className="chips"><span>{ruler.sign.name}</span><span>第{ruler.house}宮</span><span>{ruler.sign.element}元素</span></div></div></div>}

<div className="section-subhead"><div><span className="eyebrow">ELEMENT & MODE</span><h2>四元素 × 三模式</h2><p>觀察整張星盤的能量偏向：你更依靠行動、現實、思考還是感受？又偏向開創、維持還是適應？</p></div></div>
<div className="balance-grid">
<div className="balance-card"><h3>四元素比例</h3>{Object.entries(balance.elements).map(([k,v])=><div className="balance-row" key={k}><span>{k}元素</span><div><i style={{width:`${v*10}%`}}/></div><b>{v*10}%</b></div>)}<p className="balance-summary">主導元素：<b>{dominant(balance.elements)[0]}</b>｜代表你較常使用這種方式理解與回應世界。</p></div>
<div className="balance-card"><h3>三模式比例</h3>{Object.entries(balance.modes).map(([k,v])=><div className="balance-row" key={k}><span>{k}宮</span><div><i style={{width:`${v*10}%`}}/></div><b>{v*10}%</b></div>)}<p className="balance-summary">主導模式：<b>{dominant(balance.modes)[0]}</b>｜反映你面對事情時較自然的推進方式。</p></div>
</div>

<div className="section-subhead"><div><span className="eyebrow">MAJOR ASPECTS</span><h2>主要相位解析</h2><p>相位是行星之間的角度關係。流暢相位偏向自然天賦；緊張相位則常成為推動成長的內在動力。</p></div></div>
<div className="aspect-grid">{aspects.map((a,i)=><article className={`aspect-card ${aspectTone(a.name)}`} key={`${a.a.key}-${a.b.key}-${i}`}><div className="aspect-symbols"><span>{a.a.symbol}</span><i>×</i><span>{a.b.symbol}</span></div><small>{a.a.name} × {a.b.name}</small><h3>{a.name}</h3><b>{a.nature}・容許度 {a.orb.toFixed(1)}°</b><p>{aspectInterpret(a)}</p></article>)}</div>

{synthesis&&<><div className="section-subhead"><div><span className="eyebrow">EAST × WEST SYNTHESIS</span><h2>紫微 × 西洋占星交叉解讀</h2><p>不是把兩套系統分開念，而是把相同人生主題放在一起閱讀。</p></div></div><div className="synthesis-grid"><article><span>♡ LOVE</span><h3>感情與親密關係</h3><p>{synthesis.love}</p></article><article><span>⌁ CAREER</span><h3>事業與發展方向</h3><p>{synthesis.career}</p></article></div></>}

<div className="section-subhead"><div><span className="eyebrow">SIX LIFE DOMAINS</span><h2>六大人生領域｜專業交叉判讀</h2><p>每個主題同時讀取紫微核心宮位、三個支援宮位與對應西洋行星，降低單點判斷的偏差。</p></div></div><div className="domain-grid">{domainReadings.map(d=><article className="domain-card" key={d.key}><div className="domain-head"><span>{d.icon}</span><div><small>{d.palace}</small><h3>{d.title}</h3></div></div><p>{d.text}</p><details><summary>展開專業細節</summary><div><b>三方四正</b><p>{d.deep?.triadText}｜對宮：{d.deep?.oppositeText}</p><b>支援宮位</b><p>{d.supportText}</p><b>西洋交叉</b><p>{d.westText}</p><b>四化會照</b><p>{d.deep?.mutText}</p></div></details></article>)}</div>

<div className="natal-note"><b>計算與解讀說明</b><p>行星位置使用 Astronomy Engine 的地心天文位置計算；本網站將這些天文位置依熱帶黃道轉為占星符號，再以等宮制分配十二宮。占星與紫微解讀屬文化、娛樂與自我探索用途，不代表科學驗證的性格或未來預測。</p></div>
</section>

<section id="year" className="section"><div className="section-head"><span>06</span><div><h2>{year} 紫微流年</h2><p>改以 iztro 的大限、流年宮位與四化資料為主，不再使用隨機分數模擬。</p></div></div>
<div className="forecast-card pro"><div><span className="eyebrow">ZI WEI YEARLY HOROSCOPE</span><h2>{forecast.theme}</h2><p>{forecast.summary}</p><div className="natal-badges"><span>流年 {forecast.yearly.heavenlyStem||'—'}{forecast.yearly.earthlyBranch||''}</span><span>大限 {forecast.decadal.heavenlyStem||'—'}{forecast.decadal.earthlyBranch||''}</span><span>{forecast.source}</span></div><select className="year-select" value={year} onChange={e=>setYear(Number(e.target.value))}>{Array.from({length:7},(_,i)=>new Date().getFullYear()-2+i).map(y=><option key={y}>{y}</option>)}</select></div>
<div className="mutagen-mini">{forecast.mutagens.map(x=><div key={x.type}><span>化{x.type}</span><b>{x.star}</b><small>{x.palace}</small></div>)}</div></div>
<div className="year-focus-grid">{forecast.focus.map(x=><article key={x.palace}><small>{x.label}</small><h3>{x.palace} → {x.host}</h3><b>{x.stars}</b><p>{x.text}</p></article>)}</div>
{decadalPro&&<><div className="section-subhead"><div><span className="eyebrow">10-YEAR DECADAL</span><h2>目前大限｜十年主題</h2><p>{decadalPro.summary}</p></div></div><div className="decadal-card"><div><span className="eyebrow">{decadalPro.label||'大限'}</span><h3>長期舞台 × 流年觸發</h3><p>先看大限決定十年背景，再看流年四化與流年宮位判斷當年哪些主題被放大。</p></div><div className="decadal-focus">{decadalPro.focus.map(x=><article key={x.name}><small>{x.name}</small><b>→ {x.host}</b><span>{x.stars}</span><p>{x.text}</p></article>)}</div>{decadalPro.mutagens.length>0&&<div className="decadal-mutagens">{decadalPro.mutagens.map(x=><span key={x.type}>{x.star}化{x.type}・{x.palace}</span>)}</div>}</div></>}
<div className="section-subhead"><div><span className="eyebrow">MONTHLY RHYTHM</span><h2>12 個月節奏提示</h2><p>每月顯示月運天干地支與前兩項月四化，適合作為觀察主題，不代表吉凶分數。</p></div></div>
<div className="months-pro">{forecast.months.map(x=><article key={x.m}><b>{x.m}月</b><span>{x.stem||'—'}</span><small>{x.mutagen}</small></article>)}</div></section>
<section id="match" className="section"><div className="section-head"><span>07</span><div><h2>愛情合盤</h2><p>輸入第二個人的出生資料，比較太陽、月亮與上升的元素互動；這是簡化版默契參考，不等同完整比較盤。</p></div></div>
<form className="form-card compact" onSubmit={generatePartner}><label>對方姓名<input value={partner.name} onChange={e=>setPartner({...partner,name:e.target.value})}/></label><label>性別<select required value={partner.gender} onChange={e=>setPartner({...partner,gender:e.target.value})}><option value="" disabled>請選擇</option><option value="女">女</option><option value="男">男</option></select></label><label>出生日期<input required type="date" value={partner.date} onChange={e=>setPartner({...partner,date:e.target.value})}/></label><label>出生時間<input required type="time" value={partner.time} onChange={e=>setPartner({...partner,time:e.target.value})}/></label><label>出生地<input required list="places" value={partner.city} onChange={e=>applyPlace(e.target.value,setPartner)} placeholder="請選擇出生地"/></label><label>UTC 時區<select value={partner.tz} onChange={e=>setPartner({...partner,tz:e.target.value})}><option value="8">+8 台灣</option><option value="9">+9</option><option value="0">+0</option><option value="-5">-5</option></select></label><input type="hidden" value={partner.latitude}/><input type="hidden" value={partner.longitude}/><button className="primary wide">計算愛情合盤</button></form>
{compat&&<div className="match-result">{compat.error?<p>{compat.error}</p>:<><div className="compat-score"><b>{compat.score}</b><span>默契指數</span></div><div><h3>{form.name||'你'} × {partner.name||'對方'}</h3><p>{compat.summary}</p><div className="chips"><span>太陽 {compat.sun*10}%</span><span>月亮 {compat.moon*10}%</span><span>上升 {compat.asc*10}%</span></div></div></>}</div>}</section>

<section id="ask" className="section"><div className="section-head"><span>08</span><div><h2>智慧問命</h2><p>以你的本命宮位、流年宮位、四化與三大星座進行規則式交叉解讀；出生資料不會傳到外部 AI。</p></div></div><div className="ask-card"><div className="quick-asks">{['今年工作運如何？','我的感情模式？','財運要注意什麼？','今年整體運勢？'].map(q=><button key={q} onClick={()=>{setQuestion(q);setAnswer(smartAnswer(q,chart,western,forecast))}}>{q}</button>)}</div><textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="例如：我今年適合轉職嗎？"/><button className="primary" onClick={()=>setAnswer(smartAnswer(question,chart,western,forecast))}>解析我的問題</button>{answer&&<div className="answer-box"><span>ASTRO ANSWER</span><p>{answer}</p></div>}</div></section>

<section id="share" className="section"><div className="section-head"><span>09</span><div><h2>命盤分享卡</h2><p>把四重人格摘要分享給朋友或複製到社群貼文。</p></div></div><div className="share-card"><span className="share-star">✦</span><small>ASTRO DESTINY</small><h2>{form.name||'我的'}四重人格</h2><div className="share-signs"><span>太陽<b>{western.sun.name}</b></span><span>月亮<b>{western.moon.name}</b></span><span>上升<b>{western.asc.name}</b></span><span>命主<b>{chart.soul||'—'}</b></span></div><p>{shareText(form.name,chart,western)}</p><button className="primary" onClick={shareResult}>分享我的結果</button>{shareStatus&&<em>{shareStatus}</em>}</div></section>
<p className="disclaimer">紫微斗數與占星屬傳統文化、象徵詮釋與自我探索工具，沒有科學證據證明能預測個人命運。本站結果不應作為醫療、法律、財務、投資或重大人生決策的唯一依據。</p>
</>}
</main><nav className="mobile-dock" aria-label="手機快速導覽"><a href="#generate"><span>✦</span><small>命盤</small></a><a href="#professional"><span>◎</span><small>總論</small></a><a href="#year"><span>◌</span><small>流年</small></a><a href="#ask"><span>?</span><small>問命</small></a></nav></div>}
createRoot(document.getElementById('root')).render(<App/>);
