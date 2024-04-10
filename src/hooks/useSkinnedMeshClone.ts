import { useGLTF } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { useMemo } from 'react';
import { SkeletonUtils } from 'three-stdlib';

export function useSkinnedMeshClone(path: string) {
  const { scene, materials, animations } = useGLTF(path);
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clonedScene);

  return { scene: clonedScene, materials, animations, nodes };
}
