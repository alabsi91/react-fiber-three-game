import { PublicApi } from '@react-three/cannon';
import React from 'react';
import type { AnimationClip, Group, Object3DEventMap, Vector3 } from 'three';
import type { GLTF } from 'three-stdlib';
import type { Characters } from './Models/characters/characters';

export enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
  run = 'run',
}

export type PlayerCharacter = {
  bodyMesh: React.RefObject<Group<Object3DEventMap>>;
  physicsBody: PublicApi;
  walkingDirection: ('forward' | 'backward' | 'left' | 'right')[];
  isRunning: boolean;
  isJumping: boolean;
  isFalling: boolean;
  isOnTheGround: boolean;
  isWalking: boolean;
  jumpStartY: number;
  currentSound: 'none' | 'walk' | 'run' | 'jump';
  currentAnimation: ActionName;
  getPosition: () => Vector3;
  changeAnimation: (
    newAnimation: ActionName,
    options?: { loop?: number; duration?: number; blendDuration?: number; stopCurrent?: boolean; playLastClipOnFinish?: boolean }
  ) => void;
};

export type GLTFAnimations = GLTF & {
  animations: GLTFAction[];
};

interface GLTFAction extends AnimationClip {
  name: ActionName;
}
export type ActionName = 'idle' | 'walk' | 'run' | 'jump' | 'falling';
export type CharactersNames = Characters;
export type Teams = 'Blue' | 'Red';

export interface ServerToClientEvents {
  players: (players: SocketPlayer[]) => void;
  ballServer: (data: SocketBall) => void;
  ballHitAnimation: () => void;
  ballTeleportSound: () => void;
  lastPlayerHitTheBall: (playerId: string) => void;
  scores: (score: { Blue: number; Red: number }) => void;
}

export interface ClientToServerEvents {
  updatePlayer: (player: Partial<SocketPlayer>) => void;
  lastPlayerHitTheBall: (playerId: string) => void;
  ballClient: (data: SocketBall) => void;
  ballHitAnimation: () => void;
  ballTeleportSound: () => void;
  registerScore: (forTeam: Teams) => void;
  resetScores: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}

export interface SocketPlayer {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: number;
  character: CharactersNames;
  animation: ActionName;
  team: Teams;
}

export interface SocketBall {
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
}
