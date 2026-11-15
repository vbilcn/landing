'use client';

import React, { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';

/* ── Error boundary: hide the canvas silently if WebGL fails ─────────────── */
class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * SceneShell — lazy, off-screen-paused WebGL canvas in the shared
 * minimalist "clay studio" lighting setup (no remote HDR assets).
 */
export function SceneShell({
  children,
  className,
  camera = [3.4, 2.4, 4.8],
  fov = 33,
  lookAt = [0, 1.1, 0],
  shadowScale = 10,
}: {
  children: React.ReactNode;
  className?: string;
  camera?: [number, number, number];
  fov?: number;
  lookAt?: [number, number, number];
  shadowScale?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false); // first time scrolled into view → mount
  const [visible, setVisible] = useState(false); // current visibility → frameloop

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { rootMargin: '160px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={className} aria-hidden>
      {seen && (
        <GLBoundary>
          <Canvas
            className="canvas-fade"
            dpr={[1, 1.75]}
            frameloop={visible ? 'always' : 'never'}
            camera={{ position: camera, fov }}
            gl={{ alpha: true, antialias: true }}
            onCreated={({ gl, camera: cam }) => {
              gl.setClearAlpha(0);
              cam.lookAt(...lookAt);
            }}
          >
            <ambientLight intensity={1.15} />
            <directionalLight position={[5, 7, 4]} intensity={1.7} />
            <directionalLight position={[-6, 4, -4]} intensity={0.55} />
            <Suspense fallback={null}>{children}</Suspense>
            <ContactShadows
              position={[0, 0, 0]}
              opacity={0.16}
              scale={shadowScale}
              blur={2.6}
              far={6}
              resolution={256}
              color="#1d1d1f"
            />
          </Canvas>
        </GLBoundary>
      )}
    </div>
  );
}
