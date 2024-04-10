import { signals } from '../state';

export default function GuiScore() {
  const { Blue, Red } = signals.score.value;
  return (
    <div className='score-container'>
      <h1>
        <span style={{ color: 'blue' }}>{Blue}</span> <span className='score-separator'>Score</span> <span style={{ color: 'red' }}>{Red}</span>
      </h1>
    </div>
  );
}
