import { forwardRef } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { useSkinnedMeshClone } from '../../hooks/useSkinnedMeshClone';

type GLTFResult = GLTF & {
  nodes: {
    Erika_Archer_Body_Mesh: THREE.SkinnedMesh;
    Erika_Archer_Clothes_Mesh: THREE.SkinnedMesh;
    Erika_Archer_Eyelashes_Mesh: THREE.SkinnedMesh;
    Erika_Archer_Eyes_Mesh: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
  };
  materials: {
    Akai_MAT: THREE.MeshStandardMaterial;
    eyelash_MAT: THREE.MeshStandardMaterial;
    Body_MAT: THREE.MeshStandardMaterial;
    EyeSpec_MAT: THREE.MeshStandardMaterial;
  };
  animations: THREE.AnimationClip[];
};

const Erika = forwardRef<THREE.Group, JSX.IntrinsicElements['group']>((props, ref) => {
  const { nodes, materials } = useSkinnedMeshClone('/characters/Erika.glb') as GLTFResult;

  return (
    <group ref={ref} name='character' dispose={null} {...props}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
        <primitive object={nodes.mixamorigHips} />
        <skinnedMesh
          geometry={nodes.Erika_Archer_Body_Mesh.geometry}
          material={materials.Akai_MAT}
          skeleton={nodes.Erika_Archer_Body_Mesh.skeleton}
          castShadow
        />
        <skinnedMesh
          geometry={nodes.Erika_Archer_Clothes_Mesh.geometry}
          material={materials.eyelash_MAT}
          skeleton={nodes.Erika_Archer_Clothes_Mesh.skeleton}
          castShadow
        />
        <skinnedMesh
          geometry={nodes.Erika_Archer_Eyelashes_Mesh.geometry}
          material={materials.Body_MAT}
          skeleton={nodes.Erika_Archer_Eyelashes_Mesh.skeleton}
          castShadow
        />
        <skinnedMesh
          geometry={nodes.Erika_Archer_Eyes_Mesh.geometry}
          material={materials.EyeSpec_MAT}
          skeleton={nodes.Erika_Archer_Eyes_Mesh.skeleton}
          castShadow
        />
      </group>
      {props.children}
    </group>
  );
});

export default Erika;
