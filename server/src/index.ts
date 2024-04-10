import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketBall,
  SocketData,
  SocketPlayer,
} from '../../src/types.js';
import { getRandomGamerTag } from './gamerTags.js';

export const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const players: SocketPlayer[] = [];
let ball: SocketBall = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  velocity: [0, 0, 0],
  angularVelocity: [0, 0, 0],
};
const score = {
  Blue: 0,
  Red: 0,
};

let lastPlayerHitTheBall = '';

io.on('connection', socket => {
  // send score on connection
  io.emit('scores', score);

  // make this player send ball data if it is the only player
  if (players.length === 0) {
    lastPlayerHitTheBall = socket.id;
    socket.broadcast.emit('lastPlayerHitTheBall', lastPlayerHitTheBall);
  }

  // * player connected
  players.push({
    id: socket.id,
    name: getRandomGamerTag(),
    position: [10, 0, 10],
    rotation: 0,
    character: 'Lola',
    animation: 'idle',
    team: 'Blue',
  });

  console.log('a user connected with id:', socket.id);

  // * send player data to newly connected player
  io.to(socket.id).emit('players', players);

  socket.on('disconnect', () => {
    console.log('a user disconnected with id:', socket.id);

    players.splice(
      players.findIndex(p => p.id === socket.id),
      1,
    );

    // if this player was sending the ball data handle it over to other players
    if (lastPlayerHitTheBall === socket.id && players.length > 0) {
      lastPlayerHitTheBall = players[0].id;
      io.emit('lastPlayerHitTheBall', lastPlayerHitTheBall);
    }
  });

  socket.on('updatePlayer', data => {
    const playerIndex = players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;
    players[playerIndex] = { ...players[playerIndex], ...data };

    // send updated player data to all clients
    io.emit('players', players);
  });

  socket.on('ballClient', data => {
    ball = { ...ball, ...data };
    socket.broadcast.emit('ballServer', ball);
  });

  socket.on('lastPlayerHitTheBall', (playerId: string) => {
    lastPlayerHitTheBall = playerId;
    io.emit('lastPlayerHitTheBall', lastPlayerHitTheBall);
  });

  socket.on('ballHitAnimation', () => {
    socket.broadcast.emit('ballHitAnimation');
  });

  socket.on('ballTeleportSound', () => {
    socket.broadcast.emit('ballTeleportSound');
  });

  socket.on('registerScore', forTeam => {
    score[forTeam] += 1;
    io.emit('scores', score);
  });

  socket.on('resetScores', () => {
    score.Blue = 0;
    score.Red = 0;
    io.emit('scores', score);
  });
});

io.listen(3000);
