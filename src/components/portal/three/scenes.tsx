'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { SceneShell } from './SceneShell';
import { AMBER, Bone, CLAY, CLAY_MID, FlowParticles, GREEN, GREEN_SOFT, INK, RiseParticles, Spin } from './common';

/* ══════════════════════════════════════════════════════════════════════════
   1. HERO — abstract plant: PEM stack + reactor column + H2 line + CH₄ molecule
   ══════════════════════════════════════════════════════════════════════════ */

const H2_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-1.2, 1.02, 0.14),
  new THREE.Vector3(-0.5, 1.34, 0.34),
  new THREE.Vector3(0.15, 1.52, 0.06),
  new THREE.Vector3(0.58, 1.58, 0.0),
]);

// tetrahedral unit directions for CH₄
const TETRA: [number, number, number][] = [
  [0.577, 0.577, 0.577],
  [0.577, -0.577, -0.577],
  [-0.577, 0.577, -0.577],
  [-0.577, -0.577, 0.577],
];

function MethaneMolecule() {
  const bonds = useMemo(
    () => TETRA.map(([x, y, z]) => ({ to: [x * 0.52, y * 0.52, z * 0.52] as [number, number, number] })),
    [],
  );
  return (
    <Float speed={1.4} rotationIntensity={0.55} floatIntensity={1.1}>
      <group>
        {/* carbon */}
        <mesh>
          <sphereGeometry args={[0.23, 32, 32]} />
          <meshStandardMaterial color={INK} roughness={0.32} metalness={0.15} />
        </mesh>
        {/* bonds */}
        {bonds.map((b, i) => (
          <Bone key={i} from={[0, 0, 0]} to={b.to} radius={0.035} color={CLAY_MID} />
        ))}
        {/* hydrogens */}
        {bonds.map((b, i) => (
          <mesh key={`h${i}`} position={b.to}>
            <sphereGeometry args={[0.135, 24, 24]} />
            <meshStandardMaterial color={CLAY} roughness={0.5} metalness={0.04} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function HeroContent() {
  return (
    <group>
      {/* electrolyzer stack */}
      <group position={[-1.2, 0, 0]}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[0, 0.16 + i * 0.17, 0]}>
            <boxGeometry args={[1.1, 0.1, 0.78]} />
            <meshStandardMaterial
              color={i === 2 ? GREEN : i % 2 === 0 ? CLAY : CLAY_MID}
              roughness={0.55}
              metalness={0.05}
            />
          </mesh>
        ))}
        {/* tie rods */}
        {[
          [-0.42, 0.28],
          [0.42, 0.28],
          [-0.42, -0.28],
          [0.42, -0.28],
        ].map(([x, z], i) => (
          <mesh key={`r${i}`} position={[x, 0.55, z]}>
            <cylinderGeometry args={[0.028, 0.028, 1.12, 10]} />
            <meshStandardMaterial color={INK} roughness={0.4} metalness={0.15} />
          </mesh>
        ))}
      </group>

      {/* H2 line */}
      <mesh>
        <tubeGeometry args={[H2_CURVE, 48, 0.048, 12, false]} />
        <meshStandardMaterial color={INK} roughness={0.38} metalness={0.12} />
      </mesh>
      <FlowParticles curve={H2_CURVE} count={5} radius={0.055} color={GREEN_SOFT} speed={0.08} />

      {/* reactor column */}
      <group position={[1.15, 0, 0]}>
        <mesh position={[0, 1.15, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 2.3, 40]} />
          <meshStandardMaterial color={CLAY} roughness={0.58} metalness={0.05} />
        </mesh>
        <mesh position={[0, 2.32, 0]}>
          <sphereGeometry args={[0.52, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={CLAY} roughness={0.58} metalness={0.05} />
        </mesh>
        {/* flanges */}
        {[0.4, 1.72].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.525, 0.05, 12, 40]} />
            <meshStandardMaterial color={INK} roughness={0.4} metalness={0.15} />
          </mesh>
        ))}
        {/* accent band */}
        <mesh position={[0, 1.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.53, 0.028, 10, 40]} />
          <meshStandardMaterial color={GREEN} roughness={0.4} metalness={0.1} />
        </mesh>
        {/* top valve stem */}
        <mesh position={[0, 2.62, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.34, 12]} />
          <meshStandardMaterial color={INK} roughness={0.4} metalness={0.15} />
        </mesh>
        <mesh position={[0, 2.82, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={GREEN} roughness={0.35} metalness={0.1} />
        </mesh>
      </group>

      <group position={[0, 2.62, 0]}>
        <MethaneMolecule />
      </group>
    </group>
  );
}

export function HeroArt({ className }: { className?: string }) {
  return (
    <SceneShell className={className} camera={[3.7, 2.7, 5.1]} fov={32} lookAt={[0, 1.45, 0]} shadowScale={11}>
      <Spin speed={0.16}>
        <HeroContent />
      </Spin>
    </SceneShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   2. PIPELINE — glowing H2 line with flowing molecules
   ══════════════════════════════════════════════════════════════════════════ */

const PIPE_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-2.35, 0.72, 0.05),
  new THREE.Vector3(-1.15, 0.94, 0.3),
  new THREE.Vector3(0.1, 0.62, -0.22),
  new THREE.Vector3(1.3, 0.84, 0.18),
  new THREE.Vector3(2.35, 0.72, -0.05),
]);

const COLLAR_T: number[] = [0.16, 0.5, 0.84];

function PipelineContent() {
  const collars = useMemo(
    () =>
      COLLAR_T.map((t) => {
        const a = PIPE_CURVE.getPointAt(Math.max(0, t - 0.012));
        const b = PIPE_CURVE.getPointAt(Math.min(1, t + 0.012));
        return { a: [a.x, a.y, a.z] as [number, number, number], b: [b.x, b.y, b.z] as [number, number, number] };
      }),
    [],
  );
  const supports = useMemo(
    () =>
      [0.3, 0.62, 0.94].map((t) => {
        const p = PIPE_CURVE.getPointAt(t);
        return [p.x, p.y, p.z] as [number, number, number];
      }),
    [],
  );
  return (
    <group>
      <mesh>
        <tubeGeometry args={[PIPE_CURVE, 72, 0.155, 16, false]} />
        <meshStandardMaterial color={CLAY} roughness={0.5} metalness={0.08} />
      </mesh>
      {/* collars */}
      {collars.map((c, i) => (
        <Bone key={i} from={c.a} to={c.b} radius={0.185} color={INK} />
      ))}
      {/* supports */}
      {supports.map(([x, y, z], i) => (
        <mesh key={`s${i}`} position={[x, (y - 0.155) / 2, z]}>
          <boxGeometry args={[0.16, Math.max(0.05, y - 0.155), 0.3]} />
          <meshStandardMaterial color={CLAY_MID} roughness={0.6} />
        </mesh>
      ))}
      <FlowParticles curve={PIPE_CURVE} count={7} radius={0.085} color={GREEN_SOFT} speed={0.055} />
    </group>
  );
}

export function PipelineArt({ className }: { className?: string }) {
  return (
    <SceneShell className={className} camera={[0.4, 2.1, 4.4]} fov={30} lookAt={[0, 0.72, 0]} shadowScale={13}>
      <PipelineContent />
    </SceneShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   3. ELECTROLYZER — plate stack with rising H2 bubbles
   ══════════════════════════════════════════════════════════════════════════ */

function ElectrolyzerContent() {
  const plates = 7;
  const gap = 0.235;
  const topY = 0.18 + (plates - 1) * gap;
  return (
    <group position={[0, 0, 0]}>
      {Array.from({ length: plates }, (_, i) => (
        <mesh key={i} position={[0, 0.18 + i * gap, 0]}>
          <boxGeometry args={[1.7, 0.1, 1.05]} />
          <meshStandardMaterial
            color={i === 3 ? GREEN : i % 2 === 0 ? CLAY : CLAY_MID}
            roughness={0.52}
            metalness={0.06}
          />
        </mesh>
      ))}
      {/* corner tie rods */}
      {[
        [-0.72, 0.4],
        [0.72, 0.4],
        [-0.72, -0.4],
        [0.72, -0.4],
      ].map(([x, z], i) => (
        <mesh key={`r${i}`} position={[x, (0.18 + topY) / 2, z]}>
          <cylinderGeometry args={[0.032, 0.032, topY + 0.24, 10]} />
          <meshStandardMaterial color={INK} roughness={0.4} metalness={0.15} />
        </mesh>
      ))}
      {/* top manifold */}
      <mesh position={[0, topY + 0.22, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.26, 14]} />
        <meshStandardMaterial color={INK} roughness={0.4} metalness={0.12} />
      </mesh>
      <mesh position={[0, topY + 0.42, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color={GREEN} roughness={0.35} metalness={0.1} />
      </mesh>
      <RiseParticles count={10} halfX={0.6} halfZ={0.38} y0={0.3} y1={topY - 0.05} radius={0.042} speed={0.2} />
    </group>
  );
}

export function ElectrolyzerArt({ className }: { className?: string }) {
  return (
    <SceneShell className={className} camera={[2.9, 2.2, 4.0]} fov={30} lookAt={[0, 1.12, 0]} shadowScale={9}>
      <Spin speed={0.18}>
        <ElectrolyzerContent />
      </Spin>
    </SceneShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   4. REACTOR — multi-tubular Sabatier vessel
   ══════════════════════════════════════════════════════════════════════════ */

function ReactorContent() {
  const tubeR = 0.3;
  return (
    <group>
      {/* vessel */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 1.9, 40]} />
        <meshStandardMaterial color={CLAY} roughness={0.55} metalness={0.06} />
      </mesh>
      {/* caps */}
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.62, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={CLAY} roughness={0.55} metalness={0.06} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.62, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color={CLAY} roughness={0.55} metalness={0.06} />
      </mesh>
      {/* top plate + tube bundle (heat exchanger) */}
      <mesh position={[0, 2.08, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.07, 32]} />
        <meshStandardMaterial color={CLAY_MID} roughness={0.5} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const x = Math.cos(a) * tubeR;
        const z = Math.sin(a) * tubeR;
        return (
          <group key={i}>
            <mesh position={[x, 2.48, z]}>
              <cylinderGeometry args={[0.085, 0.085, 0.78, 14]} />
              <meshStandardMaterial color={INK} roughness={0.4} metalness={0.15} />
            </mesh>
            <mesh position={[x, 2.9, z]}>
              <sphereGeometry args={[0.088, 14, 14]} />
              <meshStandardMaterial color={i === 0 ? GREEN : INK} roughness={0.35} metalness={0.12} />
            </mesh>
          </group>
        );
      })}
      {/* flanges */}
      {[0.55, 1.5].map((y, i) => (
        <mesh key={`f${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.625, 0.05, 12, 40]} />
          <meshStandardMaterial color={INK} roughness={0.4} metalness={0.15} />
        </mesh>
      ))}
      {/* accent band */}
      <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.63, 0.03, 10, 40]} />
        <meshStandardMaterial color={GREEN} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* nozzles */}
      <mesh position={[0.78, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.36, 14]} />
        <meshStandardMaterial color={INK} roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[-0.78, 1.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.36, 14]} />
        <meshStandardMaterial color={INK} roughness={0.4} metalness={0.15} />
      </mesh>
      {/* steam wisps (heat integration) */}
      <RiseParticles count={5} halfX={0.14} halfZ={0.14} y0={3.0} y1={3.55} radius={0.05} color={AMBER} speed={0.14} />
    </group>
  );
}

export function ReactorArt({ className }: { className?: string }) {
  return (
    <SceneShell className={className} camera={[3.4, 2.5, 4.7]} fov={30} lookAt={[0, 1.6, 0]} shadowScale={9}>
      <Spin speed={0.2}>
        <ReactorContent />
      </Spin>
    </SceneShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   5. CATALYST — Ni/Al₂O₃ crystal lattice
   ══════════════════════════════════════════════════════════════════════════ */

const SP = 0.46; // lattice spacing
const N = 3; // 3×3×3 grid
const ACCENT_NODES = new Set(['1-1-1', '0-0-2', '2-0-0']);

function CatalystContent() {
  const nodes = useMemo(() => {
    const arr: { key: string; p: [number, number, number]; accent: boolean }[] = [];
    for (let x = 0; x < N; x++)
      for (let y = 0; y < N; y++)
        for (let z = 0; z < N; z++) {
          const key = `${x}-${y}-${z}`;
          arr.push({
            key,
            p: [(x - 1) * SP, (y - 1) * SP, (z - 1) * SP],
            accent: ACCENT_NODES.has(key),
          });
        }
    return arr;
  }, []);

  const bonds = useMemo(() => {
    const arr: { a: [number, number, number]; b: [number, number, number] }[] = [];
    for (let x = 0; x < N; x++)
      for (let y = 0; y < N; y++)
        for (let z = 0; z < N; z++) {
          const p: [number, number, number] = [(x - 1) * SP, (y - 1) * SP, (z - 1) * SP];
          if (x < N - 1) arr.push({ a: p, b: [(x - 1 + 1) * SP, (y - 1) * SP, (z - 1) * SP] });
          if (y < N - 1) arr.push({ a: p, b: [(x - 1) * SP, (y - 1 + 1) * SP, (z - 1) * SP] });
          if (z < N - 1) arr.push({ a: p, b: [(x - 1) * SP, (y - 1) * SP, (z - 1 + 1) * SP] });
        }
    return arr;
  }, []);

  return (
    <group position={[0, 1.25, 0]}>
      {bonds.map((b, i) => (
        <Bone key={i} from={b.a} to={b.b} radius={0.022} color={CLAY_MID} />
      ))}
      {nodes.map((n) => (
        <mesh key={n.key} position={n.p}>
          <sphereGeometry args={[n.accent ? 0.13 : 0.115, 20, 20]} />
          <meshStandardMaterial color={n.accent ? GREEN : CLAY} roughness={0.42} metalness={n.accent ? 0.12 : 0.05} />
        </mesh>
      ))}
    </group>
  );
}

export function CatalystArt({ className }: { className?: string }) {
  return (
    <SceneShell className={className} camera={[2.5, 2.0, 3.3]} fov={30} lookAt={[0, 1.25, 0]} shadowScale={8}>
      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.5}>
        <Spin speed={0.24}>
          <CatalystContent />
        </Spin>
      </Float>
    </SceneShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   6. VAULT — secured digital data room
   ══════════════════════════════════════════════════════════════════════════ */

function VaultContent() {
  return (
    <group>
      {/* vault body */}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshStandardMaterial color={INK} roughness={0.35} metalness={0.18} />
      </mesh>
      {/* door panel */}
      <mesh position={[0, 0.62, 0.57]}>
        <boxGeometry args={[0.72, 0.72, 0.05]} />
        <meshStandardMaterial color={CLAY} roughness={0.5} metalness={0.05} />
      </mesh>
      {/* keyhole */}
      <mesh position={[0, 0.74, 0.615]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.075, 0.028, 10, 24]} />
        <meshStandardMaterial color={GREEN} roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.6, 0.615]}>
        <boxGeometry args={[0.055, 0.1, 0.03]} />
        <meshStandardMaterial color={GREEN} roughness={0.35} metalness={0.1} />
      </mesh>
      {/* orbiting accent ring */}
      <group position={[0, 0.62, 0]} rotation={[0.42, 0, 0.1]}>
        <Spin speed={0.5}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.98, 0.032, 12, 64]} />
            <meshStandardMaterial color={GREEN} roughness={0.4} metalness={0.1} />
          </mesh>
        </Spin>
      </group>
      {/* floating documents */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.2}>
        <group position={[1.35, 1.25, -0.2]} rotation={[0.12, 0.4, 0.05]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, i * 0.07, 0]} rotation={[0, i * 0.12, 0]}>
              <boxGeometry args={[0.5, 0.035, 0.68]} />
              <meshStandardMaterial color={i === 2 ? GREEN : CLAY} roughness={0.5} metalness={0.04} />
            </mesh>
          ))}
        </group>
      </Float>
    </group>
  );
}

export function VaultArt({ className }: { className?: string }) {
  return (
    <SceneShell className={className} camera={[3.0, 2.0, 4.2]} fov={30} lookAt={[0, 0.8, 0]} shadowScale={10}>
      <VaultContent />
    </SceneShell>
  );
}
