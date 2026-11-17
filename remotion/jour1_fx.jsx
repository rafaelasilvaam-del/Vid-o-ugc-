import React from 'react';
import {
  registerRoot, Composition, AbsoluteFill, OffthreadVideo, Sequence, staticFile,
  useCurrentFrame, interpolate, Easing,
} from 'remotion';

// Effects layer for the edited Jour 1 reel (v8): zooms, shake, flashes, sparkles, FF badge.
const FPS = 30;
const DURATION = 51.66;
const PINK_SOFT = '#FFB8DA';
const f = (s) => Math.round(s * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

// [start, end, peakScale]
const PUNCHES = [
  [21.98, 22.9, 1.10],   // "1h plus tard…"
  [26.50, 27.10, 1.06],  // "18h58"
  [35.75, 37.55, 1.15],  // "C'est tellement long"
  [40.75, 41.62, 1.18],  // "Canva c'est le best !"
];
const SHAKES = [[35.80, 36.30]];
const FLASHES = [8.0, 17.5, 21.98, 41.68, 46.63];
const FAST = [[17.5, 21.98], [41.68, 46.63]];

const scaleAt = (t) => {
  let s = interpolate(t, [0, 0.45], [1.12, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  for (const [a, b, p] of PUNCHES) {
    if (t >= a && t <= b) {
      s *= interpolate(t, [a, a + 0.12, b - 0.12, b], [1, p, p, 1], clamp);
    }
  }
  if (t >= 46.63) s *= interpolate(t, [46.63, DURATION], [1, 1.05], clamp);
  return s;
};

const shakeAt = (t) => {
  for (const [a, b] of SHAKES) {
    if (t >= a && t <= b) {
      const k = interpolate(t, [a, b], [1, 0], clamp) * 14;
      return [Math.sin(t * 90) * k, Math.cos(t * 77) * k];
    }
  }
  return [0, 0];
};

const Flash = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 1, 5], [0, 0.75, 0], clamp);
  return <AbsoluteFill style={{background: '#fff', opacity: o}} />;
};

const Sparkles = () => {
  const frame = useCurrentFrame();
  const stars = [[-260, -120, 70], [240, -200, 56], [-180, 160, 44], [280, 120, 64], [0, -300, 50], [-320, 20, 38], [330, -40, 42]];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {stars.map(([x, y, size], i) => {
        const p = interpolate(frame - i * 1.5, [0, 10, 24], [0, 1, 1.25], clamp);
        const o = interpolate(frame - i * 1.5, [0, 4, 18, 26], [0, 1, 1, 0], clamp);
        return (
          <div key={i} style={{position: 'absolute', fontSize: size, color: i % 2 ? '#fff' : PINK_SOFT, opacity: o,
            transform: `translate(${x * p}px, ${y * p - 120}px) rotate(${frame * 8}deg) scale(${0.5 + p * 0.6})`,
            textShadow: '0 0 18px rgba(255,93,168,0.9)'}}>✦</div>
        );
      })}
    </AbsoluteFill>
  );
};

const FastBadge = () => {
  const frame = useCurrentFrame();
  const blink = 0.65 + 0.35 * Math.sin(frame / 3);
  return (
    <AbsoluteFill style={{alignItems: 'flex-end', top: 120, paddingRight: 48}}>
      <div style={{fontFamily: 'sans-serif', fontWeight: 800, fontSize: 40, color: '#fff', background: 'rgba(30,26,29,0.75)',
        padding: '8px 22px', borderRadius: 30, opacity: blink, letterSpacing: 2}}>▶▶ x2</div>
    </AbsoluteFill>
  );
};

const Fx = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = scaleAt(t);
  const [dx, dy] = shakeAt(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${s})`}}>
        <OffthreadVideo src={staticFile('base.mp4')} muted />
      </AbsoluteFill>
      {FAST.map(([a, b], i) => (
        <Sequence key={'ff' + i} from={f(a)} durationInFrames={f(b) - f(a)}><FastBadge /></Sequence>
      ))}
      <Sequence from={f(40.72)} durationInFrames={30}><Sparkles /></Sequence>
      {FLASHES.map((a, i) => (
        <Sequence key={'fl' + i} from={f(a) - 1} durationInFrames={7}><Flash /></Sequence>
      ))}
      <AbsoluteFill style={{pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 62%, rgba(0,0,0,0.28) 100%)'}} />
    </AbsoluteFill>
  );
};

const Root = () => (
  <Composition id="Jour1Fx" component={Fx} durationInFrames={f(DURATION)} fps={FPS} width={1080} height={1920} />
);
registerRoot(Root);
