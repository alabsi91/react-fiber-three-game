/* eslint-disable react-hooks/exhaustive-deps */
import { useSphere, type Triplet } from '@react-three/cannon';
import { PositionalAudio, Sphere, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import animare, { ease } from 'animare';
import { useEffect, useRef } from 'react';
import {
  BufferGeometry,
  Euler,
  Group,
  Mesh,
  MeshLambertMaterial,
  Quaternion,
  Vector3,
  type PositionalAudio as PositionalAudioType,
} from 'three';
import { punchSound, teleportSound, winSound } from '../Scene/sounds';
import { settings } from '../settings';
import { socket, socketio } from '../socket';
import { signals } from '../state';

export default function Ball() {
  const { camera } = useThree();

  const ballSound = useRef<PositionalAudioType>(null);
  const animatedWaveRef = useRef<Mesh<BufferGeometry, MeshLambertMaterial>>(null);

  const lastCoordinate = useRef({
    position: [0, 10, 0] as Triplet,
    rotation: [0, 0, 0] as Triplet,
    velocity: [0, 0, 0] as Triplet,
    angularVelocity: [0, 0, 0] as Triplet,
  }).current;

  const [ballRef, ballPhysics] = useSphere<Group>(() => ({
    mass: 0.9,
    position: lastCoordinate.position,
    rotation: lastCoordinate.rotation,
    velocity: lastCoordinate.velocity,
    angularVelocity: lastCoordinate.angularVelocity,
    args: [1],
    material: 'ball',
    onCollideBegin: e => {
      if (e.body.name === 'player') {
        socket.updateLastPlayerHitTheBall();
      }

      if (e.body.name === 'floor') {
        playSound();
      }

      if (e.body.name.includes('goal-sensor')) {
        if (signals.sendBallData.value) {
          const side = e.body.name.includes('left') ? 'left' : 'right';
          socket.updateScore(side === 'left' ? 'Red' : 'Blue');
        }

        onGoal();
      }
    },
  }));

  const onGoal = () => {
    winSound.play();
    resetBall(false);
  };

  const playSound = () => {
    const sound = ballSound.current;
    if (!sound) return;
    if (!sound.isPlaying) sound.play();
  };

  const resetBall = (playSound = true) => {
    if (playSound) teleportSound.play();
    ballPhysics.position.set(0, 10, 0);
    ballPhysics.velocity.set(0, 0, 0);
    ballPhysics.angularVelocity.set(0, 0, 0);
    if (signals.sendBallData.value) socket.sendBallTeleportSound();
  };

  useFrame(() => {
    const ballMesh = ballRef.current;
    if (!ballMesh) return;

    // get ball position and rotation
    const ballPosition = new Vector3();
    ballMesh.getWorldPosition(ballPosition);

    const ballRotation = new Quaternion();
    ballMesh.getWorldQuaternion(ballRotation);

    const ballRotationEuler = new Euler();
    ballRotationEuler.setFromQuaternion(ballRotation);

    // send ball data
    if (signals.sendBallData.value) {
      lastCoordinate.position = ballPosition.toArray();
      lastCoordinate.rotation = [ballRotationEuler.x, ballRotationEuler.y, ballRotationEuler.z];

      // Reset the ball if it goes below the floor
      if (ballPosition.y < -5) {
        resetBall();
        lastCoordinate.position = [0, 10, 0];
        lastCoordinate.rotation = [0, 0, 0];
        lastCoordinate.velocity = [0, 0, 0];
        lastCoordinate.angularVelocity = [0, 0, 0];
      }

      socket.updateBallData({
        position: lastCoordinate.position,
        rotation: lastCoordinate.rotation,
        velocity: lastCoordinate.velocity,
        angularVelocity: lastCoordinate.angularVelocity,
      });

      return;
    }

    // * receive ball data
    if (!signals.ballData.value) return;
    const { velocity, angularVelocity, position, rotation } = signals.ballData.value;

    let dist = new Vector3().fromArray(position).distanceTo(ballPosition);
    dist = Math.round(dist * 100) / 100;

    if (dist > 0.5) {
      ballPhysics.position.set(...position);
      ballPhysics.rotation.set(...rotation);
      console.log(`Ball moved ${dist} meters`);
    } else {
      ballPhysics.velocity.set(...velocity);
      ballPhysics.angularVelocity.set(...angularVelocity);
    }

    lastCoordinate.angularVelocity = angularVelocity;
    lastCoordinate.velocity = velocity;
    lastCoordinate.position = position;
    lastCoordinate.rotation = rotation;
  });

  const texture = useTexture({
    map: 'textures/ball/diff.png',
  });

  const playHitAnimation = () => {
    const sparkles = animatedWaveRef.current;
    animare({ from: 1, to: [2, 0], duration: 200, ease: ease.out.cubic }, ([scale, alpha], { isFinished }) => {
      if (!sparkles) return;
      sparkles.scale.set(scale, scale, scale);
      sparkles.material.opacity = alpha;
      if (isFinished) sparkles.scale.set(0, 0, 0);
    });
    punchSound.play();
    socket.sendBallHitAnimation();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hitTheBall = async (e: MouseEvent) => {
    if (!document.pointerLockElement) return;

    const isRightClick = e.button === 2;

    const character = signals.player.value;
    const ballMesh = ballRef.current;
    if (!character || !ballMesh) return;

    // check if the character is close enough
    const characterPosition = character.getPosition();
    const ballPosition = new Vector3();
    ballMesh.getWorldPosition(ballPosition);
    const distance = characterPosition.distanceTo(ballPosition);
    if (distance > settings.ball.distanceToHit) return;

    playHitAnimation();

    socket.updateLastPlayerHitTheBall();

    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // look only for the horizontal direction
    cameraDirection.normalize().multiplyScalar(isRightClick ? 1 : settings.ball.hitForce);
    ballPhysics.applyImpulse([cameraDirection.x, isRightClick ? settings.ball.verticalForce : 1, cameraDirection.z], [0, 0, 0]);
  };

  useEffect(() => {
    document.addEventListener('click', hitTheBall);
    return () => {
      document.removeEventListener('click', hitTheBall);
    };
  }, [hitTheBall]);

  useEffect(() => {
    const unsubscribeVelocity = ballPhysics.velocity.subscribe(v => {
      if (!signals.sendBallData.value) return; // only when sending data
      lastCoordinate.velocity = v;
    });

    const unsubscribeAngularVelocity = ballPhysics.angularVelocity.subscribe(v => {
      if (!signals.sendBallData.value) return; // only when sending data
      lastCoordinate.angularVelocity = v;
    });

    return () => {
      unsubscribeVelocity();
      unsubscribeAngularVelocity();
    };
  }, [ballPhysics]);

  useEffect(() => {
    // receive ball hit animation
    const hitListener = socketio.on('ballHitAnimation', () => {
      if (!signals.sendBallData.value) playHitAnimation();
    });

    // receive ball teleport sound
    const TeleportListener = socketio.on('ballTeleportSound', () => {
      if (!signals.sendBallData.value) teleportSound.play();
    });

    return () => {
      hitListener.removeListener();
      TeleportListener.removeListener();
    };
  }, []);

  return (
    <group ref={ballRef} name='ball'>
      <Sphere args={[1, 150, 150]} name='ball' castShadow>
        {signals.isDebug.value && <meshLambertMaterial color='cyan' wireframe />}
        {!signals.isDebug.value && <meshStandardMaterial attach='material' {...texture} roughness={0} />}
        <PositionalAudio ref={ballSound} url='/sounds/ball.mp3' loop={false} distance={10} />
      </Sphere>

      <Sphere ref={animatedWaveRef} args={[1, 50, 50]} scale={0}>
        <meshLambertMaterial color='white' transparent />
      </Sphere>
    </group>
  );
}
