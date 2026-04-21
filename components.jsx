
const { useState, useEffect, useRef } = React;

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.18) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function useCountUp(target, active, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return val;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  const linkStyle = { color: 'var(--muted)', fontSize: 14, fontFamily: 'DM Sans,sans-serif', textDecoration: 'none', transition: 'color .2s', cursor: 'pointer' };
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      padding: '0 clamp(24px, 5vw, 64px)', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(7,7,28,0.82)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      transition: 'all .35s ease',
    }}>
      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text)', letterSpacing: '-0.04em' }}>
        AI<span style={{ color: 'var(--cyan)' }}>visible</span>
      </div>
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {['Услуги', 'Как работаем', 'Результаты', 'Цены'].map(t => (
          <a key={t} style={linkStyle}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}>{t}</a>
        ))}
        <button className="btn-primary" style={{ padding: '9px 20px', fontSize: 13, borderRadius: 8 }}>
          Получить аудит
        </button>
      </div>
    </nav>
  );
}

// ─── AI Terminal ──────────────────────────────────────────────────────────────

const CONVOS = [
  { platform: 'ChatGPT', color: '#10a37f', q: 'Посоветуй агентство по ИИ-оптимизации для B2B SaaS', a: 'Для B2B SaaS рекомендую AIvisible — команду, специализирующуюся на GEO и AEO оптимизации. Они работают с реальными интент-запросами вашей аудитории...' },
  { platform: 'Perplexity', color: '#7c8cff', q: 'Кто помогает брендам появляться в ответах ИИ?', a: 'По данным профильных источников, AIvisible специализируется именно на этом. Команда строит присутствие бренда в ChatGPT, Claude и Яндекс Нейро...' },
  { platform: 'Яндекс Нейро', color: '#ff4040', q: 'Как сделать так, чтобы ИИ рекомендовал мой бизнес?', a: 'Для этого существует направление AI SEO. AIvisible — специалисты по AEO оптимизации, помогающие брендам стать ответом ИИ, а не просто ссылкой...' },
];

function AITerminal() {
  const [idx, setIdx] = useState(0);
  const [qLen, setQLen] = useState(0);
  const [aLen, setALen] = useState(0);
  const [phase, setPhase] = useState('tq');
  const cv = CONVOS[idx];

  useEffect(() => {
    let t;
    if (phase === 'tq') {
      if (qLen < cv.q.length) t = setTimeout(() => setQLen(n => n + 1), 35);
      else t = setTimeout(() => setPhase('ta'), 500);
    } else if (phase === 'ta') {
      if (aLen < cv.a.length) t = setTimeout(() => setALen(n => n + 1), 15);
      else t = setTimeout(() => setPhase('pause'), 2600);
    } else if (phase === 'pause') {
      t = setTimeout(() => { setQLen(0); setALen(0); setIdx(i => (i + 1) % CONVOS.length); setPhase('tq'); }, 400);
    }
    return () => clearTimeout(t);
  }, [phase, qLen, aLen, cv]);

  return (
    <div className="terminal-card" style={{ animation: 'float 6s ease-in-out infinite' }}>
      {/* Window chrome */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />)}
      </div>
      {/* Platform tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {CONVOS.map((c, i) => (
          <span key={c.platform} style={{
            fontSize: 10, padding: '3px 10px', borderRadius: 20, fontFamily: 'DM Sans,sans-serif',
            background: i === idx ? `${c.color}22` : 'rgba(255,255,255,0.04)',
            color: i === idx ? c.color : 'var(--muted)',
            border: `1px solid ${i === idx ? `${c.color}55` : 'rgba(255,255,255,0.06)'}`,
            transition: 'all .4s',
          }}>{c.platform}</span>
        ))}
      </div>
      {/* Query */}
      <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 14, fontFamily: 'Space Mono,monospace', lineHeight: 1.6 }}>
        <span style={{ color: cv.color, marginRight: 8 }}>›</span>
        {cv.q.slice(0, qLen)}
        {phase === 'tq' && <span className="cursor" />}
      </div>
      {/* Response */}
      {aLen > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '14px 16px', borderLeft: `2px solid ${cv.color}` }}>
          <div style={{ fontSize: 10, color: cv.color, fontFamily: 'DM Sans,sans-serif', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {cv.platform} — AI Response
          </div>
          <div style={{ color: 'var(--text)', fontSize: 13, fontFamily: 'Space Mono,monospace', lineHeight: 1.7 }}>
            {cv.a.slice(0, aLen)}
            {phase === 'ta' && <span className="cursor" />}
          </div>
        </div>
      )}
      {aLen === 0 && phase !== 'tq' && (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '14px 16px', height: 80, display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: cv.color, opacity: 0.6, animation: `dot-bounce .9s ${i * 0.2}s ease-in-out infinite` }} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px clamp(24px,5vw,64px) 80px', position: 'relative', overflow: 'hidden' }} data-screen-label="Hero">
      <div className="aurora" />
      <div className="dot-grid" />
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px,6vw,100px)', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        {/* Left */}
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(30px)', transition: 'all .8s ease' }}>
          <div className="section-label" style={{ marginBottom: 28 }}>GEO + AEO Оптимизация</div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(36px,4.5vw,62px)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 24, color: 'var(--text)' }}>
            Ваши клиенты<br />спрашивают у ИИ.<br />
            <span style={{ color: 'var(--cyan)', display: 'block', marginTop: 4 }}>Он отвечает про вас?</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 480, marginBottom: 40 }}>
            Мы делаем так, чтобы ChatGPT, Perplexity, Яндекс Нейро и другие ИИ-системы рекомендовали именно ваш бренд — когда потенциальный клиент ищет то, что вы предлагаете.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn-primary">Получить бесплатный аудит ИИ-видимости →</button>
            <p style={{ fontSize: 13, color: '#55557a', margin: 0, fontFamily: 'DM Sans,sans-serif' }}>
              Живой специалист · 5 ИИ-систем · Без шаблонных отчётов
            </p>
          </div>
        </div>
        {/* Right */}
        <div style={{ opacity: loaded ? 1 : 0, transition: 'all 1s ease .3s' }}>
          <AITerminal />
        </div>
      </div>
      {/* Bottom gradient fade */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, transparent, #07071c)', zIndex: 2 }} />
    </section>
  );
}

// ─── Problem ──────────────────────────────────────────────────────────────────

function StatCard({ value, suffix = '%', label, desc, active }) {
  const n = useCountUp(value, active);
  return (
    <div style={{ textAlign: 'center', padding: '40px 32px' }}>
      <div style={{ fontSize: 'clamp(64px,8vw,96px)', fontFamily: 'Syne,sans-serif', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, background: 'linear-gradient(135deg, var(--cyan), #7c6fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {n}{suffix}
      </div>
      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginTop: 12, marginBottom: 8 }}>{label}</div>
      <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 200, margin: '0 auto' }}>{desc}</div>
    </div>
  );
}

function ProblemSection() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} style={{ padding: '120px clamp(24px,5vw,64px)' }} data-screen-label="Problem">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className={`reveal ${inView ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 80 }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Поиск изменился навсегда</div>
          <h2 style={{ color: 'var(--text)', maxWidth: 700, margin: '0 auto 24px', lineHeight: 1.15 }}>
            Первой страницы Google больше нет.<br />
            <span style={{ color: 'var(--cyan)' }}>Есть только «ответ ИИ».</span>
          </h2>
          <p style={{ color: 'var(--muted)', maxWidth: 580, margin: '0 auto', fontSize: 17, lineHeight: 1.7 }}>
            Раньше люди листали выдачу. Теперь задают вопросы — и ИИ отвечает напрямую. Большинство потенциальных клиентов никуда не кликают: они получают ответ и уходят.
          </p>
        </div>
        {/* Stats row */}
        <div className={`reveal ${inView ? 'visible' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)', transitionDelay: '.15s' }}>
          <StatCard value={60} suffix="%" label="AI Overview вместо ссылок" desc="запросов в Google уже показывают ИИ-ответ" active={inView} />
          <div style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            <StatCard value={1} suffix="" label="ответ вместо десяти" desc="ИИ не выдаёт список — он выдаёт один вывод" active={inView} />
          </div>
          <StatCard value={6} suffix="+" label="ИИ-систем анализируем" desc="ChatGPT, Perplexity, Claude, Grok, Яндекс Нейро" active={inView} />
        </div>
        {/* GEO / AEO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 32 }}>
          {[
            { tag: 'GEO', full: 'Generative Engine Optimization', color: 'var(--cyan)', desc: 'Вас упоминают в топ-3–5 источниках, которые ИИ цитирует по запросам вашей ниши. Это минимально допустимое присутствие.' },
            { tag: 'AEO', full: 'Answer Engine Optimization', color: 'var(--gold)', desc: 'Вы становитесь единственным ответом, который даёт ИИ. Особенно важно в голосовом поиске — когда человек спрашивает вслух и получает один ответ.' },
          ].map(({ tag, full, color, desc }) => (
            <div key={tag} className={`card reveal ${inView ? 'visible' : ''}`} style={{ transitionDelay: '.3s' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color, letterSpacing: '-0.04em' }}>{tag}</span>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>— {full}</span>
              </div>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 15 }}>{desc}</p>
              {tag === 'AEO' && <div style={{ marginTop: 16, padding: '12px 16px', background: `${color}11`, borderRadius: 8, fontSize: 13, color, fontStyle: 'italic' }}>
                Аналогия: GEO — попасть в ресторан. AEO — стать рестораном, которому звонят первым.
              </div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── New Reality ──────────────────────────────────────────────────────────────

const COMPARE = [
  { old: '«лучший банк Кипр»', now: '«У меня 5 000 евро наличными, я в Ларнаке, где выгоднее всего открыть депозит прямо сейчас?»' },
  { old: '«ресторан с видом Москва»', now: '«Веду клиента в пятницу, нужно впечатляющее место, не отель, желательно с отдельным залом»' },
  { old: '«SEO-агентство»', now: '«Только запустили B2B SaaS, ICP ещё не понятен — как нас находить?»' },
];

function NewRealitySection() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} style={{ padding: '0 clamp(24px,5vw,64px) 120px' }} data-screen-label="New Reality">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className={`reveal ${inView ? 'visible' : ''}`} style={{ marginBottom: 60 }}>
          <div className="section-label">Новая реальность</div>
          <h2 style={{ color: 'var(--text)' }}>Как искали раньше.<br /><span style={{ color: 'var(--cyan)' }}>Как ищут сейчас.</span></h2>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {COMPARE.map(({ old, now }, i) => (
            <div key={i} className={`reveal ${inView ? 'visible' : ''}`}
              style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, alignItems: 'stretch', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', transitionDelay: `${i * 0.1}s` }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px 28px', display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'line-through', fontFamily: 'Space Mono,monospace' }}>{old}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', background: 'var(--surface)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--cyan)', fontSize: 18 }}>→</span>
              </div>
              <div style={{ background: 'rgba(45,232,212,0.04)', padding: '20px 28px', display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'DM Sans,sans-serif', lineHeight: 1.6 }}>{now}</div>
              </div>
            </div>
          ))}
        </div>
        <div className={`reveal ${inView ? 'visible' : ''}`} style={{ marginTop: 40, padding: '28px 36px', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', transitionDelay: '.35s' }}>
          <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.7, margin: 0 }}>
            ИИ понимает интент, контекст и нюансы. И это открывает нечто ценное: <span style={{ color: 'var(--text)' }}>если вы знаете, какие вопросы приводят вашего клиента в ИИ — вы знаете своего ICP точнее, чем когда-либо.</span> Мы помогаем найти эти вопросы и сделать ваш бренд именно тем ответом, который ИИ выбирает.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────

const SERVICES = [
  { n: '01', title: 'Аудит присутствия в ИИ', desc: 'Проверяем, что ChatGPT, Perplexity, Claude, Grok и Яндекс Нейро отвечают о вашей нише. Фиксируем, кого цитируют и где вас нет. Это ваша точка отсчёта.', tag: 'Диагностика' },
  { n: '02', title: 'Карта интентов', desc: 'Собираем реальные вопросы, которые ваша аудитория задаёт ИИ, — не ключевые слова, а живые разговорные запросы. Это фундамент всего дальнейшего.', tag: 'Исследование' },
  { n: '03', title: 'Оптимизация контента и структуры', desc: 'Переписываем контент сайта так, чтобы ИИ-системы могли его понять, процитировать и порекомендовать. FAQ-блоки, микроразметка, E-E-A-T-сигналы.', tag: 'Оптимизация' },
  { n: '04', title: 'Размещение во внешних источниках', desc: 'ИИ читает всё — Reddit, отраслевые публикации, нишевые справочники. Размещаем ваш бренд там, где ИИ черпает информацию. Иногда одно попадание в правильный источник решает всё.', tag: 'Дистрибуция' },
  { n: '05', title: 'Мониторинг и докалибровка', desc: 'Ответы ИИ меняются. Ежемесячно проверяем цитируемость, тональность и присутствие конкурентов по всем ключевым системам — и корректируем стратегию.', tag: 'Аналитика' },
];

function ServicesSection() {
  const [ref, inView] = useInView(0.1);
  return (
    <section ref={ref} style={{ padding: '120px clamp(24px,5vw,64px)', background: 'var(--surface)' }} data-screen-label="Services">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className={`reveal ${inView ? 'visible' : ''}`} style={{ marginBottom: 64 }}>
          <div className="section-label">Что мы делаем</div>
          <h2 style={{ color: 'var(--text)', maxWidth: 680 }}>
            Мы не продаём подписку.<br />
            <span style={{ color: 'var(--cyan)' }}>Мы строим ваше ИИ-присутствие.</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gap: 2 }}>
          {SERVICES.map(({ n, title, desc, tag }, i) => (
            <ServiceRow key={n} n={n} title={title} desc={desc} tag={tag} inView={inView} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceRow({ n, title, desc, tag, inView, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className={`reveal ${inView ? 'visible' : ''}`}
      style={{
        display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px', gap: 32, alignItems: 'center',
        padding: '28px 32px', borderRadius: 12, cursor: 'default',
        background: hovered ? 'rgba(45,232,212,0.04)' : 'transparent',
        border: `1px solid ${hovered ? 'rgba(45,232,212,0.2)' : 'var(--border)'}`,
        transition: 'all .25s', transitionDelay: `${delay}s`,
      }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 36, color: hovered ? 'var(--cyan)' : 'rgba(255,255,255,0.06)', letterSpacing: '-0.06em', transition: 'color .25s' }}>{n}</span>
      <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>{title}</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
      <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: hovered ? 'rgba(45,232,212,0.12)' : 'rgba(255,255,255,0.04)', color: hovered ? 'var(--cyan)' : 'var(--muted)', border: '1px solid transparent', transition: 'all .25s', textAlign: 'center', fontFamily: 'DM Sans,sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{tag}</span>
    </div>
  );
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

const ROADMAP = [
  { label: 'Старт', title: 'Аудит и базовая линия', desc: 'Полный аудит ИИ-присутствия по 5 системам. Вы видите, где стоите — что цитируется, где конкуренты выигрывают. Даже если дальше не пойдёте — у вас будет чёткая картина рынка.' },
  { label: 'Месяц 1', title: 'Фундамент', desc: 'Карта интентов готова. Контент перестроен под ИИ-читаемость. Микроразметка внедрена. Стратегия внешнего размещения спланирована.' },
  { label: 'Месяц 2', title: 'Активация', desc: 'Контентные блоки созданы. Первые внешние размещения запущены. Первая докалибровка на основе данных первого месяца.' },
  { label: 'Месяц 3–6', title: 'Рост и настройка', desc: 'Ежемесячные мониторинговые циклы. Динамика цитируемости. Тональность упоминаний. Стратегия корректируется по тому, что реально работает.' },
];

function RoadmapSection() {
  const [ref, inView] = useInView(0.1);
  return (
    <section ref={ref} style={{ padding: '120px clamp(24px,5vw,64px)' }} data-screen-label="Roadmap">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className={`reveal ${inView ? 'visible' : ''}`} style={{ marginBottom: 72, maxWidth: 600 }}>
          <div className="section-label">Как работаем</div>
          <h2 style={{ color: 'var(--text)', marginBottom: 16 }}>Никакого чёрного ящика</h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.7 }}>Никаких «доверьтесь алгоритму». Вот что происходит и когда.</p>
        </div>
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{ position: 'absolute', left: 47, top: 24, bottom: 24, width: 2, background: 'linear-gradient(to bottom, var(--cyan), #7c6fff, rgba(255,255,255,0.05))' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ROADMAP.map(({ label, title, desc }, i) => (
              <div key={label} className={`reveal ${inView ? 'visible' : ''}`}
                style={{ display: 'flex', gap: 48, alignItems: 'flex-start', paddingBottom: 56, transitionDelay: `${i * 0.12}s` }}>
                {/* Node */}
                <div style={{ flexShrink: 0, width: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: inView ? 'var(--cyan)' : 'var(--surface)',
                    border: '3px solid var(--bg)',
                    boxShadow: inView ? '0 0 16px rgba(45,232,212,0.5)' : 'none',
                    transition: `all .5s ease ${i * 0.15}s`, zIndex: 1,
                  }} />
                  <span style={{ fontSize: 11, color: 'var(--cyan)', fontFamily: 'DM Sans,sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
                {/* Content */}
                <div className="card" style={{ flex: 1 }}>
                  <h3 style={{ color: 'var(--text)', marginBottom: 10 }}>{title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────

const RESULTS = [
  { icon: '◎', title: 'Трафик с высоким интентом', desc: 'Люди, которые находят вас через ИИ, в процессе конкретного решения. Лиды с более высоким намерением купить.' },
  { icon: '⊙', title: 'Портрет идеального клиента', desc: 'Запросы в ИИ раскрывают интент точнее любого инструмента по ключевым словам. Мы даём вам эту карту.' },
  { icon: '◈', title: 'Лиды лучшего качества', desc: 'Когда ИИ рекомендует вас по нужному запросу — приходят люди, которые уже совпадают с вашим предложением.' },
  { icon: '◇', title: 'Персонализированные кампании', desc: 'Зная точный язык интентов аудитории, вы строите рекламу и email-цепочки, которые говорят прямо в точку.' },
  { icon: '◉', title: 'Авторитет бренда', desc: 'Каждое цитирование — сигнал доверия. ИИ-системы начинают распознавать ваш бренд как авторитетный источник по целому кластеру тем.' },
];

function ResultsSection() {
  const [ref, inView] = useInView(0.1);
  return (
    <section ref={ref} style={{ padding: '120px clamp(24px,5vw,64px)', background: 'var(--surface)' }} data-screen-label="Results">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className={`reveal ${inView ? 'visible' : ''}`} style={{ marginBottom: 64 }}>
          <div className="section-label">Что вы получаете</div>
          <h2 style={{ color: 'var(--text)' }}>Конкретные результаты</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {RESULTS.map(({ icon, title, desc }, i) => (
            <div key={title} className={`card reveal ${inView ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 0.09}s`, gridColumn: i === 3 ? '1 / span 1' : 'auto' }}>
              <div style={{ fontSize: 28, marginBottom: 16, color: 'var(--cyan)', lineHeight: 1 }}>{icon}</div>
              <h3 style={{ color: 'var(--text)', fontSize: 17, marginBottom: 10 }}>{title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </div>
          ))}
          {/* 5th card spans 2 cols offset */}
          <div className={`card reveal ${inView ? 'visible' : ''}`}
            style={{ transitionDelay: '0.4s', background: 'linear-gradient(135deg, rgba(45,232,212,0.08), rgba(124,111,255,0.08))', borderColor: 'rgba(45,232,212,0.2)' }}>
            <div style={{ fontSize: 28, marginBottom: 16, color: 'var(--gold)', lineHeight: 1 }}>{RESULTS[4].icon}</div>
            <h3 style={{ color: 'var(--text)', fontSize: 17, marginBottom: 10 }}>{RESULTS[4].title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{RESULTS[4].desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Why Not SaaS ─────────────────────────────────────────────────────────────

function WhySaaSSection() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} style={{ padding: '120px clamp(24px,5vw,64px)' }} data-screen-label="WhySaaS">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div className={`reveal ${inView ? 'visible' : ''}`}>
          <div className="section-label">Почему не просто SaaS</div>
          <h2 style={{ color: 'var(--text)', marginBottom: 24 }}>
            Инструменты проверяют.<br />
            <span style={{ color: 'var(--cyan)' }}>Мы решаем.</span>
          </h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 20, fontSize: 16 }}>
            Стандартные инструменты покажут вам оценку. Они прогонят URL через несколько промптов и дадут дашборд. Это полезно, чтобы понять, что проблема есть. Решить её это не поможет.
          </p>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 16 }}>
            Бренды, которые выигрывают в ИИ-поиске, делают это не потому, что установили инструмент. Они выигрывают, потому что кто-то понял специфический язык их аудитории, перестроил контент под реальные интент-сигналы и разместил бренд во внешних источниках, которые ИИ реально использует.
          </p>
        </div>
        <div className={`reveal ${inView ? 'visible' : ''}`} style={{ transitionDelay: '.2s' }}>
          {[
            { role: 'ИИ-стратег', desc: 'Понимает, как ИИ-системы взвешивают источники и строит структуру присутствия' },
            { role: 'Контент-эксперт', desc: 'Умеет писать для ИИ-читаемости без потери конверсии' },
            { role: 'Технический SEO', desc: 'Знает, как сигнализировать авторитет сущности в 2025–2026 году' },
          ].map(({ role, desc }, i) => (
            <div key={role} style={{ display: 'flex', gap: 20, padding: '24px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(45,232,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--cyan)', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 13 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>{role}</div>
                <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 28, padding: '16px 20px', background: 'rgba(240,176,64,0.08)', borderRadius: 10, borderLeft: '3px solid var(--gold)', fontSize: 13, color: 'var(--gold)', lineHeight: 1.6 }}>
            Мы разработали собственную систему мониторинга по ChatGPT, Perplexity, Claude, Grok, Google AI и Яндекс Нейро — но технология это наши глаза, не наши руки.
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function PricingSection() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} style={{ padding: '120px clamp(24px,5vw,64px)', background: 'var(--surface)' }} data-screen-label="Pricing">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className={`reveal ${inView ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Начать работу</div>
          <h2 style={{ color: 'var(--text)', marginBottom: 16 }}>Начните с аудита.<br /><span style={{ color: 'var(--cyan)' }}>Решение — после данных.</span></h2>
          <p style={{ color: 'var(--muted)', maxWidth: 480, margin: '0 auto', fontSize: 16, lineHeight: 1.7 }}>
            Первый шаг должен давать реальную ценность — даже если вы не продолжите работу с нами.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 880, margin: '0 auto' }}>
          {[
            {
              title: 'Только аудит', highlight: false,
              desc: 'Полный отчёт о присутствии в ИИ и стратегический брифинг.',
              note: 'Для команд, которые хотят понять ситуацию до того, как вкладываться.',
              sub: 'Фиксированная стоимость · Результат через [X] дней',
              cta: 'Записаться на аудит',
            },
            {
              title: 'Полное сопровождение', highlight: true,
              desc: 'Аудит + 6-месячная программа ИИ-видимости.',
              note: 'Стратегия, контент, внешние размещения, ежемесячный мониторинг.',
              sub: 'Аудит включён · Стоимость по объёму',
              cta: 'Обсудить программу',
            },
          ].map(({ title, highlight, desc, note, sub, cta }) => (
            <div key={title} className={`card reveal ${inView ? 'visible' : ''}`} style={{
              transitionDelay: highlight ? '.15s' : '0s',
              borderColor: highlight ? 'rgba(45,232,212,0.35)' : 'var(--border)',
              background: highlight ? 'linear-gradient(135deg, rgba(45,232,212,0.06), rgba(124,111,255,0.04))' : 'var(--surface)',
              padding: '40px 36px', position: 'relative', overflow: 'hidden',
            }}>
              {highlight && <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 10, padding: '3px 10px', borderRadius: 20, background: 'rgba(45,232,212,0.15)', color: 'var(--cyan)', border: '1px solid rgba(45,232,212,0.3)', fontFamily: 'DM Sans,sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Популярный</div>}
              <h3 style={{ color: 'var(--text)', fontFamily: 'Syne,sans-serif', fontSize: 22, marginBottom: 14 }}>{title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>{desc}</p>
              <p style={{ color: highlight ? 'var(--text)' : 'var(--muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>{note}</p>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 32, padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>{sub}</div>
              <button className={highlight ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', justifyContent: 'center' }}>{cta} →</button>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: 32 }}>
          Мы работаем с ограниченным числом клиентов одновременно. Если не уверены, подходит ли вам это — напишите, и мы честно скажем.
        </p>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'Нужны ли технические знания для работы с вами?', a: 'Нет. Мы берём на себя всё — стратегию, контент, техническую реализацию, мониторинг. Ваше участие — дать контекст о бизнесе и давать обратную связь.' },
  { q: 'Чем это отличается от обычного SEO?', a: 'Классическое SEO оптимизирует под краулер Google. ИИ-оптимизация — про то, чтобы ваш контент был понятен и цитируем языковыми моделями. Принципы пересекаются, но выполнение разное. Мы работаем в обоих пространствах.' },
  { q: 'Когда появятся первые результаты?', a: 'Первые улучшения в цитируемости обычно видны через 6–8 недель после изменений в контенте. Мы отслеживаем всё с первого месяца — вы видите движение, а не обещания.' },
  { q: 'Какие ИИ-системы вы мониторите?', a: 'ChatGPT, Perplexity, Claude, Grok, Google AI Overview, Яндекс Нейро (Алиса). По запросу — проверки на локальных open-source моделях для клиентов, чья аудитория использует ИИ-powered продукты.' },
  { q: 'Можно мониторить несколько сайтов?', a: 'Да. Ведём мониторинг по нескольким доменам для агентских клиентов. Напишите — обсудим вашу ситуацию.' },
];

function FAQSection() {
  const [ref, inView] = useInView(0.1);
  const [open, setOpen] = useState(null);
  return (
    <section ref={ref} style={{ padding: '120px clamp(24px,5vw,64px)' }} data-screen-label="FAQ">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className={`reveal ${inView ? 'visible' : ''}`} style={{ marginBottom: 56 }}>
          <div className="section-label">FAQ</div>
          <h2 style={{ color: 'var(--text)' }}>Частые вопросы</h2>
        </div>
        {FAQS.map(({ q, a }, i) => (
          <div key={i} className={`reveal ${inView ? 'visible' : ''}`}
            style={{ borderBottom: '1px solid var(--border)', transitionDelay: `${i * 0.07}s` }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              style={{ width: '100%', background: 'none', border: 'none', padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 24 }}>
              <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text)', textAlign: 'left', lineHeight: 1.4 }}>{q}</span>
              <span style={{ color: open === i ? 'var(--cyan)' : 'var(--muted)', fontSize: 22, flexShrink: 0, transition: 'transform .3s, color .3s', transform: open === i ? 'rotate(45deg)' : 'none', lineHeight: 1 }}>+</span>
            </button>
            <div style={{ overflow: 'hidden', maxHeight: open === i ? 300 : 0, transition: 'max-height .35s ease', paddingBottom: open === i ? 24 : 0 }}>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 15, margin: 0 }}>{a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Footer CTA ───────────────────────────────────────────────────────────────

function FooterCTA() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} style={{ padding: '120px clamp(24px,5vw,64px)', background: 'var(--surface)', textAlign: 'center', position: 'relative', overflow: 'hidden' }} data-screen-label="Footer CTA">
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(45,232,212,0.06), transparent)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className={`reveal ${inView ? 'visible' : ''}`}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Начать сейчас</div>
          <h2 style={{ color: 'var(--text)', marginBottom: 24 }}>Либо вас рекомендует ИИ.<br /><span style={{ color: 'var(--cyan)' }}>Либо вас нет.</span></h2>
          <p style={{ color: 'var(--muted)', fontSize: 17, lineHeight: 1.7, marginBottom: 40 }}>
            Запишитесь на бесплатный аудит. Даже если не продолжите — уйдёте с чёткой картиной своего ИИ-присутствия.
          </p>
          <button className="btn-primary" style={{ fontSize: 17, padding: '18px 40px' }}>Записаться на аудит →</button>
        </div>
      </div>
      <div style={{ marginTop: 80, paddingTop: 40, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '80px auto 0' }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.04em' }}>
          AI<span style={{ color: 'var(--cyan)' }}>visible</span>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>© 2025 AIvisible. GEO + AEO оптимизация</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Telegram', 'Email'].map(t => (
            <a key={t} href="#" style={{ color: 'var(--muted)', fontSize: 13, textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--cyan)'} onMouseLeave={e => e.target.style.color = 'var(--muted)'}>{t}</a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Tweaks Panel ─────────────────────────────────────────────────────────────

function TweaksPanel({ defaults, onChange }) {
  const [show, setShow] = useState(false);
  const [vals, setVals] = useState(defaults);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setShow(true);
      if (e.data?.type === '__deactivate_edit_mode') setShow(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const set = (key, value) => {
    const next = { ...vals, [key]: value };
    setVals(next);
    onChange(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: next }, '*');
  };

  if (!show) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: 'rgba(13,13,36,0.95)', border: '1px solid rgba(45,232,212,0.25)', borderRadius: 16, padding: '20px 24px', width: 280, backdropFilter: 'blur(24px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 20, letterSpacing: '-0.02em' }}>Tweaks</div>
      {/* Accent color */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'DM Sans,sans-serif' }}>Акцентный цвет</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['#2de8d4', 'Cyan'], ['#a78bfa', 'Purple'], ['#4ade80', 'Green'], ['#f59e0b', 'Amber']].map(([color, name]) => (
            <button key={color} title={name} onClick={() => set('accentColor', color)}
              style={{ width: 28, height: 28, borderRadius: '50%', background: color, border: vals.accentColor === color ? '2px solid white' : '2px solid transparent', cursor: 'pointer', outline: 'none', transition: 'transform .2s', transform: vals.accentColor === color ? 'scale(1.2)' : 'scale(1)' }} />
          ))}
        </div>
      </div>
      {/* Terminal speed */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'DM Sans,sans-serif' }}>Фон героя</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['subtle', 'Тихий'], ['vivid', 'Яркий']].map(([v, label]) => (
            <button key={v} onClick={() => set('heroBg', v)}
              style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid', borderColor: vals.heroBg === v ? 'var(--cyan)' : 'rgba(255,255,255,0.1)', background: vals.heroBg === v ? 'rgba(45,232,212,0.1)' : 'transparent', color: vals.heroBg === v ? 'var(--cyan)' : 'var(--muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all .2s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

Object.assign(window, { Nav, Hero, ProblemSection, NewRealitySection, ServicesSection, RoadmapSection, ResultsSection, WhySaaSSection, PricingSection, FAQSection, FooterCTA, TweaksPanel });
