import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { astro } from 'iztro';
import './styles.css';

const HOURS = [
  ['早子時','00:00–00:59'],['丑時','01:00–02:59'],['寅時','03:00–04:59'],['卯時','05:00–06:59'],
  ['辰時','07:00–08:59'],['巳時','09:00–10:59'],['午時','11:00–12:59'],['未時','13:00–14:59'],
  ['申時','15:00–16:59'],['酉時','17:00–18:59'],['戌時','19:00–20:59'],['亥時','21:00–22:59'],['晚子時','23:00–23:59']
];

const SUN_SIGNS = [
  ['摩羯座',1,20,'土','務實、耐力、責任感'],['水瓶座',2,19,'風','獨立、創新、重視理念'],['雙魚座',3,20,'水','敏感、想像力、同理心'],
  ['牡羊座',4,20,'火','直接、行動力、開創性'],['金牛座',5,21,'土','穩定、審美、重視價值'],['雙子座',6,21,'風','好奇、溝通、反應快速'],
  ['巨蟹座',7,22,'水','保護、情感、重視歸屬'],['獅子座',8,23,'火','自信、創造力、舞台感'],['處女座',9,23,'土','細節、分析、改善力'],
  ['天秤座',10,23,'風','平衡、審美、關係協調'],['天蠍座',11,22,'水','洞察、深度、轉化力'],['射手座',12,22,'火','自由、探索、遠見']
];

const STAR_RULES = {
  '紫微':'重視格局與掌控，具領導、整合與承擔責任的傾向。','天機':'思考快速、善規劃與應變，適合策略、企劃與知識型工作。',
  '太陽':'外向、重責任與影響力，適合公開表達、領導與服務角色。','武曲':'務實果斷，對資源、效率與成果敏感，財務與執行能力強。',
  '天同':'溫和、人緣佳，重視舒適與和諧，適合服務、創意與陪伴型角色。','廉貞':'有原則與企圖心，重視界線、魅力與自我要求。',
  '天府':'穩健、包容、資源整合能力佳，重視安全感與長期累積。','太陰':'細膩敏感、觀察力強，重視內在安全與生活品質。',
  '貪狼':'多才多藝、社交與審美感強，適合品牌、創意與跨域發展。','巨門':'擅長分析、辯證與表達，適合研究、顧問、溝通與專業型職務。',
  '天相':'重公平與合作，擅協調、管理流程與建立信任。','天梁':'重原則與助人，具保護、指導與危機處理傾向。',
  '七殺':'決斷力強，能承擔壓力與開創未知，但需管理衝動與風險。','破軍':'改革與突破力強，適合變動環境、創新與重整型任務。'
};

const HOUSE_MAP = {
  personality:['命宮','命宫'], love:['夫妻宮','夫妻宫'], career:['官祿宮','官禄宫','事業宮','事业宫'],
  wealth:['財帛宮','财帛宫'], social:['交友宮','交友宫','僕役宮','仆役宫'], talent:['福德宮','福德宫']
};

function timeToIndex(time){
  const hour = Number((time || '00:00').split(':')[0]);
  if (hour === 23) return 12;
  if (hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}
function palaceTitle(name){ return (name || '').endsWith('宮') || (name || '').endsWith('宫') ? name : `${name}宮`; }
function getSunSign(date){
  const d = new Date(`${date}T12:00:00`); const m=d.getMonth()+1, day=d.getDate();
  for(let i=0;i<SUN_SIGNS.length;i++){
    const [name, month, endDay, element, keywords] = SUN_SIGNS[i];
    if(m===month && day<=endDay) return {name,element,keywords};
  }
  const prev = SUN_SIGNS.findIndex(x=>x[1]===m)-1;
  const item = SUN_SIGNS[(prev+SUN_SIGNS.length)%SUN_SIGNS.length];
  return {name:item[0],element:item[3],keywords:item[4]};
}
function findPalace(chart,names){ return chart?.palaces?.find(p=>names.includes(p.name)); }
function starNames(p){ return p?.majorStars?.map(s=>s.name) || []; }
function starText(p){
  const names=starNames(p); if(!names.length) return '此宮無主星，解讀時更需要參考對宮與整體命盤結構。';
  return names.map(n=>STAR_RULES[n] || `${n}帶來鮮明的個人驅動與生命課題。`).join(' ');
}
function signAdvice(sign){
  const map={火:'你適合先行動再修正，但要避免急於求成。',土:'你擅長把想法落地，長期累積比短期爆發更有利。',風:'你的優勢來自資訊、溝通與連結，需要避免過度分散。',水:'你的直覺與情緒感受力強，建立界線能讓天賦更穩定。'};
  return map[sign.element] || '';
}
function makeAnalysis(chart, sun){
  const p={
    personality:findPalace(chart,HOUSE_MAP.personality), love:findPalace(chart,HOUSE_MAP.love), career:findPalace(chart,HOUSE_MAP.career),
    wealth:findPalace(chart,HOUSE_MAP.wealth), social:findPalace(chart,HOUSE_MAP.social), talent:findPalace(chart,HOUSE_MAP.talent)
  };
  return [
    {icon:'✦',title:'核心性格',source:`${palaceTitle(p.personality?.name||'命宮')} × 太陽${sun.name}`,summary:`你的太陽${sun.name}帶有「${sun.keywords}」的核心傾向。${starText(p.personality)}`,strength:'優勢：能把自身性格特質與命宮主星的驅動整合成鮮明的個人風格。',challenge:`課題：${signAdvice(sun)}`},
    {icon:'♡',title:'愛情與感情',source:palaceTitle(p.love?.name||'夫妻宮'),summary:`感情模式主要觀察夫妻宮。${starText(p.love)}`,strength:'優勢：理解自己的關係需求後，更能選擇適合的互動節奏與伴侶類型。',challenge:'課題：避免只用理性或既定期待判斷關係，保留坦白溝通的空間。'},
    {icon:'⌁',title:'工作與事業',source:palaceTitle(p.career?.name||'官祿宮'),summary:`事業發展可從官祿宮看你的工作驅動。${starText(p.career)}`,strength:'優勢：把主星能力轉化成專業定位，會比追逐單一職稱更有長期效果。',challenge:'課題：找到可持續的節奏，避免能力強卻因方向過多而分散。'},
    {icon:'◈',title:'財富與金錢',source:palaceTitle(p.wealth?.name||'財帛宮'),summary:`財帛宮反映你對資源與金錢的運用方式。${starText(p.wealth)}`,strength:'優勢：當你把收入模式與自身擅長的決策方式結合，累積效率通常更高。',challenge:'課題：任何投資仍應以風險承受度、現金流與實際財務資訊為準。'},
    {icon:'◎',title:'人際關係',source:palaceTitle(p.social?.name||'交友宮'),summary:`交友宮呈現你在人群、合作與圈層中的互動傾向。${starText(p.social)}`,strength:'優勢：選擇價值觀相近、能力互補的人際關係，比單純擴大社交圈更有利。',challenge:'課題：在照顧關係的同時，也要維持清楚界線。'},
    {icon:'✺',title:'人生天賦',source:palaceTitle(p.talent?.name||'福德宮'),summary:`福德宮結合太陽${sun.name}，呈現你較自然的內在天賦與恢復方式。${starText(p.talent)}`,strength:'優勢：當內在興趣、審美與長期目標一致時，你更容易進入穩定且有成就感的狀態。',challenge:'課題：天賦需要透過長期練習與現實驗證，才能真正成為能力。'}
  ];
}

function App(){
  const [form,setForm] = useState({name:'',gender:'女',date:'1991-06-10',time:'01:30',city:'雲林縣'});
  const [chart,setChart] = useState(null); const [error,setError]=useState(''); const [selected,setSelected]=useState(0);
  const sun = useMemo(()=>getSunSign(form.date),[form.date]);
  const analyses = useMemo(()=>chart ? makeAnalysis(chart,sun) : [],[chart,sun]);
  const selectedPalace = chart?.palaces?.[selected];
  const generate=(e)=>{e?.preventDefault();setError('');try{const idx=timeToIndex(form.time);const result=astro.bySolar(form.date,idx,form.gender,true,'zh-TW');setChart(result);setSelected(Math.max(0,result.palaces.findIndex(p=>p.name==='命宮'||p.name==='命宫')));setTimeout(()=>document.getElementById('result')?.scrollIntoView({behavior:'smooth'}),80);}catch(err){console.error(err);setError('排盤失敗，請確認出生日期、時間與性別後再試一次。');}};
  const palaceRows=useMemo(()=>chart?.palaces||[],[chart]);

  return <div className="app">
    <header className="nav"><div className="brand"><span className="orb">✦</span><div><b>星命之境</b><small>ASTRO DESTINY</small></div></div><nav><a href="#home">首頁</a><a href="#generate">命盤生成</a><a href="#result">紫微斗數</a><a href="#western">星座</a><a href="#analysis">綜合分析</a></nav></header>
    <main>
      <section id="home" className="hero"><div className="rings"></div><div className="hero-inner"><span className="eyebrow">紫微斗數真實排盤 × 太陽星座 × 人生分析</span><h1>你的出生時刻，<br/>藏著一張<span>專屬的人生地圖</span>。</h1><p>輸入陽曆生日、出生時間與性別，重新建立紫微十二宮，並加入太陽星座與六大人生面向的交叉解析。</p><a className="primary" href="#generate">開始我的命盤分析</a></div></section>

      <section id="generate" className="section form-section"><div className="section-head"><span>01</span><div><h2>輸入出生資料</h2><p>紫微斗數使用出生日期、時間與性別重新排盤；太陽星座依生日計算。</p></div></div><form className="form-card" onSubmit={generate}>
        <label>姓名／暱稱<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="例如：芯瑜" /></label>
        <label>性別<select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option value="女">女</option><option value="男">男</option></select></label>
        <label>出生日期（陽曆）<input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label>
        <label>出生時間<input required type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></label>
        <label className="wide">出生地<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="例如：雲林縣" /></label>
        <div className="time-hint wide">目前時辰：<b>{HOURS[timeToIndex(form.time)]?.[0]}</b>・{HOURS[timeToIndex(form.time)]?.[1]}　｜　太陽星座：<b>{sun.name}</b></div>
        {error&&<div className="error wide">{error}</div>}<button className="primary wide" type="submit">產生我的完整命盤分析</button>
      </form></section>

      {chart && <>
      <section id="result" className="section result-section"><div className="section-head"><span>02</span><div><h2>{form.name||'你的'}紫微斗數命盤</h2><p>{form.date}・{form.time}・{form.city||'出生地未填'}</p></div></div>
        <div className="summary-grid"><article><small>農曆</small><b>{chart.lunarDate}</b></article><article><small>時辰</small><b>{chart.time}</b></article><article><small>五行局</small><b>{chart.fiveElementsClass}</b></article><article><small>命主</small><b>{chart.soul}</b></article><article><small>身主</small><b>{chart.body}</b></article><article><small>生肖</small><b>{chart.zodiac}</b></article></div>
        <div className="chart-layout"><div className="palace-grid">{palaceRows.map((p,i)=><button key={`${p.name}-${i}`} onClick={()=>setSelected(i)} className={`palace ${i===selected?'active':''}`}><div className="palace-top"><span>{p.heavenlyStem}{p.earthlyBranch}</span>{p.isBodyPalace&&<em>身宮</em>}</div><h3>{palaceTitle(p.name)}</h3><div className="stars">{p.majorStars?.length?p.majorStars.map(s=>s.name).join('・'):'無主星'}</div><small>大限 {p.decadal?.range?.join('–')||p.stage?.range?.join('–')||'—'}</small></button>)}</div>
        {selectedPalace&&<aside className="detail-card"><span className="eyebrow">宮位詳細資料</span><h2>{palaceTitle(selectedPalace.name)}</h2><p className="branch">{selectedPalace.heavenlyStem}{selectedPalace.earthlyBranch}・{selectedPalace.isBodyPalace?'身宮':'本宮'}</p><div className="detail-block"><small>主星</small><p>{selectedPalace.majorStars?.length?selectedPalace.majorStars.map(s=>`${s.name}${s.brightness?`（${s.brightness}）`:''}`).join('、'):'無主星'}</p></div><div className="detail-block"><small>輔星</small><p>{selectedPalace.minorStars?.length?selectedPalace.minorStars.map(s=>s.name).join('、'):'—'}</p></div><div className="detail-block"><small>雜曜</small><p>{selectedPalace.adjectiveStars?.length?selectedPalace.adjectiveStars.slice(0,10).map(s=>s.name).join('、'):'—'}</p></div><div className="detail-block"><small>主星解讀</small><p>{starText(selectedPalace)}</p></div></aside>}</div>
      </section>

      <section id="western" className="section"><div className="section-head"><span>03</span><div><h2>西洋星座｜太陽星座</h2><p>第一階段先提供依生日可直接判定的太陽星座；月亮與上升將於下一階段接入天文計算。</p></div></div>
        <div className="zodiac-card"><div className="zodiac-symbol">☉</div><div><span className="eyebrow">SUN SIGN</span><h2>{sun.name}</h2><p>元素：{sun.element}象｜核心關鍵字：{sun.keywords}</p><p className="zodiac-copy">太陽星座代表你較核心的自我認同、意志與人生主題。{signAdvice(sun)}</p></div></div>
        <div className="pending-grid"><article><small>月亮星座</small><b>下一階段加入</b><p>需要依出生時間計算月亮實際黃經。</p></article><article><small>上升星座</small><b>下一階段加入</b><p>需要出生時間、地點經緯度與天文計算。</p></article></div>
      </section>

      <section id="analysis" className="section"><div className="section-head"><span>04</span><div><h2>六大人生分析</h2><p>以實際紫微宮位主星為基礎，再與太陽{sun.name}的核心傾向交叉閱讀。</p></div></div><div className="analysis-grid">{analyses.map((a,i)=><article className="analysis-card" key={a.title}><div className="analysis-icon">{a.icon}</div><small>{String(i+1).padStart(2,'0')}・{a.source}</small><h3>{a.title}</h3><p>{a.summary}</p><div className="analysis-note"><b>你的優勢</b><span>{a.strength.replace('優勢：','')}</span></div><div className="analysis-note"><b>需要留意</b><span>{a.challenge.replace('課題：','')}</span></div></article>)}</div>
        <div className="cross-card"><span className="eyebrow">EAST × WEST</span><h2>紫微 × 太陽{sun.name} 綜合解析</h2><p>你的東方命盤描述「人生各領域如何運作」，太陽{sun.name}則補充「你傾向如何展現自我」。兩套系統一起閱讀時，重點不是尋找完全相同的答案，而是觀察哪些特質彼此加強、哪些地方形成拉扯。當命宮主星與太陽星座的特質能被你有意識地整合，通常更容易形成穩定而有辨識度的個人風格。</p></div>
        <p className="disclaimer">本網站內容屬命理文化、娛樂與自我探索用途，不應作為醫療、法律、財務或重大人生決策的唯一依據。</p>
      </section></>}
    </main>
  </div>
}
createRoot(document.getElementById('root')).render(<App/>);
