import { forwardRef } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { useSkinnedMeshClone } from '../../hooks/useSkinnedMeshClone';

type GLTFResult = GLTF & {
  nodes: {
    Amy: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
  };
  materials: {
    Amy_body: THREE.MeshStandardMaterial;
  };
  animations: THREE.AnimationClip[];
};

const Amy = forwardRef<THREE.Group, JSX.IntrinsicElements['group']>((props, ref) => {
  const { nodes, materials } = useSkinnedMeshClone('/characters/Amy.glb') as GLTFResult;

  return (
    <group ref={ref} name='character' dispose={null} {...props}>
      <group name='Armature' rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
        <primitive object={nodes.mixamorigHips} />
        <skinnedMesh
          name='Maria_J_J_Ong'
          geometry={nodes.Amy.geometry}
          material={materials.Amy_body}
          skeleton={nodes.Amy.skeleton}
          castShadow
        />
      </group>
      {props.children}
    </group>
  );
});

export default Amy;
