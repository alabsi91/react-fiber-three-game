import { Debug, Physics } from '@react-three/cannon';
import { Grid, KeyboardControls, KeyboardControlsEntry, StatsGl } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo, type PointerEventHandler } from 'react';
import Ball from './Models/Ball';
import Floor from './Models/Floor';
import { PositionedGoalPost } from './Models/Goalpost';
import { RenderOnlinePlayers } from './Models/OnlinePlayer';
import Player from './Models/Player';
import Walls from './Models/Walls';
import CloudsSurrounding from './Scene/CloudsSurrounding';
import Lights from './Scene/Lights';
import { ambientSound } from './Scene/sounds';
import GuiControls from './gui/GuiControls';
import GuiCurser from './gui/GuiCurser';
import GuiLoader from './gui/GuiLoader';
import GuiScore from './gui/GuiScore';
import { settings } from './settings';
import { signals } from './state';
import { Controls } from './types';

function App() {
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
      { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
      { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
      { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
      { name: Controls.run, keys: ['ShiftLeft', 'ShiftRight'] },
      { name: Controls.jump, keys: ['Space'] },
    ],
    []
  );

  const requestPointerLock: PointerEventHandler<Element> = ({ target }) => {
    if (!ambientSound.playing()) ambientSound.play();
    if (signals.freeCamera.value) return;
    if ('requestPointerLock' in target && target instanceof HTMLElement) {
      target.requestPointerLock();
    }
  };

  return (
    <>
      <KeyboardControls map={map}>
        <Canvas camera={settings.camera} onPointerDown={requestPointerLock} shadows='variance'>
          <Suspense fallback={<GuiLoader />}>
            <Physics tolerance={0} stepSize={1 / 144}>
              <DebugWrapper>
                <Player />
                <RenderOnlinePlayers />
                <Ball />
                <Floor />
                <Walls />
                <Lights />
                <CloudsSurrounding />
                <PositionedGoalPost />
              </DebugWrapper>
            </Physics>
            {/* <PostProcessing /> */}
          </Suspense>
        </Canvas>
      </KeyboardControls>
      <GuiControls />
      <GuiScore />
      <GuiCurser />
    </>
  );
}

function DebugWrapper({ children }: { children: React.ReactNode }) {
  if (signals.isDebug.value) {
    return (
      <Debug color='red'>
        {children}
        <StatsGl />
        <Grid />
      </Debug>
    );
  }

  return <>{children}</>;
}

export default App;
