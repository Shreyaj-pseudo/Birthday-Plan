import { Component, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { birthday, type Slice } from './content';

const angle = Math.PI * 2 / 9;
function wedge(radius: number, height: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(radius * Math.cos(-angle / 2 + .009), radius * Math.sin(-angle / 2 + .009));
  shape.absarc(0, 0, radius, -angle / 2 + .009, angle / 2 - .009, false);
  shape.lineTo(0, 0);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .025, bevelThickness: .02, curveSegments: 32 });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}
function SliceMesh({ slice, index, selected, hovered, onHover, onSelect, reduced, drag }: { slice: Slice; index: number; selected: boolean; hovered: boolean; onHover: (id: string | null) => void; onSelect: (id: string) => void; reduced: boolean; drag: React.RefObject<{ moved: boolean }> }) {
  const group = useRef<THREE.Group>(null);
  const sponge = useMemo(() => wedge(2.02, .25), []);
  const cream = useMemo(() => wedge(2.025, .09), []);
  const top = useMemo(() => wedge(2.04, .12), []);
  useEffect(() => () => { sponge.dispose(); cream.dispose(); top.dispose(); }, [sponge, cream, top]);
  const a = index * angle;
  useFrame((_, delta) => {
    if (!group.current) return;
    const amount = selected ? .48 : hovered ? .1 : 0;
    const target = new THREE.Vector3(Math.cos(a) * amount, selected ? .09 : hovered ? .1 : 0, -Math.sin(a) * amount);
    group.current.position.lerp(target, reduced ? 1 : 1 - Math.exp(-delta * 12));
  });
  const ap = slice.appearance;
  const stop = (event: ThreeEvent<PointerEvent>) => { event.stopPropagation(); onHover(slice.id); };
  return <group ref={group} rotation={[0, a, 0]} onPointerOver={stop} onPointerOut={() => onHover(null)} onClick={e => { e.stopPropagation(); if (!drag.current.moved) onSelect(slice.id); }}>
    {[.2, .55, .9].map(y => <mesh key={y} geometry={sponge} position={[0,y,0]} castShadow receiveShadow><meshStandardMaterial color={ap.sponge} roughness={.94}/></mesh>)}
    {[.46,.81].map(y => <mesh key={y} geometry={cream} position={[0,y,0]} castShadow><meshStandardMaterial color={ap.filling} roughness={.8}/></mesh>)}
    <mesh geometry={top} position={[0,1.16,0]} castShadow receiveShadow><meshStandardMaterial color={ap.frosting} roughness={.68}/></mesh>
    {[0,1,2,3,4].map(i => <mesh key={`cream${i}`} position={[1.78,1.31,(i-2)*.19]} scale={[.13,.13,.12]} castShadow><sphereGeometry args={[1,12,10]}/><meshStandardMaterial color={ap.frosting} roughness={.7}/></mesh>)}
    {Array.from({length: ap.topping === 'nuts' ? 13 : 6}, (_, i) => {
      const x = .8 + (i % 3) * .3; const z = (Math.floor(i / 3) - (ap.topping === 'nuts' ? 2 : .5)) * .13;
      return <mesh key={i} position={[x,1.34,z]} rotation={[i*.4,i*1.7,i*.6]} scale={ap.topping === 'berries' ? [.12,.105,.12] : ap.topping === 'chocolate' ? [.18,.035,.1] : ap.topping === 'lemon' ? [.12,.035,.19] : [.085,.045,.065]} castShadow>
        {ap.topping === 'chocolate' ? <boxGeometry/> : <sphereGeometry args={[1,ap.topping === 'nuts' ? 5 : 12,8]}/>}<meshStandardMaterial color={ap.accent} roughness={.66}/>
      </mesh>;
    })}
    {Array.from({length: 26}, (_,i) => <mesh key={`crumb${i}`} position={[.35 + ((i*17)%15)*.105, 1.289, (((i*7)%11)-5)*.045]} scale={[.016,.009,.013]}><icosahedronGeometry args={[1,0]}/><meshStandardMaterial color={ap.sponge} roughness={1}/></mesh>)}
  </group>;
}
class SceneBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {failed: boolean}> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export default function Cake({ selected, onSelect, reduced }: { selected: string | null; onSelect: (id: string) => void; reduced: boolean }) {
  const [webgl] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2');
      if (!context) return false;
      context.getExtension('WEBGL_lose_context')?.loseContext();
      return true;
    } catch { return false; }
  });
  const [hovered,setHovered] = useState<string | null>(null);
  const [rotation,setRotation] = useState(-.28);
  const drag = useRef({ start: 0, previous: 0, down: false, moved: false });
  const fallback = <div className="scene-fallback"><span>✧</span><p>Your nine slices are waiting below.</p><small>Choose a flavor to open its message.</small></div>;
  const current = birthday.slices.find(s => s.id === hovered);
  return <div className="cake-stage">
    <div className="canvas-wrap" onPointerDown={e => { drag.current = {start:e.clientX,previous:e.clientX,down:true,moved:false}; }} onPointerMove={e => { const d = drag.current; if (d.down) { if (Math.abs(e.clientX-d.start)>6) d.moved=true; if(d.moved) setRotation(r => r+(e.clientX-d.previous)*.008); d.previous=e.clientX; } }} onPointerUp={() => { drag.current.down=false; }} onPointerLeave={() => { drag.current.down=false; setHovered(null); }}>
      {!webgl ? fallback : <SceneBoundary fallback={fallback}><Canvas shadows dpr={[1,1.75]} camera={{position:[0,5.3,7.5],fov:37}} fallback={fallback} onCreated={({camera}) => camera.lookAt(0,.4,0)}>
        <color attach="background" args={['#f5f0e7']}/><ambientLight intensity={1.3}/><hemisphereLight args={['#fff5e5','#aa8b74',1.1]}/>
        <directionalLight position={[-3,7,4]} intensity={3} castShadow shadow-mapSize={[2048,2048]} shadow-normalBias={.03}/><directionalLight position={[4,3,-2]} intensity={1}/>
        <group rotation={[0,rotation,0]}>
          <mesh position={[0,.08,0]} receiveShadow castShadow><cylinderGeometry args={[2.48,2.36,.15,96]}/><meshStandardMaterial color="#e7dfd2" roughness={.38}/></mesh>
          <mesh rotation={[Math.PI/2,0,0]} position={[0,.16,0]}><torusGeometry args={[2.35,.035,12,96]}/><meshStandardMaterial color="#d1bc93" metalness={.3} roughness={.5}/></mesh>
          {birthday.slices.map((s,i) => <SliceMesh key={s.id} slice={s} index={i} selected={selected===s.id} hovered={hovered===s.id} onHover={setHovered} onSelect={onSelect} reduced={reduced} drag={drag}/>)}
        </group>
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.035,0]} receiveShadow><planeGeometry args={[200,200]}/><shadowMaterial transparent opacity={.12}/></mesh>
      </Canvas></SceneBoundary>}
    </div>
    <div className="hover-label" aria-live="polite">{current ? <><strong>{current.flavor}</strong><span>chosen by {current.friend}</span></> : <><strong>Nine little pieces of love.</strong><span>Pick the one that speaks to you.</span></>}</div>
    <div className="stage-tools"><span>↔ &nbsp; Drag to turn · Click a slice to discover</span><button className="text-button" onClick={() => setRotation(-.28)}>↺ Reset view</button></div>
  </div>;
}
