import React from 'react';
import {
  registerRoot, Composition, AbsoluteFill, OffthreadVideo, Sequence, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring,
} from 'remotion';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/700.css';

// ---- Brand sheet (from the v5 reel) ----
const PINK = '#FF5DA8';
const PINK_SOFT = '#FFB8DA';
const INK = '#1E1A1D';
const FONT = 'Fredoka, sans-serif';
const FPS = 30;

// Segment start times in the base cut (seconds) and their source in-points.
const SEG = {
  A: {at: 0.0, src: 0.0}, B: {at: 2.2, src: 0.25}, C: {at: 7.567, src: 6.3},
  D: {at: 11.033, src: 10.3}, E: {at: 16.333, src: 5.9}, F: {at: 21.233},
  G: {at: 27.31}, H: {at: 29.81, src: 0.0}, I: {at: 34.81}, J: {at: 39.777},
  K: {at: 43.143}, END: {at: 48.143},
};
const src = (seg, t) => SEG[seg].at + (t - SEG[seg].src);
const f = (s) => Math.round(s * FPS);

// Caption chunks: [start, end, text] ; *WORD* = highlighted keyword.
const CAPTIONS = [
  [src('B', 0.30), src('B', 1.06), 'Vous avez besoin'],
  [src('B', 1.06), src('B', 1.95), 'de *DEUX* choses'],
  [src('B', 2.00), src('B', 3.44), 'un *ORDINATEUR*'],
  [src('B', 3.44), src('B', 5.56), 'où vous allez sur *YOUTUBE*'],
  [src('C', 6.35), src('C', 7.00), 'écran *BLANC*,'],
  [src('C', 7.00), src('C', 7.70), 'comme ça, quand vous allez'],
  [src('C', 7.70), src('C', 8.15), 'faire vos vidéos'],
  [src('C', 8.15), src('C', 9.70), 'il y aura de la *LUMIÈRE*'],
  [src('D', 10.35), src('D', 12.35), "et d'un *TÉLÉPHONE*"],
  [src('D', 12.35), src('D', 13.97), 'qui vous permettra'],
  [src('D', 13.97), src('D', 15.56), 'de filmer vos vidéos'],
  [src('E', 5.90), src('E', 6.85), 'ma petite *LAMPE*'],
  [src('E', 6.85), src('E', 9.32), "que j'ai mis *À L'ENVERS*"],
  [src('E', 9.36), src('E', 10.78), "et c'est *PARFAIT*."],
  // Voice-over n°1 (draft text, will follow the recorded VO)
  [SEG.F.at + 0.2, SEG.F.at + 1.7, 'Inscription sur *INFLUEE*.'],
  [SEG.F.at + 1.7, SEG.F.at + 3.8, 'Je me dis : 10 minutes, *MAX*…'],
  [SEG.F.at + 4.0, SEG.F.at + 6.0, 'Spoiler : *PAS DU TOUT*.'],
  [src('H', 0.06), src('H', 0.90), 'Pour mon *PORTFOLIO*'],
  [src('H', 0.90), src('H', 2.94), 'je vais aller sur *CANVA*'],
  [src('H', 3.08), src('H', 4.03), '*CANVA*'],
  [src('H', 4.12), SEG.I.at, "c'est le *BEST* !"],
  // Voice-over n°2
  [SEG.I.at + 0.2, SEG.I.at + 1.8, 'Comment faire un *PORTFOLIO*'],
  [SEG.I.at + 1.8, SEG.I.at + 3.4, "quand t'as *ZÉRO* client ?"],
  [SEG.I.at + 3.4, SEG.J.at + 1.2, 'Je vous montre *DEMAIN*.'],
  // Voice-over n°3 (on the recap)
  [SEG.K.at + 0.3, SEG.K.at + 2.0, 'Jour 1 : *ZÉRO* euro.'],
  [SEG.K.at + 2.0, SEG.END.at, 'Abonne-toi, on verra combien au *JOUR 30*.'],
];

const VO_RANGES = [[SEG.F.at, SEG.G.at], [SEG.I.at, SEG.J.at + 1.2], [SEG.K.at, SEG.END.at]];

const outline = (color, w) => ({
  WebkitTextStroke: `${w}px ${color}`, paintOrder: 'stroke fill',
});

const Rich = ({text, size}) => {
  const parts = text.split('*');
  return (
    <span>
      {parts.map((p, i) => i % 2 === 1 ? (
        <span key={i} style={{color: PINK, ...outline('#fff', size * 0.16), fontSize: size * 1.12}}>{p}</span>
      ) : (
        <span key={i} style={{color: '#fff', ...outline(PINK, size * 0.16)}}>{p}</span>
      ))}
    </span>
  );
};

const Caption = ({text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 11, stiffness: 220}});
  const scale = interpolate(pop, [0, 1], [0.6, 1]);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 430}}>
      <div style={{
        fontFamily: FONT, fontWeight: 700, fontSize: 74, textAlign: 'center', lineHeight: 1.1,
        maxWidth: 900, transform: `scale(${scale})`, opacity: pop,
        filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.35))',
      }}><Rich text={text} size={74} /></div>
    </AbsoluteFill>
  );
};

const Pill = ({num, label, top = 250}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{alignItems: 'center', top}}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(30,26,29,0.82)',
        borderRadius: 40, padding: '12px 30px 12px 14px', fontFamily: FONT, fontWeight: 500,
        fontSize: 40, color: '#fff', transform: `translateY(${(1 - s) * -40}px)`, opacity: s,
      }}>
        {num ? <span style={{background: '#FFD23F', color: INK, borderRadius: 30, width: 50, height: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700}}>{num}</span> : null}
        {label}
      </div>
    </AbsoluteFill>
  );
};

const Star = ({x, y, size = 40, delay = 0}) => {
  const frame = useCurrentFrame();
  const tw = 0.75 + 0.25 * Math.sin((frame + delay) / 6);
  return <div style={{position: 'absolute', left: x, top: y, fontSize: size, color: PINK_SOFT,
    transform: `scale(${tw}) rotate(${frame * 2}deg)`, textShadow: '0 0 12px rgba(255,93,168,0.8)'}}>✦</div>;
};

const Hook = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 10}});
  const b = spring({frame: frame - 8, fps, config: {damping: 10}});
  const c = spring({frame: frame - 18, fps, config: {damping: 12}});
  const out = interpolate(frame, [f(2.6), f(3.1)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: out,
      background: `rgba(0,0,0,${0.25 * out})`}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 52, color: '#fff', letterSpacing: 2,
        opacity: a, transform: `translateY(${(1 - a) * 30}px)`, ...outline(INK, 3)}}>20 ANS · 0 CLIENT · 0 €</div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 210, lineHeight: 1, color: '#fff',
        ...outline(PINK, 18), transform: `scale(${b})`, filter: 'drop-shadow(0 10px 30px rgba(255,93,168,0.6))'}}>JOUR 1</div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 60, textAlign: 'center', maxWidth: 900,
        opacity: c, transform: `translateY(${(1 - c) * 30}px)`, marginTop: 10}}>
        <Rich text="je me donne *30 JOURS*" size={60} /><br /><Rich text="pour être *PAYÉE*" size={60} />
      </div>
      <Star x={120} y={700} delay={0} /><Star x={900} y={640} size={52} delay={20} /><Star x={860} y={1180} size={34} delay={40} />
    </AbsoluteFill>
  );
};

const ProgressBar = () => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [0, f(1.2)], [0, 1 / 30], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{top: 110, alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: FONT, fontWeight: 700, fontSize: 34, color: '#fff', ...outline(INK, 2)}}>
        <span>JOUR 1/30</span>
        <div style={{width: 420, height: 16, borderRadius: 10, background: 'rgba(255,255,255,0.35)', overflow: 'hidden'}}>
          <div style={{width: `${Math.max(fill * 100, 0)}%`, minWidth: 14, height: '100%', background: PINK, borderRadius: 10}} />
        </div>
        <span style={{color: PINK_SOFT}}>0 €</span>
      </div>
    </AbsoluteFill>
  );
};

const Clock = () => {
  const frame = useCurrentFrame();
  const dur = f(SEG.G.at - SEG.F.at);
  const mins = Math.floor(interpolate(frame, [0, dur], [0, 60], {extrapolateRight: 'clamp'}));
  const h = 17 + Math.floor((58 + mins) / 60);
  const m = (58 + mins) % 60;
  return (
    <AbsoluteFill style={{top: 360, alignItems: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 96, color: '#fff', ...outline(INK, 6),
        fontVariantNumeric: 'tabular-nums'}}>{h}:{String(m).padStart(2, '0')}</div>
      <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 34, color: '#fff', ...outline(INK, 2)}}>accéléré ×6</div>
    </AbsoluteFill>
  );
};

const OneHourLater = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 9}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 120, color: '#fff', ...outline(PINK, 12),
        transform: `scale(${s}) rotate(-4deg)`}}>1h plus tard…</div>
      <Star x={150} y={780} delay={5} /><Star x={880} y={1060} size={50} delay={25} />
    </AbsoluteFill>
  );
};

const Recap = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items = [['1', 'setup lumière', true], ['2', '1ère inscription', true], ['3', 'portfolio en cours…', false], ['4', '0 € gagnés… pour l\'instant', false]];
  const t = spring({frame, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 300}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 48, color: '#fff', opacity: t, ...outline(INK, 3)}}>BILAN DU</div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 150, lineHeight: 1, color: '#fff', ...outline(PINK, 14), transform: `scale(${t})`}}>JOUR 1</div>
      <div style={{marginTop: 30, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center'}}>
        {items.map(([n, label, done], i) => {
          const s = spring({frame: frame - 10 - i * 9, fps, config: {damping: 13}});
          return (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(30,26,29,0.85)',
              borderRadius: 40, padding: '10px 28px 10px 12px', fontFamily: FONT, fontWeight: 500, fontSize: 40, color: '#fff',
              opacity: s, transform: `translateX(${(1 - s) * -80}px)`}}>
              <span style={{background: done ? PINK : '#FFD23F', color: done ? '#fff' : INK, borderRadius: 30, width: 48, height: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700}}>{done ? '✓' : n}</span>
              {label}
            </div>
          );
        })}
      </div>
      <Star x={130} y={20} delay={0} /><Star x={880} y={60} size={50} delay={15} />
    </AbsoluteFill>
  );
};

const VoTag = () => (
  <AbsoluteFill style={{top: 180, alignItems: 'flex-end', paddingRight: 40}}>
    <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 26, color: INK, background: '#FFD23F',
      borderRadius: 20, padding: '6px 16px'}}>VOIX OFF · brouillon</div>
  </AbsoluteFill>
);

// Punch-in zooms on strong lines.
const ZOOMS = [[src('E', 9.36), src('E', 10.78)], [src('H', 3.08), SEG.I.at]];
const zoomAt = (t) => {
  for (const [a, b] of ZOOMS) {
    if (t >= a && t <= b) {
      return interpolate(t, [a, a + 0.15, b - 0.1, b], [1, 1.14, 1.14, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    }
  }
  return 1;
};

const Jour1 = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const z = zoomAt(t);
  const seq = (from, to, el, key) => (
    <Sequence key={key} from={f(from)} durationInFrames={Math.max(1, f(to) - f(from))}>{el}</Sequence>
  );
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${z})`}}>
        <OffthreadVideo src={staticFile('base.mp4')} />
      </AbsoluteFill>
      {seq(0, 3.1, <Hook />, 'hook')}
      {seq(2.4, SEG.END.at, <ProgressBar />, 'bar')}
      {seq(SEG.B.at + 0.2, SEG.B.at + 4.5, <Pill num="1" label="le setup" />, 'p1')}
      {seq(SEG.F.at, SEG.F.at + 3.5, <Pill num="2" label="l'inscription" />, 'p2')}
      {seq(SEG.F.at, SEG.G.at, <Clock />, 'clock')}
      {seq(SEG.G.at, SEG.H.at, <OneHourLater />, '1h')}
      {seq(SEG.H.at, SEG.H.at + 3, <Pill num="3" label="le portfolio" />, 'p3')}
      {seq(SEG.I.at, SEG.J.at, <Pill label="inspi sur Pinterest" top={360} />, 'pin')}
      {seq(SEG.J.at, SEG.K.at, <Pill label="montage sur Canva" top={360} />, 'cv')}
      {seq(SEG.K.at, SEG.END.at, <Recap />, 'recap')}
      {VO_RANGES.map(([a, b], i) => seq(a, b, <VoTag />, 'vo' + i))}
      {CAPTIONS.map(([a, b, text], i) => seq(a, b, <Caption text={text} />, 'c' + i))}
    </AbsoluteFill>
  );
};

const Root = () => (
  <Composition id="Jour1" component={Jour1} durationInFrames={f(SEG.END.at)} fps={FPS} width={1080} height={1920} />
);
registerRoot(Root);
