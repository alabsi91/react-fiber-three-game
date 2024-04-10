import { forwardRef } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { useSkinnedMeshClone } from '../../hooks/useSkinnedMeshClone';

type GLTFResult = GLTF & {
  nodes: {
    Maria: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
  };
  materials: {
    maria_materials: THREE.MeshStandardMaterial;
  };
  animations: THREE.AnimationClip[];
};

const Maria = forwardRef<THREE.Group, JSX.IntrinsicElements['group']>((props, ref) => {
  const { nodes, materials } = useSkinnedMeshClone('/characters/Maria.glb') as GLTFResult;

  return (
    <group ref={ref} name='character' dispose={null} {...props}>
      <group name='Armature' rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
        <primitive object={nodes.mixamorigHips} />
        <skinnedMesh
          name='Maria_J_J_Ong'
          geometry={nodes.Maria.geometry}
          material={materials.maria_materials}
          skeleton={nodes.Maria.skeleton}
          castShadow
        />
      </group>
      {props.children}
    </group>
  );
});

export default Maria;
