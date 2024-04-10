import { signal } from '@preact/signals-react';
import type { CharactersNames, PlayerCharacter, SocketBall, SocketPlayer } from './types';

export const signals = {
  isDebug: signal(Boolean(window.localStorage.getItem('debug')) ?? false),
  freeCamera: signal(false),
  player: signal<PlayerCharacter | null>(null),
  character: signal<CharactersNames>((window.localStorage.getItem('character') as CharactersNames) ?? 'Lola'),
  onlinePlayers: signal<SocketPlayer[]>([]),
  sendBallData: { value: false },
  ballData: { value: null as SocketBall | null },
  score: signal({ Blue: 0, Red: 0 }),
};
