import { forwardRef } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { useSkinnedMeshClone } from '../../hooks/useSkinnedMeshClone';

type GLTFResult = GLTF & {
  nodes: {
    vanguard_Mesh: THREE.SkinnedMesh;
    vanguard_visor: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
  };
  materials: {
    VanguardBodyMat: THREE.MeshStandardMaterial;
    Vanguard_VisorMat: THREE.MeshStandardMaterial;
  };
  animations: THREE.AnimationClip[];
};

const Medea = forwardRef<THREE.Group, JSX.IntrinsicElements['group']>((props, ref) => {
  const { nodes, materials } = useSkinnedMeshClone('/characters/Vanguard.glb') as GLTFResult;

  return (
    <group ref={ref} name='character' dispose={null} {...props}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
        <primitive object={nodes.mixamorigHips} />
        <skinnedMesh
          geometry={nodes.vanguard_Mesh.geometry}
          material={materials.VanguardBodyMat}
          skeleton={nodes.vanguard_Mesh.skeleton}
          castShadow
        />
        <skinnedMesh
          geometry={nodes.vanguard_visor.geometry}
          material={materials.Vanguard_VisorMat}
          skeleton={nodes.vanguard_visor.skeleton}
          castShadow
        />
      </group>
      {props.children}
    </group>
  );
});

export default Medea;
