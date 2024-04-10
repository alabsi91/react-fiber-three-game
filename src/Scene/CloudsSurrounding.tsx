import { Cloud, Clouds } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';

export default function CloudsSurrounding() {
  return (
    <>
      <Clouds material={MeshStandardMaterial} position={[40, 0, 40]} frustumCulled={false}>
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} rotation={[0, -Math.PI / 2, 0]} position={[0, 0, 0]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} rotation={[0, -Math.PI / 2, 0]} position={[0, 0, -20]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} rotation={[0, -Math.PI / 2, 0]} position={[0, 0, -40]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} rotation={[0, -Math.PI / 2, 0]} position={[0, 0, -60]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} rotation={[0, -Math.PI / 2, 0]} position={[0, 0, -80]} />
      </Clouds>

      <Clouds material={MeshStandardMaterial} position={[-40, 0, 40]} frustumCulled={false}>
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} position={[0, 0, 0]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} position={[20, 0, 0]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} position={[40, 0, 0]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} position={[60, 0, 0]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} position={[80, 0, 0]} />
      </Clouds>

      <Clouds material={MeshStandardMaterial} position={[-40, 0, -40]} frustumCulled={false}>
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} rotation={[0, -Math.PI / 2, 0]} position={[0, 0, 0]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} rotation={[0, -Math.PI / 2, 0]} position={[0, 0, 20]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} rotation={[0, -Math.PI / 2, 0]} position={[0, 0, 40]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} rotation={[0, -Math.PI / 2, 0]} position={[0, 0, 60]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} rotation={[0, -Math.PI / 2, 0]} position={[0, 0, 80]} />
      </Clouds>

      <Clouds material={MeshStandardMaterial} position={[-40, 0, -40]} frustumCulled={false}>
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} position={[0, 0, 0]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} position={[20, 0, 0]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} position={[40, 0, 0]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} position={[60, 0, 0]} />
        <Cloud segments={40} bounds={[10, 2, 2]} volume={10} position={[80, 0, 0]} />
      </Clouds>
    </>
  );
}
