import { forwardRef } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { useSkinnedMeshClone } from '../../hooks/useSkinnedMeshClone';

type GLTFResult = GLTF & {
  nodes: {
    Lola: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
  };
  materials: {
    phong1: THREE.MeshStandardMaterial;
  };
  animations: THREE.AnimationClip[];
};

const Lola = forwardRef<THREE.Group, JSX.IntrinsicElements['group']>((props, ref) => {
  const { nodes, materials } = useSkinnedMeshClone('/characters/Lola.glb') as GLTFResult;

  return (
    <group ref={ref} name='character' dispose={null} {...props}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
        <primitive object={nodes.mixamorigHips} />
        <skinnedMesh geometry={nodes.Lola.geometry} material={materials.phong1} skeleton={nodes.Lola.skeleton} castShadow />
      </group>
      {props.children}
    </group>
  );
});

export default Lola;
