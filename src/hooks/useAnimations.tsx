/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { Object3D, AnimationClip, AnimationAction, AnimationMixer } from 'three';
import { useFrame } from '@react-three/fiber';

type Api<T extends AnimationClip> = {
  ref: React.MutableRefObject<Object3D | undefined | null>;
  clips: AnimationClip[];
  mixer: AnimationMixer;
  names: T['name'][];
  actions: { [key in T['name']]: AnimationAction | null };
};

export function useAnimations<T extends AnimationClip>(
  clips: T[],
  root: React.MutableRefObject<Object3D | undefined | null> | Object3D,
  deps: string[]
): Api<T> {
  const ref = React.useRef<Object3D>();
  const [actualRef] = React.useState(() => (root ? (root instanceof Object3D ? { current: root } : root) : ref));

  const [mixer] = React.useState(() => new AnimationMixer(undefined as unknown as Object3D));
  React.useLayoutEffect(() => {
    actualRef.current = root instanceof Object3D ? root : root.current;
    // @ts-expect-error not assignable
    mixer._root = actualRef.current;
  });

  const lazyActions = React.useRef({});
  const api = React.useMemo<Api<T>>(() => {
    const actions = {} as { [key in T['name']]: AnimationAction | null };
    clips.forEach(clip =>
      Object.defineProperty(actions, clip.name, {
        enumerable: true,
        get() {
          if (actualRef.current) {
            // @ts-expect-error not assignable
            return lazyActions.current[clip.name] || (lazyActions.current[clip.name] = mixer.clipAction(clip, actualRef.current));
          }
        },
        configurable: true,
      })
    );
    return { ref: actualRef, clips, actions, names: clips.map(c => c.name), mixer };
  }, [clips]);

  useFrame((_state, delta) => mixer.update(delta));

  React.useEffect(() => {
    const currentRoot = actualRef.current;
    return () => {
      // Clean up only when clips change, wipe out lazy actions and uncache clips
      lazyActions.current = {};
      mixer.stopAllAction();
      Object.values(api.actions).forEach(action => {
        if (currentRoot) {
          mixer.uncacheAction(action as AnimationClip, currentRoot);
        }
      });
    };
  }, [clips, ...deps]);

  return api;
}
