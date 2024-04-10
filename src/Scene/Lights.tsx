import { Environment, MapControls, Stars, useHelper } from '@react-three/drei';
import { useRef } from 'react';
import { DirectionalLight, DirectionalLightHelper } from 'three';
import { signals } from '../state';
import { settings } from '../settings';

export default function Lights() {
  const lightRef = useRef<DirectionalLight>(null!);
  useHelper(signals.isDebug.value ? lightRef : null, DirectionalLightHelper, 2);

  return (
    <>
      <Environment files='/puresky_2k.hdr'  />
      <ambientLight intensity={0.5} />
      <directionalLight
        ref={lightRef}
        intensity={1}
        position={[100, 40, 75]}
        rotation={[-Math.PI / 2, 0, 0]}
        shadow-camera-left={-settings.floor.height / 2}
        shadow-camera-right={settings.floor.height / 2}
        shadow-camera-top={settings.floor.width / 2}
        shadow-camera-bottom={-settings.floor.width / 2}
        castShadow
      />

      <Stars speed={2} fade />

      {signals.freeCamera.value && <MapControls makeDefault />}
    </>
  );
}
