import { useBox, useContactMaterial } from '@react-three/cannon';
import { Plane, useTexture } from '@react-three/drei';
import { Mesh, RepeatWrapping } from 'three';
import { settings } from '../settings';
import { signals } from '../state';

export default function Floor() {
  useContactMaterial('ground', 'ground', {
    contactEquationRelaxation: 3,
    contactEquationStiffness: 1e8,
    friction: 0.4,
    frictionEquationStiffness: 1e8,
    restitution: 0.5,
  });

  useContactMaterial('body', 'ground', {
    restitution: 0,
    friction: 0,
  });

  useContactMaterial('body', 'ball', {
    restitution: 0,
    friction: 0,
  });

  useContactMaterial('ball', 'ground', {
    restitution: 0.5,
  });

  const [planeRef] = useBox<Mesh>(() => ({
    mass: 0,
    args: [settings.floor.width, settings.floor.height, 0.01],
    position: [0, 0, 0],
    rotation: [-Math.PI / 2, 0, 0],
    material: 'ground',
    type: 'Static',
  }));

  const texture = useTexture({
    map: 'textures/floor/diff1.jpg',
    displacementMap: 'textures/floor/displacement.jpg',
    aoMap: 'textures/floor/ao.jpg',
    bumpMap: 'textures/floor/bump.jpg',
    roughnessMap: 'textures/floor/roughness.jpg',
    metalnessMap: 'textures/floor/roughness.jpg',
    normalMap: 'textures/floor/normal.png',
    // envMap: 'textures/floor/env.jpg',
    // emissiveMap: 'textures/floor/emissive.jpg',
  });

  Object.keys(texture).forEach(key => {
    const textureName = texture[key as keyof typeof texture];
    textureName.repeat.set(settings.floor.width / 6, settings.floor.height / 6);
    textureName.wrapS = RepeatWrapping;
    textureName.wrapT = RepeatWrapping;
  });

  return (
    <Plane ref={planeRef} args={[settings.floor.width, settings.floor.height, 1000, 1000]} name='floor' receiveShadow>
      {signals.isDebug.value && <meshLambertMaterial color='orange' wireframe />}
      {!signals.isDebug.value && (
        <meshStandardMaterial
          attach='material'
          {...texture}
          displacementBias={-0.2}
          roughness={0.5}
          displacementScale={1}
          envMapIntensity={1}
          flatShading
        />
      )}
    </Plane>
  );
}
