import { forwardRef } from 'react';
import { Group } from 'three';
import Amy from './Amy';
import Erika from './Erika';
import Jolleen from './Jolleen';
import Lola from './Lola';
import Maria from './Maria';
import Vanguard from './Vanguard';

export type Characters = keyof typeof CharactersObject;

const CharactersObject = {
  Amy,
  Maria,
  Vanguard,
  Erika,
  Jolleen,
  Lola,
};

const Characters = forwardRef<Group, JSX.IntrinsicElements['group'] & { characterName: Characters }>((props, ref) => {
  const Character = CharactersObject[props.characterName];
  return <Character {...props} ref={ref} />;
});

export default Characters;
