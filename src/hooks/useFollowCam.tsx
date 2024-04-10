import { useThree, useFrame } from '@react-three/fiber';
import { useMemo, useEffect } from 'react';
import { Group, Object3D, Object3DEventMap, Vector3 } from 'three';
import { settings } from '../settings';
import { signals } from '../state';

export function useFollowCam(characterBodyRef: React.RefObject<Group<Object3DEventMap>>) {
  const { scene, camera } = useThree();

  const pivot = useMemo(() => new Object3D(), []);
  const alt = useMemo(() => new Object3D(), []);
  const yaw = useMemo(() => new Object3D(), []);
  const pitch = useMemo(() => new Object3D(), []);
  const worldPosition = useMemo(() => new Vector3(), []);

  function onDocumentMouseMove(e: MouseEvent) {
    if (!document.pointerLockElement) return;

    e.preventDefault();
    yaw.rotation.y -= e.movementX * 0.002;
    const v = pitch.rotation.x - e.movementY * 0.002;

    // clamp up/down camera pitch rotation
    if (v > -1 && v < 0.8) pitch.rotation.x = v;
  }

  useEffect(() => {
    if (signals.freeCamera.value) return;

    scene.add(pivot);
    pivot.add(alt);
    alt.position.y = settings.cameraPosOffset.y;
    alt.add(yaw);
    yaw.add(pitch);
    pitch.add(camera);
    camera.position.set(settings.cameraPosOffset.x, 0, settings.cameraPosOffset.z);

    document.addEventListener('mousemove', onDocumentMouseMove);

    return () => void document.removeEventListener('mousemove', onDocumentMouseMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  useFrame(() => {
    characterBodyRef.current?.getWorldPosition(worldPosition);
    pivot.position.copy(worldPosition);
  });

  return { pivot, alt, yaw, pitch };
}
