import { Html, useProgress } from '@react-three/drei';

export default function GuiLoader() {
  const { progress } = useProgress();

  return (
    <Html wrapperClass='loader-wrapper' fullscreen prepend transform={false}>
      <div className='loader-container'>
        <h2>{Math.round(progress)}%</h2>
        <div className='loader-progress' style={{ background: `linear-gradient(to right, #fff ${progress}%, #000 ${progress}%)` }} />
      </div>
    </Html>
  );
}
