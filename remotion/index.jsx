import {registerRoot, Composition, AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';
import React from 'react';

const Title = ({text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 12}});
  const opacity = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#111', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{color: '#F5E6C8', fontSize: 120, fontFamily: 'serif', fontWeight: 700,
        transform: `scale(${s})`, opacity, textAlign: 'center', padding: 60}}>{text}</div>
    </AbsoluteFill>
  );
};

const Root = () => (
  <Composition id="TitleCard" component={Title} durationInFrames={60} fps={30}
    width={1080} height={1920} defaultProps={{text: 'Ready to edit'}} />
);
registerRoot(Root);
