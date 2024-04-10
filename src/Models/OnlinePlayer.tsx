import { PositionalAudio, Text, useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { LoopRepeat, Vector3, type Group, type Mesh, type PositionalAudio as PositionalAudioType } from 'three';
import { useAnimations } from '../hooks/useAnimations';
import { signals } from '../state';
import { ActionName, GLTFAnimations, SocketPlayer } from '../types';
import Characters from './characters/characters';

type Props = SocketPlayer;

export function OnlinePlayer(props: Props) {
  const characterBody = useRef<Group>(null);

  const { animations } = useGLTF('/animations.glb') as GLTFAnimations;
  const { actions } = useAnimations(animations, characterBody, [props.character]);
  const currentAnimation = useRef<ActionName>('idle');

  const audioRef = useRef<PositionalAudioType>(null);

  const { camera } = useThree();
  const textRef = useRef<Mesh>(null);

  const changeAnimation = (newAnimation: ActionName, { loop = -1, duration = -1, blendDuration = 0.1 } = {}) => {
    const currentAction = actions[currentAnimation.current];
    if (!currentAction) return;

    if (currentAnimation.current === newAnimation && currentAction.isRunning()) return;

    const targetAnimation = actions[newAnimation];
    if (!targetAnimation) return;

    // newAction.
    targetAnimation.reset();
    if (loop >= 0) targetAnimation.setLoop(LoopRepeat, loop);
    if (duration >= 0) targetAnimation.setDuration(duration);
    targetAnimation.crossFadeFrom(currentAction, blendDuration, false);
    targetAnimation.play();

    currentAnimation.current = newAnimation;
  };

  const playSound = (type: ActionName) => {
    const sound = audioRef.current;
    if (!sound) return;

    const isPlaying = sound.isPlaying;

    if (isPlaying && type !== 'walk' && type !== 'run') {
      sound.stop();
      return;
    }

    sound.setPlaybackRate(type === 'walk' ? 1.2 : 2);

    if (!isPlaying) sound.play();
  };

  useFrame(() => {
    if (!characterBody.current) return;

    // * update character position and rotation
    characterBody.current.position.set(props.position[0], props.position[1], props.position[2]);
    characterBody.current.rotation.set(0, props.rotation, 0);

    // * update character animation
    changeAnimation(props.animation);

    // * update character sound
    playSound(props.animation);

    // * update text to look at camera
    if (!textRef.current) return;
    textRef.current.position.set(props.position[0], props.position[1] + 2, props.position[2]);

    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);
    const cameraAngle = Math.atan2(cameraDirection.x, cameraDirection.z);
    textRef.current.rotation.set(0, cameraAngle + Math.PI, 0);
  });

  return (
    <group>
      <Characters characterName={props.character} name='onlinePlayer' ref={characterBody}>
        <PositionalAudio ref={audioRef} url='/sounds/footsteps.mp3' autoplay={false} distance={1} />
      </Characters>
      <Text
        ref={textRef}
        fontSize={0.2}
        anchorX='center'
        anchorY='middle'
        color={props.team}
        position={[props.position[0], props.position[1] + 2, props.position[2]]}
      >
        {props.name}
      </Text>
    </group>
  );
}

export function RenderOnlinePlayers() {
  const players = signals.onlinePlayers.value;
  if (players.length > 0) return players.map(player => <OnlinePlayer key={player.id} {...player} />);
  return null;
}
