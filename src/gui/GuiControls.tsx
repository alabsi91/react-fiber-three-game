import { Leva, button, useControls } from 'leva';
import { socket } from '../socket';
import { CharactersNames, Teams } from '../types';
import { signals } from '../state';

export default function GuiControls() {
  useControls({
    'Player Name': {
      value: window.localStorage.getItem('playerName') || '',
      onChange: value => {
        if (!value) return;
        window.localStorage.setItem('playerName', value);
        socket.updatePlayer({ name: value });
      },
    },
    'Server URL': {
      value: window.localStorage.getItem('serverurl') || 'http://localhost:3000',
      onChange: value => {
        if (!value) return;
        window.localStorage.setItem('serverurl', value);
        // window.alert('Server URL changed you need to refresh the page');
      },
    },
    Character: {
      options: ['Amy', 'Maria', 'Vanguard', 'Erika', 'Jolleen', 'Lola'] as CharactersNames[],
      value: signals.character.value,
      onChange: value => {
        if (!value) return;
        window.localStorage.setItem('character', value);
        signals.character.value = value;
        socket.updatePlayer({ character: value });
      },
    },
    Team: {
      options: ['Blue', 'Red'] as Teams[],
      value: 'Blue' as Teams,
      onChange: value => socket.updatePlayer({ team: value }),
    },
    debug: {
      value: signals.isDebug.value,
      onChange: value => {
        signals.isDebug.value = value;
        if (value) {
          window.localStorage.setItem('debug', 'true');
          return;
        }
        window.localStorage.removeItem('debug');
      },
    },
    'Reset Scores': button(() => void socket.resetScore()),
  });
  return <Leva collapsed />;
}
