import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { astro } from 'iztro';
import './styles.css';

const HOURS = [
  ['早子時','00:00–00:59'],['丑時','01:00–02:59'],['寅時','03:00–04:59'],['卯時','05:00–06:59'],
  ['辰時','07:00–08:59'],['巳時','09:00–10:59'],['午時','11:00–12:59'],['未時','13:00–14:59'],
  ['申時','15:00–16:59'],['酉時','17:00–18:59'],['戌時','19:00–20:59'],['亥時','21:00–22:59'],['晚子時','23:00–23:59']
];

function timeToIndex(time){
  const hour = Number((time || '00:00').split(':')[0]);
  if (hour === 23) return 12;
  if (hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}

function palaceTitle(name){ return name.endsWith('宮') ? name : `${name}宮`; }

function App(){
  const [form,setForm] = useState({name:'',gender:'女',date:'1991-06-10',time:'01:30',city:'雲林縣'});
  const [chart,setChart] = useState(null);
  const [error,setError] = useState('');
  const [selected,setSelected] = useState(0);

  const selectedPalace = chart?.palaces?.[selected];
  const generate = (e) => {
    e?.preventDefault();
    setError('');
    try {
      const idx = timeToIndex(form.time);
      const result = astro.bySolar(form.date.replaceAll('-','-'), idx, form.gender, true, 'zh-TW');
      setChart(result);
      setSelected(Math.max(0, result.palaces.findIndex(p => p.name === '命宮' || p.name === '命宫')));
      setTimeout(()=>document.getElementById('result')?.scrollIntoView({behavior:'smooth'}),80);
    } catch (err) {
      console.error(err);
      setError('排盤失敗，請確認出生日期、時間與性別後再試一次。');
    }
  };

  const palaceRows = useMemo(()=>chart?.palaces || [],[chart]);

  return <div className="app">
    <header className="nav">
      <div className="brand"><span className="orb">✦</span><div><b>星命之境</b><small>ASTRO DESTINY</small></div></div>
      <nav><a href="#home">首頁</a><a href="#generate">命盤生成</a><a href="#result">紫微斗數</a></nav>
    </header>

    <main>
      <section id="home" className="hero">
        <div className="rings"></div>
        <div className="hero-inner">
          <span className="eyebrow">真實紫微斗數排盤 × 現代互動介面</span>
          <h1>你的出生時刻，<br/>藏著一張<span>專屬的人生地圖</span>。</h1>
          <p>輸入陽曆生日、出生時間與性別，網站會使用紫微斗數排盤引擎重新建立十二宮、主星、命主、身主與五行局。</p>
          <a className="primary" href="#generate">開始我的命盤分析</a>
        </div>
      </section>

      <section id="generate" className="section form-section">
        <div className="section-head"><span>01</span><div><h2>輸入出生資料</h2><p>此版本會真正重新計算紫微斗數資料，不使用固定示範命盤。</p></div></div>
        <form className="form-card" onSubmit={generate}>
          <label>姓名／暱稱<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="例如：芯瑜" /></label>
          <label>性別<select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option value="女">女</option><option value="男">男</option></select></label>
          <label>出生日期（陽曆）<input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label>
          <label>出生時間<input required type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></label>
          <label className="wide">出生地（備註用）<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="例如：雲林縣" /></label>
          <div className="time-hint wide">目前時辰：<b>{HOURS[timeToIndex(form.time)]?.[0]}</b>・{HOURS[timeToIndex(form.time)]?.[1]}</div>
          {error && <div className="error wide">{error}</div>}
          <button className="primary wide" type="submit">重新計算我的紫微命盤</button>
        </form>
      </section>

      {chart && <section id="result" className="section result-section">
        <div className="section-head"><span>02</span><div><h2>{form.name || '你的'}紫微斗數命盤</h2><p>{form.date}・{form.time}・{form.city || '出生地未填'}</p></div></div>
        <div className="summary-grid">
          <article><small>農曆</small><b>{chart.lunarDate}</b></article>
          <article><small>時辰</small><b>{chart.time}</b></article>
          <article><small>五行局</small><b>{chart.fiveElementsClass}</b></article>
          <article><small>命主</small><b>{chart.soul}</b></article>
          <article><small>身主</small><b>{chart.body}</b></article>
          <article><small>生肖／星座</small><b>{chart.zodiac}・{chart.sign}</b></article>
        </div>

        <div className="chart-layout">
          <div className="palace-grid">
            {palaceRows.map((p,i)=><button key={`${p.name}-${i}`} onClick={()=>setSelected(i)} className={`palace ${i===selected?'active':''}`}>
              <div className="palace-top"><span>{p.heavenlyStem}{p.earthlyBranch}</span>{p.isBodyPalace && <em>身宮</em>}</div>
              <h3>{palaceTitle(p.name)}</h3>
              <div className="stars">{p.majorStars?.length ? p.majorStars.map(s=>s.name).join('・') : '無主星'}</div>
              <small>大限 {p.decadal?.range?.join('–') || p.stage?.range?.join('–') || '—'}</small>
            </button>)}
          </div>

          {selectedPalace && <aside className="detail-card">
            <span className="eyebrow">宮位詳細資料</span>
            <h2>{palaceTitle(selectedPalace.name)}</h2>
            <p className="branch">{selectedPalace.heavenlyStem}{selectedPalace.earthlyBranch}・{selectedPalace.isBodyPalace?'身宮':'本宮'}</p>
            <div className="detail-block"><small>主星</small><p>{selectedPalace.majorStars?.length ? selectedPalace.majorStars.map(s=>`${s.name}${s.brightness?`（${s.brightness}）`:''}`).join('、') : '無主星'}</p></div>
            <div className="detail-block"><small>輔星</small><p>{selectedPalace.minorStars?.length ? selectedPalace.minorStars.map(s=>s.name).join('、') : '—'}</p></div>
            <div className="detail-block"><small>雜曜</small><p>{selectedPalace.adjectiveStars?.length ? selectedPalace.adjectiveStars.slice(0,10).map(s=>s.name).join('、') : '—'}</p></div>
            <div className="detail-block"><small>十二神</small><p>長生：{selectedPalace.changsheng12 || '—'}・博士：{selectedPalace.boshi12 || '—'}</p></div>
          </aside>}
        </div>
        <p className="disclaimer">本網站內容屬命理文化與自我探索用途，不應作為醫療、法律、財務或重大人生決策的唯一依據。</p>
      </section>}
    </main>
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
