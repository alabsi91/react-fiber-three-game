/* eslint-disable react-hooks/exhaustive-deps */
import { useCompoundBody } from '@react-three/cannon';
import { useGLTF, useKeyboardControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { fartSound, jumpSound, runSound, walkSound } from '../Scene/sounds';
import { useAnimations } from '../hooks/useAnimations';
import { useFollowCam } from '../hooks/useFollowCam';
import { settings } from '../settings';
import { socket } from '../socket';
import { signals } from '../state';
import { ActionName, Controls, GLTFAnimations, PlayerCharacter } from '../types';
import Characters from './characters/characters';

export default function Player() {
  const { camera } = useThree();

  const { animations } = useGLTF('/animations.glb') as GLTFAnimations;

  const lastPosition = useRef<[number, number, number]>([settings.floor.width / 3, 0, settings.floor.height / 3]);
  const lastRotation = useRef<[number, number, number]>([0, 0, 0]);

  const bodyMesh = useRef<THREE.Group>(null);
  useFollowCam(bodyMesh);

  // * Cannon physics body
  const [, bodyPhysics] = useCompoundBody<THREE.Group>(
    () => ({
      shapes: [
        {
          args: [0.3, 0.3, 1.7, 10],
          position: [0, 0.85, 0],
          type: 'Cylinder',
        },
        {
          type: 'Box',
          args: [0.5, 0.5, 0.5],
          position: [0, 0.9, 0.5],
        },
      ],
      onCollide: e => {
        if (character.isOnTheGround) return;
        const faceY = e.contact.contactNormal[1];
        if (faceY > 0.9 && faceY < 1.1) onLanding();
      },
      fixedRotation: true,
      mass: 1,
      position: lastPosition.current,
      rotation: lastRotation.current,
      material: 'body',
    }),
    bodyMesh,
    [signals.character.value]
  );

  const { actions } = useAnimations(animations, bodyMesh, [signals.character.value]);

  const changeAnimation = (
    newAnimation: ActionName,
    { loop = -1, duration = -1, blendDuration = 0.1, stopCurrent = true, playLastClipOnFinish = false } = {}
  ) => {
    const currentAnimation = actions[character.currentAnimation];
    if (!currentAnimation) return;

    if (character.currentAnimation === newAnimation && currentAnimation.isRunning()) return;

    const targetAnimation = actions[newAnimation];
    if (!targetAnimation) return;

    // newAction.
    targetAnimation.reset();
    if (loop >= 0) targetAnimation.setLoop(THREE.LoopRepeat, loop);
    if (duration >= 0) targetAnimation.setDuration(duration);
    if (stopCurrent) targetAnimation.crossFadeFrom(currentAnimation, blendDuration, false);
    targetAnimation.play();

    if (playLastClipOnFinish) {
      const t = duration < 0 ? targetAnimation.getClip().duration : duration;
      setTimeout(() => {
        currentAnimation.reset().crossFadeFrom(targetAnimation, blendDuration, false);
      }, t * 1000);
      return;
    }

    character.currentAnimation = newAnimation;
  };

  const character = useRef<PlayerCharacter>({
    bodyMesh: bodyMesh,
    physicsBody: bodyPhysics,
    walkingDirection: [],
    isWalking: false,
    isRunning: false,
    isJumping: false,
    isFalling: false,
    isOnTheGround: true,
    jumpStartY: 0,
    currentAnimation: 'idle',
    currentSound: 'none',
    getPosition: () => {
      const characterPos = new THREE.Vector3();
      bodyMesh.current?.getWorldPosition(characterPos);
      return characterPos;
    },
    changeAnimation,
  }).current;

  // * Keyboard events
  const [sub] = useKeyboardControls<Controls>();
  useEffect(() => {
    const unsubscribe = sub(state => {
      character.walkingDirection = [];

      const isWalking = state.forward || state.back || state.left || state.right;

      if (!character.isFalling || !character.isJumping) {
        if (state.forward) character.walkingDirection.push('forward');
        if (state.back) character.walkingDirection.push('backward');
        if (state.left) character.walkingDirection.push('left');
        if (state.right) character.walkingDirection.push('right');

        character.isWalking = isWalking && !state.run;
        character.isRunning = state.run;
        if (!character.isFalling && !character.isJumping) {
          character.isJumping = state.jump;
          character.jumpStartY = character.getPosition().y;
          if (state.jump) onJumping();
        }
      }

      return isWalking;
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const onJumping = () => {
    character.isJumping = true;
    character.isOnTheGround = false;

    const characterPos = character.getPosition();

    character.jumpStartY = characterPos.y;

    if (character.isWalking || character.isRunning) {
      const forwardForce = character.isWalking ? settings.character.walkingSpeed : settings.character.runningSpeed;
      const cameraDirection = getCameraDirection().multiplyScalar(forwardForce);
      bodyPhysics.applyImpulse(
        [cameraDirection.x, settings.character.jumpForce, cameraDirection.z],
        [characterPos.x, characterPos.y, characterPos.z]
      );
      return;
    }

    bodyPhysics.applyImpulse([0, settings.character.jumpForce, 0], [characterPos.x, characterPos.y, characterPos.z]);
  };

  const onLanding = () => {
    bodyPhysics.velocity.set(0, 0, 0);
    bodyPhysics.angularVelocity.set(0, 0, 0);
    character.isJumping = false;
    character.isFalling = false;
    character.isOnTheGround = true;
  };

  const animationController = () => {
    if (character.isJumping) {
      changeAnimation('jump', { duration: 0.8 });
      return;
    }

    if (character.isFalling) {
      changeAnimation('falling', { blendDuration: 0.3 });
      return;
    }

    if (character.isWalking) {
      changeAnimation('walk');
      return;
    }

    if (character.isRunning) {
      changeAnimation('run');
      return;
    }

    changeAnimation('idle');
  };

  const soundController = () => {
    if (character.isJumping) {
      if (character.currentSound === 'jump') return;
      stopSounds();
      jumpSound.play();
      character.currentSound = 'jump';
      return;
    }

    if (character.isFalling) {
      stopSounds();
      return;
    }

    if (character.isWalking) {
      if (character.currentSound === 'walk') return;
      stopSounds();
      walkSound.play();
      character.currentSound = 'walk';
      return;
    }

    if (character.isRunning) {
      if (character.currentSound === 'run') return;
      stopSounds();
      runSound.play();
      character.currentSound = 'run';
      return;
    }

    if (character.currentSound !== 'none') {
      stopSounds();
      character.currentSound = 'none';
    }
  };

  const stopSounds = () => {
    walkSound.pause();
    runSound.pause();
    jumpSound.stop();
  };

  const teleport = (position: [number, number, number] = [0, 0, 0], rotation: [number, number, number] = [0, 0, 0]) => {
    fartSound.play();
    character.walkingDirection = [];
    bodyPhysics.rotation.set(rotation[0], rotation[1], rotation[2]);
    bodyPhysics.position.set(position[0], position[1], position[2]);
  };

  const getCameraDirection = () => {
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // look only for the horizontal direction
    return cameraDirection.normalize();
  };

  useFrame((_, delta) => {
    animationController();
    soundController();

    const characterPos = character.getPosition();

    // check if the character is falling
    throttle(() => {
      if (!character.isFalling && characterPos.y < lastPosition.current[1]) {
        character.isOnTheGround = false;
        if (!character.isJumping) {
          character.isFalling = true;
          character.walkingDirection = [];
        }
      }
    }, 100);

    // apply gravity when the character is reached the jump height
    if (character.isJumping && characterPos.y >= settings.character.jumpHeight + character.jumpStartY) {
      bodyPhysics.applyImpulse([0, -20, 0], [characterPos.x, characterPos.y, characterPos.z]);
      character.isJumping = false;
      character.isFalling = true;
    }

    // Ignore body physics
    if (character.isOnTheGround) {
      character.physicsBody.velocity.set(0, 0, 0);
      character.physicsBody.angularVelocity.set(0, 0, 0);
    }

    const speed = (character.isRunning ? settings.character.runningSpeed : settings.character.walkingSpeed) * delta;

    // the character is below the ground - teleport to the starting position
    if (characterPos.y < -10) {
      teleport();
      return;
    }

    if (character.isWalking || character.isRunning) {
      const isForward = character.walkingDirection.includes('forward');
      const isBackward = character.walkingDirection.includes('backward');
      const isLeft = character.walkingDirection.includes('left');
      const isRight = character.walkingDirection.includes('right');

      const cameraDirection = getCameraDirection();
      cameraDirection.y = 0; // look only for the horizontal direction
      cameraDirection.multiplyScalar(isBackward ? -speed : speed);

      if (isRight || isLeft) {
        const isMovingInAngle = isForward || isBackward;
        const axis = new THREE.Vector3(0, 1, 0);
        const angle = ((isLeft ? 90 : -90) * (isBackward ? -1 : 1)) / (isMovingInAngle ? 2 : 1); // in degrees
        cameraDirection.applyAxisAngle(axis, angle * THREE.MathUtils.DEG2RAD);
      }

      const cameraAngle = Math.atan2(cameraDirection.x, cameraDirection.z);
      character.physicsBody.rotation.set(0, cameraAngle, 0);

      const newPosition: [number, number, number] = [
        characterPos.x + cameraDirection.x,
        characterPos.y,
        characterPos.z + cameraDirection.z,
      ];
      if (character.isOnTheGround) character.physicsBody.position.set(...newPosition);
      lastPosition.current = newPosition;
      lastRotation.current = [0, cameraAngle, 0];

      socket.updatePlayer({
        position: newPosition,
        rotation: cameraAngle,
        animation: character.isRunning ? 'run' : 'walk',
      });

      return;
    }

    lastPosition.current = [characterPos.x, characterPos.y, characterPos.z];
    socket.updatePlayer({
      position: lastPosition.current,
      animation: character.isFalling ? 'falling' : 'idle',
    });
  });

  useEffect(() => {
    signals.player.value = character;
    actions.idle?.reset().play();
    return () => void actions.idle?.fadeOut(0.1);
  }, []);

  return <Characters characterName={signals.character.value} name='player' ref={bodyMesh} />;
}

useGLTF.preload('/animations.glb');

let lastCall = 0;
function throttle(func: () => void, delay: number) {
  const now = Date.now();
  if (now - lastCall >= delay) {
    func();
    lastCall = now;
  }
}
