'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/* ── Minimalist 3D palette (matches the light UI theme) ─────────────────── */
export const CLAY = '#ececef'; // light cool grey
export const CLAY_MID = '#dedee1'; // mid grey
export const INK = '#1d1d1f'; // graphite
export const GREEN = '#0071e3'; // Apple blue accent
export const GREEN_SOFT = '#74b6f2'; // particles
export const AMBER = '#d97706'; // steam / heat only

type Vec = [number, number, number];

/* ── Bone: thin cylinder spanning two points (bonds, rods, collars) ─────── */
export function Bone({
  from,
  to,
  radius = 0.03,
  color = CLAY_MID,
}: {
  from: Vec;
  to: Vec;
  radius?: number;
  color?: string;
}) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const dir = b.clone().sub(a);
  const len = Math.max(dir.length(), 1e-4);
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  const mid = a.clone().add(b).multiplyScalar(0.5);
  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[radius, radius, len, 12]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.06} />
    </mesh>
  );
}

/* ── Spin: slow constant rotation of a group ────────────────────────────── */
export function Spin({
  children,
  speed = 0.22,
}: {
  children: React.ReactNode;
  speed?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });
  return <group ref={ref}>{children}</group>;
}

/* ── FlowParticles: small spheres travelling along a curve ──────────────── */
export function FlowParticles({
  curve,
  count = 6,
  radius = 0.05,
  color = GREEN_SOFT,
  speed = 0.09,
}: {
  curve: THREE.CatmullRomCurve3;
  count?: number;
  radius?: number;
  color?: string;
  speed?: number;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const u = (t * speed + i / count) % 1;
      curve.getPointAt(u, m.position);
    });
  });
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[radius, 12, 12]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
        </mesh>
      ))}
    </>
  );
}

/* ── RiseParticles: bubbles floating upward inside a box region ─────────── */
export function RiseParticles({
  count = 9,
  radius = 0.045,
  color = GREEN_SOFT,
  speed = 0.22,
  halfX = 0.55,
  halfZ = 0.35,
  y0 = 0.2,
  y1 = 1.8,
}: {
  count?: number;
  radius?: number;
  color?: string;
  speed?: number;
  halfX?: number;
  halfZ?: number;
  y0?: number;
  y1?: number;
}) {
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 2 * halfX,
        z: (Math.random() - 0.5) * 2 * halfZ,
        u: Math.random(),
        s: 0.6 + Math.random() * 0.8,
      })),
    [count, halfX, halfZ],
  );
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((_, delta) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const s = seeds[i % seeds.length];
      s.u += delta * speed * s.s;
      if (s.u > 1) s.u -= 1;
      m.position.set(s.x, y0 + s.u * (y1 - y0), s.z);
    });
  });
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[radius, 10, 10]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
      ))}
    </>
  );
}
