import { useMemo, useState } from 'react';

type Entry = { date: string; focus: string; reading: string };

const lifePath = (date: string) => {
  const digits = date.replace(/\D/g, '').split('').reduce((n, d) => n + Number(d), 0);
  let value = digits;
  while (value > 9 && value !== 11 && value !== 22) value = String(value).split('').reduce((n, d) => n + Number(d), 0);
  return value;
};
const zodiac = (date: string) => {
  const [, m, d] = date.split('-').map(Number);
  const dates = [[1,20,'Aquarius'],[2,19,'Pisces'],[3,21,'Aries'],[4,20,'Taurus'],[5,21,'Gemini'],[6,21,'Cancer'],[7,23,'Leo'],[8,23,'Virgo'],[9,23,'Libra'],[10,23,'Scorpio'],[11,22,'Sagittarius'],[12,22,'Capricorn']];
  for (let i = dates.length - 1; i >= 0; i--) if (m > dates[i][0] || (m === dates[i][0] && d >= dates[i][1])) return dates[i][2];
  return 'Capricorn';
};

export default function App() {
  const [birth, setBirth] = useState('');
  const [focus, setFocus] = useState('purpose');
  const [entries, setEntries] = useState<Entry[]>(() => JSON.parse(localStorage.getItem('olari-local-readings') || '[]'));
  const number = useMemo(() => birth ? lifePath(birth) : null, [birth]);
  const createReading = () => {
    if (!birth || !number) return;
    const sign = zodiac(birth);
    const lines: Record<string,string> = {
      purpose: 'Your next move needs to be small enough to do today and honest enough to matter tomorrow.',
      relationship: 'Name the boundary before the resentment has to name it for you.',
      craft: 'Return to the skill that makes you lose track of time. Repetition is where your signature gets sharp.',
      rest: 'Rest is not disappearance. It is maintenance for the instrument carrying your vision.'
    };
    const reading = sign + ' current: Life Path ' + number + '. ' + lines[focus];
    const next = [{date: new Date().toLocaleString(), focus, reading}, ...entries].slice(0, 24);
    setEntries(next); localStorage.setItem('olari-local-readings', JSON.stringify(next));
  };
  return <main style={styles.main}>
    <section style={styles.hero}><p style={styles.kicker}>OLARI / OFFLINE CORE</p><h1 style={styles.h1}>Read the pattern. Keep your agency.</h1><p style={styles.muted}>A local-first reflection tool. No camera upload, no API key, no face-based personality claims.</p></section>
    <section style={styles.card}><h2>Make a grounded reading</h2><label>Birth date<input type="date" value={birth} onChange={e=>setBirth(e.target.value)} style={styles.input}/></label>
      <label>What is calling you?<select value={focus} onChange={e=>setFocus(e.target.value)} style={styles.input}><option value="purpose">Purpose</option><option value="relationship">Relationship</option><option value="craft">Creative craft</option><option value="rest">Rest and recovery</option></select></label>
      {number && <div style={styles.result}><strong>{zodiac(birth)}</strong><span>Life Path {number}</span></div>}
      <button onClick={createReading} style={styles.button}>GENERATE LOCAL READING</button>
    </section>
    <section><h2 style={styles.h2}>Your reading archive</h2>{entries.length ? entries.map((e,i)=><article key={i} style={styles.entry}><small>{e.date} · {e.focus}</small><p>{e.reading}</p></article>) : <p style={styles.muted}>Your reflections stay on this device until you choose to export them.</p>}</section>
  </main>;
}
const styles: Record<string, React.CSSProperties> = {main:{maxWidth:820,margin:'0 auto',padding:'48px 20px',fontFamily:'system-ui',background:'#090b12',color:'#f6f0de',minHeight:'100vh'},hero:{marginBottom:28},kicker:{color:'#b9e681',letterSpacing:3,fontSize:12},h1:{fontFamily:'Georgia',fontSize:'clamp(2.5rem,8vw,5rem)',lineHeight:.95,margin:'8px 0'},muted:{color:'#abb2c5'},card:{background:'#151b2a',padding:24,border:'1px solid #37425c',borderRadius:16,display:'grid',gap:14},input:{display:'block',width:'100%',marginTop:6,padding:12,background:'#080b12',color:'#fff',border:'1px solid #53627e',borderRadius:8},button:{padding:'14px 18px',background:'#b9e681',border:0,borderRadius:8,fontWeight:800,cursor:'pointer'},result:{display:'flex',gap:12,color:'#f5c76e'},h2:{margin:'0 0 5px'},h2:{fontFamily:'Georgia'},entry:{borderLeft:'3px solid #b9e681',padding:'8px 14px',margin:'14px 0',background:'#111624'}};
