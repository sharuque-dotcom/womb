"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.12 + aPhase) * 0.4 + mod(uTime * 0.05 + aPhase * 3.0, 8.0) - 4.0;
    p.x += sin(uTime * 0.09 + aPhase * 2.0) * 0.3;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;
    gl_PointSize = aSize * 130.0 / dist;
    vAlpha = smoothstep(14.0, 3.5, dist) * (0.35 + 0.65 * fract(aPhase * 7.31));
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.15, d) * vAlpha * 0.5;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(1.0, 0.75, 0.6), a);
  }
`;

export default function AmnioticParticles({
  count = 2600,
  inFront = false,
}: {
  count?: number;
  inFront?: boolean;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // shell around the baby: keep a hollow core so motes don't cross the face
      const r = (inFront ? 1.6 : 2.2) + Math.random() * (inFront ? 2.2 : 8);
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
      positions[i * 3 + 1] = (r * Math.cos(ph)) * 0.8;
      positions[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) + (inFront ? 1.5 : 0);
      sizes[i] = 0.010 + Math.random() * (inFront ? 0.05 : 0.03);
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, sizes, phases };
  }, [count, inFront]);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <points frustumCulled={false} renderOrder={inFront ? 20 : 5}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
