import { Howl } from 'howler';

export const teleportSound = new Howl({
  src: ['/sounds/teleport.mp3'],
  loop: false,
  volume: 0.5,
});

export const punchSound = new Howl({
  src: ['/sounds/punch.mp3'],
  loop: false,
});

export const ambientSound = new Howl({
  src: ['/sounds/wind.mp3'],
  loop: true,
  volume: 0.1,
});

export const fartSound = new Howl({
  src: ['/sounds/fart.mp3'],
  loop: false,
});

export const winSound = new Howl({
  src: ['/sounds/win.mp3'],
  loop: false,
});

export const jumpSound = new Howl({
  src: ['/sounds/jump.mp3'],
  loop: false,
})

export const walkSound = new Howl({
  src: ['/sounds/footsteps.mp3'],
  loop: true,
  rate: 1.2
})

export const runSound = new Howl({
  src: ['/sounds/footsteps.mp3'],
  loop: true,
  rate: 2
})