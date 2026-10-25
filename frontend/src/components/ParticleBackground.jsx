import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 500 }) {
  const mesh = useRef();
  const light = useRef();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;

      // Cyan to violet gradient colors
      const color = new THREE.Color();
      if (Math.random() > 0.5) {
        color.setHex(0x22d3ee); // Cyan
      } else {
        color.setHex(0xa78bfa); // Violet
      }
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.y = time * 0.05;
    mesh.current.rotation.x = time * 0.02;

    // Gentle floating animation
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      mesh.current.geometry.attributes.position.array[i3 + 1] += Math.sin(time + i) * 0.002;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <pointLight ref={light} position={[10, 10, 10]} intensity={1} color="#22d3ee" />
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={particles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </>
  );
}

export default function ParticleBackground() {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      pointerEvents: 'none',
      opacity: 0.4
    }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <Particles count={400} />
      </Canvas>
    </div>
  );
}
