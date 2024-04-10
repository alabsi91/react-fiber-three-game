import { ChromaticAberration, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';

export default function PostProcessing() {
  return (
    <EffectComposer enableNormalPass>
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.001, 0.001)}
        modulationOffset={0.01}
        radialModulation
      />
      <ToneMapping
        blendFunction={BlendFunction.NORMAL}
        adaptive={true}
        resolution={512}
        middleGrey={4}
        maxLuminance={16.0}
        averageLuminance={2.0}
        adaptationRate={1.0}
      />
    </EffectComposer>
  );
}
