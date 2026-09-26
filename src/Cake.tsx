import { Component, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Cake as CakeIcon, ArrowCounterClockwise } from '@phosphor-icons/react';
import { birthday, type Slice } from './content';

const sector = Math.PI * 2 / 9;
const radius = 2.05;

function makeCrumbTexture() {
  const size = 96;
  const data = new Uint8Array(size * size);
  let seed = 18731;
  for (let i = 0; i < data.length; i++) {
    seed = (seed * 16807) % 2147483647;
    const grain = seed / 2147483647;
    data[i] = Math.round(92 + grain * 116);
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RedFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 4);
  texture.needsUpdate = true;
  return texture;
}

function wedge(index: number, depth: number, baseY: number) {
  const center = Math.PI / 2 - index * sector;
  const start = center - sector / 2 + .009;
  const end = center + sector / 2 - .009;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(radius * Math.cos(start), radius * Math.sin(start));
  shape.absarc(0, 0, radius, start, end, false);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 32,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: .015,
    bevelThickness: .014,
  });
  // Break the mathematically perfect cylinder with a tiny, deterministic
  // bakery-style ripple. Adjacent layers use absolute height, so their edges
  // still meet cleanly and never shimmer while the cake rotates.
  const position = geometry.getAttribute('position');
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const radial = Math.hypot(x, y);
    if (radial < radius * .94) continue;
    const angle = Math.atan2(y, x);
    const height = baseY + THREE.MathUtils.clamp(position.getZ(i), 0, depth);
    const ripple = .012 * Math.sin(angle * 19 + height * 7.4) + .005 * Math.sin(angle * 43 - height * 11.2);
    const scale = (radial + ripple) / radial;
    position.setXY(i, x * scale, y * scale);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  // Cap UVs sample the matching sector from the complete cake photograph.
  // Side walls use solid materials, so they remain crisp at every angle.
  const uv = geometry.getAttribute('uv');
  for (const group of geometry.groups) {
    for (let i = group.start; i < group.start + group.count; i++) {
      const u = uv.getX(i);
      const v = uv.getY(i);
      uv.setXY(i, .5 + u / 4.27, .5 + v / 4.27);
    }
  }
  uv.needsUpdate = true;
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function SliceMesh({ slice, index, active, hovered, onHover, onSelect, reduced, drag, photograph, crumb }: {
  slice: Slice;
  index: number;
  active: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  reduced: boolean;
  drag: React.RefObject<{ moved: boolean }>;
  photograph: THREE.Texture;
  crumb: THREE.Texture;
}) {
  const group = useRef<THREE.Group>(null);
  const sponge = useMemo(() => [wedge(index, .28, .16), wedge(index, .27, .51), wedge(index, .27, .85)], [index]);
  const filling = useMemo(() => [wedge(index, .07, .44), wedge(index, .07, .78)], [index]);
  const icing = useMemo(() => wedge(index, .115, 1.12), [index]);
  const spongeTones = useMemo(() => {
    const base = new THREE.Color(slice.appearance.sponge);
    return [base.clone().multiplyScalar(.83), base, base.clone().lerp(new THREE.Color('#e4c59d'), .08)];
  }, [slice.appearance.sponge]);
  useEffect(() => () => {
    sponge.forEach(layer => layer.dispose());
    filling.forEach(layer => layer.dispose());
    icing.dispose();
  }, [sponge, filling, icing]);

  const direction = Math.PI / 2 - index * sector;
  const sideCrumbs = useMemo(() => {
    let seed = (index + 1) * 7919;
    const random = () => {
      seed = (seed * 48271) % 2147483647;
      return seed / 2147483647;
    };
    const layers = [[.19, .42], [.54, .76], [.88, 1.1]] as const;
    return layers.flatMap(([bottom, top]) => Array.from({ length: 7 }, (_, crumbIndex) => {
      const angle = direction + (random() - .5) * sector * .78;
      const outward = radius + .012 + random() * .013;
      const scale = .006 + random() * .008;
      return {
        key: `${bottom}-${crumbIndex}`,
        position: [Math.cos(angle) * outward, bottom + random() * (top - bottom), -Math.sin(angle) * outward] as [number, number, number],
        scale: [scale * (1.1 + random()), scale, scale * (1.1 + random())] as [number, number, number],
      };
    }));
  }, [direction, index]);
  useFrame((_, delta) => {
    if (!group.current) return;
    const distance = active ? .58 : hovered ? .13 : 0;
    const x = Math.cos(direction) * distance;
    const z = -Math.sin(direction) * distance;
    const y = active ? .12 : hovered ? .055 : 0;
    const blend = reduced ? 1 : 1 - Math.exp(-delta * 10);
    group.current.position.x += (x - group.current.position.x) * blend;
    group.current.position.y += (y - group.current.position.y) * blend;
    group.current.position.z += (z - group.current.position.z) * blend;
  });

  const stop = (event: ThreeEvent<PointerEvent>) => { event.stopPropagation(); onHover(slice.id); };
  return <group ref={group} onPointerOver={stop} onPointerOut={() => onHover(null)} onClick={event => {
    event.stopPropagation();
    if (!drag.current.moved) onSelect(slice.id);
  }}>
    {sponge.map((geometry, layer) => <mesh key={`sponge-${layer}`} geometry={geometry} position={[0, [.16, .51, .85][layer], 0]} castShadow receiveShadow>
      <meshStandardMaterial attach="material-0" color={spongeTones[layer]} roughness={.92} />
      <meshStandardMaterial attach="material-1" color={spongeTones[layer]} roughness={.92} roughnessMap={crumb} bumpMap={crumb} bumpScale={.025} />
    </mesh>)}
    {filling.map((geometry, layer) => <mesh key={`filling-${layer}`} geometry={geometry} position={[0, [.44, .78][layer], 0]} castShadow receiveShadow>
      <meshStandardMaterial attach="material-0" color={slice.appearance.filling} roughness={.72} />
      <meshStandardMaterial attach="material-1" color={slice.appearance.filling} roughness={.72} roughnessMap={crumb} bumpMap={crumb} bumpScale={.009} />
    </mesh>)}
    {sideCrumbs.map(detail => <mesh key={detail.key} position={detail.position} scale={detail.scale} castShadow>
      <sphereGeometry args={[1, 5, 4]} />
      <meshStandardMaterial color={spongeTones[0]} roughness={1} />
    </mesh>)}
    <mesh geometry={icing} position={[0, 1.12, 0]} castShadow receiveShadow>
      <meshStandardMaterial attach="material-0" map={photograph} roughness={.65} bumpMap={photograph} bumpScale={.012} />
      <meshStandardMaterial attach="material-1" color={slice.appearance.frosting} roughness={.68} />
    </mesh>
  </group>;
}

function CakeScene({ selected, onSelect, reduced, drag, rotation, setHovered }: {
  selected: string | null;
  onSelect: (id: string) => void;
  reduced: boolean;
  drag: React.RefObject<{ moved: boolean }>;
  rotation: React.RefObject<number>;
  setHovered: (id: string | null) => void;
}) {
  const platter = useRef<THREE.Group>(null);
  const [hovered, setLocalHover] = useState<string | null>(null);
  const photo = useLoader(THREE.TextureLoader, '/images/cake-top.webp');
  const crumb = useMemo(makeCrumbTexture, []);
  useMemo(() => { photo.colorSpace = THREE.SRGBColorSpace; photo.anisotropy = 8; }, [photo]);
  useEffect(() => () => crumb.dispose(), [crumb]);
  function hover(id: string | null) { setLocalHover(id); setHovered(id); }
  useFrame(() => { if (platter.current) platter.current.rotation.y = rotation.current; });

  return <>
    <ambientLight intensity={.9} />
    <hemisphereLight args={['#fff0dc', '#261c1b', 1.4]} />
    <spotLight position={[-4, 8, 5]} angle={.7} penumbra={.7} intensity={130} color="#ffe1ac" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-.0001} />
    <directionalLight position={[5, 4, -3]} intensity={1.7} color="#b4bedb" />
    <group ref={platter}>
      <mesh position={[0, .055, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.49, 2.42, .11, 96]} />
        <meshStandardMaterial color="#292321" metalness={.18} roughness={.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, .115, 0]}>
        <torusGeometry args={[2.4, .027, 10, 96]} />
        <meshStandardMaterial color="#b59562" metalness={.65} roughness={.32} />
      </mesh>
      {birthday.slices.map((slice, index) => <SliceMesh
        key={slice.id} slice={slice} index={index} active={selected === slice.id} hovered={hovered === slice.id}
        onHover={hover} onSelect={onSelect} reduced={reduced} drag={drag} photograph={photo} crumb={crumb}
      />)}
    </group>
    <mesh position={[0, -.045, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <shadowMaterial transparent opacity={.38} />
    </mesh>
  </>;
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function Cake({ selected, onSelect, reduced }: {
  selected: string | null;
  onSelect: (id: string) => void;
  reduced: boolean;
}) {
  const [webgl] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2');
      if (!context) return false;
      context.getExtension('WEBGL_lose_context')?.loseContext();
      return true;
    } catch { return false; }
  });
  const [hovered, setHovered] = useState<string | null>(null);
  const rotation = useRef(0);
  const drag = useRef({ start: 0, previous: 0, down: false, moved: false });
  const current = birthday.slices.find(slice => slice.id === hovered);
  const fallback = <div className="scene-fallback"><CakeIcon size={54} weight="light" aria-hidden="true" /><p>Your cake is waiting.</p><span>Choose any flavor below to open its story.</span></div>;

  return <div className="cake-stage">
    <div className="canvas-wrap" onPointerDown={event => {
      drag.current = { start: event.clientX, previous: event.clientX, down: true, moved: false };
    }} onPointerMove={event => {
      const state = drag.current;
      if (!state.down) return;
      if (Math.abs(event.clientX - state.start) > 6) state.moved = true;
      if (state.moved) rotation.current += (event.clientX - state.previous) * .007;
      state.previous = event.clientX;
    }} onPointerUp={() => { drag.current.down = false; }} onPointerCancel={() => { drag.current.down = false; }} onPointerLeave={() => {
      drag.current.down = false;
      setHovered(null);
    }}>
      {!webgl ? fallback : <SceneBoundary fallback={fallback}><Canvas shadows gl={{ alpha: true, antialias: true }} dpr={[1, 1.6]}
        camera={{ position: [0, 4.5, 7.4], fov: 32 }} onCreated={({ camera }) => camera.lookAt(0, .55, 0)}>
        <CakeScene selected={selected} onSelect={onSelect} reduced={reduced} drag={drag} rotation={rotation} setHovered={setHovered} />
      </Canvas></SceneBoundary>}
    </div>
    <div className="cake-caption" aria-live="polite">
      {current ? <><strong>{current.flavor}</strong><span>Open this slice to reveal its story.</span></> : <><strong>Every slice has a story.</strong><span>Pick the one that catches your eye.</span></>}
    </div>
    <button className="reset-view" onClick={() => { rotation.current = 0; }}><ArrowCounterClockwise size={17} aria-hidden="true" /> Reset view</button>
  </div>;
}
