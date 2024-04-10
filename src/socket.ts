import { io, type Socket } from 'socket.io-client';
import { signals } from './state';
import type { ClientToServerEvents, ServerToClientEvents, SocketBall, SocketPlayer, Teams } from './types';

export const socketio: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  window.localStorage.getItem('serverurl') ?? 'http://localhost:3000'
);

// * get online players
socketio.on('players', data => {
  signals.onlinePlayers.value = data.filter(player => player.id !== socketio.id);
});

// * get ball data when the server is handling it
socketio.on('ballServer', data => {
  signals.ballData.value = data;
});

// * get who last player hit the ball to determine who should send the ball position
socketio.on('lastPlayerHitTheBall', (playerId: string) => {
  signals.sendBallData.value = playerId === socketio.id;
  if (signals.sendBallData.value) signals.ballData.value = null; // empty ball data if this client is handling it
});

// * get scores
socketio.on('scores', data => {
  signals.score.value = data;
});

// * send current player data
const updatePlayer = (data: Partial<SocketPlayer>) => {
  socketio.emit('updatePlayer', data);
};

// * tell server last player hit the ball is this client
const updateLastPlayerHitTheBall = () => {
  socketio.emit('lastPlayerHitTheBall', socketio.id ?? '');
};

// * send ball data when this client is handling it
const updateBallData = (data: SocketBall) => {
  socketio.emit('ballClient', data);
};

// * send score when this client is handling the ball position
const updateScore = (team: Teams) => {
  socketio.emit('registerScore', team);
};

// * when used in gui controls
const resetScore = () => {
  socketio.emit('resetScores');
};

const sendBallHitAnimation = () => {
  socketio.emit('ballHitAnimation');
};

const sendBallTeleportSound = () => {
  socketio.emit('ballTeleportSound');
};

export const socket = {
  updatePlayer,
  updateLastPlayerHitTheBall,
  updateBallData,
  sendBallHitAnimation,
  sendBallTeleportSound,
  updateScore,
  resetScore,
};
