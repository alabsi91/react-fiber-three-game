import { forwardRef } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { useSkinnedMeshClone } from '../../hooks/useSkinnedMeshClone';

type GLTFResult = GLTF & {
  nodes: {
    Ch34: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
  };
  materials: {
    phong1: THREE.MeshStandardMaterial;
  };
  animations: THREE.AnimationClip[];
};

const Jolleen = forwardRef<THREE.Group, JSX.IntrinsicElements['group']>((props, ref) => {
  const { nodes, materials } = useSkinnedMeshClone('/characters/Jolleen.glb') as GLTFResult;

  return (
    <group ref={ref} name='character' dispose={null} {...props}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
        <primitive object={nodes.mixamorigHips} />
        <skinnedMesh geometry={nodes.Ch34.geometry} material={materials.phong1} skeleton={nodes.Ch34.skeleton} castShadow />
      </group>
      {props.children}
    </group>
  );
});

export default Jolleen;
