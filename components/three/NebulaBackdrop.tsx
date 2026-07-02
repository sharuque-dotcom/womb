"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const vertexShader = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec3 vPos;
  uniform float uTime;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec3(1.7, 9.2, 4.1);
      a *= 0.55;
    }
    return v;
  }

  void main() {
    vec3 d = normalize(vPos);
    float t = uTime * 0.02;

    // layered drifting tissue / nebula
    float n1 = fbm(d * 2.2 + vec3(t, -t * 0.6, t * 0.3));
    float n2 = fbm(d * 5.0 - vec3(t * 0.8, t * 0.4, -t));
    float veins = smoothstep(0.45, 0.62, fbm(d * 8.0 + n1 * 1.5));

    vec3 deep = vec3(0.035, 0.006, 0.022);      // near-black plum
    vec3 flesh = vec3(0.24, 0.045, 0.085);      // deep crimson
    vec3 warm = vec3(0.45, 0.13, 0.10);         // ember warmth

    vec3 col = mix(deep, flesh, smoothstep(0.3, 0.75, n1));
    col = mix(col, warm, smoothstep(0.55, 0.9, n2) * 0.55);
    col += vec3(0.35, 0.08, 0.10) * veins * 0.18;

    // warm god-light from upper left
    float glow = pow(clamp(dot(d, normalize(vec3(-0.5, 0.65, 0.35))), 0.0, 1.0), 3.0);
    col += vec3(0.50, 0.22, 0.12) * glow * 0.5;

    // sink the bottom into darkness
    col *= smoothstep(-1.1, 0.15, d.y) * 0.85 + 0.15;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function NebulaBackdrop() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });
  return (
    <mesh renderOrder={0}>
      <sphereGeometry args={[30, 48, 32]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
