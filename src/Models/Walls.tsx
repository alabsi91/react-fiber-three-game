import { useBox } from '@react-three/cannon';
import { Box, useTexture } from '@react-three/drei';
import { RepeatWrapping, type Mesh } from 'three';
import { settings } from '../settings';
import { signals } from '../state';

type Props = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
  width: number;
};

function Wall(props: Props) {
  const [ref] = useBox<Mesh>(() => ({
    args: [props.width, settings.wall.height, settings.wall.thickness],
    mass: 0,
    type: 'Static',
    material: 'ground',
    position: props.position,
    rotation: props.rotation,
  }));

  const texture = useTexture({
    map: 'textures/wall/diff.jpg',
    displacementMap: 'textures/wall/displacement.png',
    aoMap: 'textures/wall/ao.jpg',
    bumpMap: 'textures/wall/bump.jpg',
    roughnessMap: 'textures/wall/roughness.jpg',
    metalnessMap: 'textures/wall/roughness.jpg',
    normalMap: 'textures/wall/normal.png',
    envMap: 'textures/wall/env.jpg',
    // emissiveMap: 'textures/wall/emissive.jpg',
  });

  Object.keys(texture).forEach(key => {
    const textureName = texture[key as keyof typeof texture].clone();
    textureName.repeat.set(props.width / 3, 1);
    textureName.wrapS = RepeatWrapping;
    textureName.wrapT = RepeatWrapping;
    texture[key as keyof typeof texture] = textureName;
  });

  return (
    <Box
      ref={ref}
      args={[props.width, settings.wall.height, settings.wall.thickness, 140, 140, 140]}
      scale={props.scale}
      castShadow
    >
      {signals.isDebug.value && <meshStandardMaterial color='purple' wireframe />}
      {!signals.isDebug.value && (
        <meshStandardMaterial
          attach='material'
          {...texture}
          roughness={1}
          metalness={1}
          displacementScale={0.1}
          displacementBias={-0.03}
          envMapIntensity={1}
          flatShading
        />
      )}
    </Box>
  );
}

export default function Walls() {
  const y = settings.wall.height / 2 - 0.1;
  const x = settings.floor.width / 2;
  const z = settings.floor.height / 2;
  return (
    <>
      <Wall
        width={settings.floor.width}
        position={[0, y, z + settings.wall.thickness / 2]}
        rotation={[0, 0, 0]}
        scale={[1, 1, 1]}
      />
      <Wall
        width={settings.floor.width}
        position={[0, y, -z - settings.wall.thickness / 2]}
        rotation={[0, Math.PI * 2, 0]}
        scale={[1, 1, -1]}
      />
      <Wall
        width={settings.floor.height}
        position={[x + settings.wall.thickness / 2, y, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[1, -1, 1]}
      />
      <Wall
        width={settings.floor.height}
        position={[-x - settings.wall.thickness / 2, y, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[1, 1, -1]}
      />
      {/* fill the gaps on the sides */}
      <Wall
        width={settings.wall.thickness}
        position={[-x - settings.wall.thickness / 2, y, z + settings.wall.thickness / 2]}
        rotation={[0, 0, 0]}
      />
      <Wall
        width={settings.wall.thickness}
        position={[x + settings.wall.thickness / 2, y, z + settings.wall.thickness / 2]}
        rotation={[0, 0, 0]}
      />
      <Wall
        width={settings.wall.thickness}
        position={[-x - settings.wall.thickness / 2, y, -z - settings.wall.thickness / 2]}
        rotation={[0, 0, 0]}
      />
      <Wall
        width={settings.wall.thickness}
        position={[x + settings.wall.thickness / 2, y, -z - settings.wall.thickness / 2]}
        rotation={[0, 0, 0]}
      />
    </>
  );
}
