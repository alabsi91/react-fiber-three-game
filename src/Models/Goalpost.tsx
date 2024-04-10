import { useBox, useCompoundBody } from '@react-three/cannon';
import { Plane, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { settings } from '../settings';

type GLTFResult = GLTF & {
  nodes: {
    Frame: THREE.Mesh;
    Net: THREE.Mesh;
  };
  materials: {
    ['default']: THREE.MeshStandardMaterial;
  };
};

type Props = {
  position: [number, number, number];
  rotation?: [number, number, number];
  side: 'left' | 'right';
};
export function GoalPost(props: Props) {
  const { nodes, materials } = useGLTF('/goalpost.glb') as GLTFResult;

  const [ref] = useCompoundBody<THREE.Group>(() => ({
    shapes: [
      {
        args: [0.1, 0.1, 10],
        position: [5, 4, -1.42],
        rotation: [0, 0, -Math.PI / 2],
        type: 'Cylinder',
      },
      {
        args: [10, 4, 0.5],
        position: [5, 2, 1.2],
        rotation: [-0.4, 0, 0],
        type: 'Box',
      },
      {
        args: [10, 1.6, 0.5],
        position: [5, 4, -0.46],
        rotation: [-Math.PI / 2, 0, 0],
        type: 'Box',
      },
      {
        args: [2, 4, 0.5],
        position: [0, 2, -0.5],
        rotation: [0, -Math.PI / 2, 0],
        type: 'Box',
      },
      {
        args: [2, 4, 0.5],
        position: [10, 2, -0.5],
        rotation: [0, -Math.PI / 2, 0],
        type: 'Box',
      },
    ],
    material: 'ground',
    type: 'Kinematic',
    ...props,
  }));

  const sensorPosition = {
    x: props.position[0] + (props.position[0] < 0 ? 5 : -5),
    y: props.position[1] + (props.position[1] < 0 ? -2 : 2),
    z: props.position[2] + (props.position[2] < 0 ? -0 : 0),
  };
  const [sensorRef] = useBox<THREE.Mesh>(() => ({
    args: [3, 8, 0.5],
    position: [sensorPosition.x, sensorPosition.y, sensorPosition.z],
    rotation: [0, 0, -Math.PI / 2],
    isTrigger: true,
  }));

  return (
    <group ref={ref} dispose={null} name='goalpost' {...props}>
      <mesh geometry={nodes.Frame.geometry} material={materials['default']}></mesh>
      <mesh geometry={nodes.Net.geometry} material={materials['default']}>
        <meshToonMaterial color={props.side === 'right' ? 'red' : 'blue'} />
      </mesh>
      <Plane ref={sensorRef} name={`goal-sensor-${props.side}`} args={[0, 0]} visible={false} />
    </group>
  );
}

export function PositionedGoalPost() {
  return (
    <>
      <GoalPost side='left' position={[-4.6, 0, settings.floor.height / 2 - 2.2]} />
      <GoalPost side='right' position={[4.6, 0, -(settings.floor.height / 2 - 2.2)]} rotation={[0, Math.PI, 0]} />
    </>
  );
}
useGLTF.preload('/goalpost.glb');
