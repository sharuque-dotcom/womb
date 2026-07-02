"use client";

import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import FetusRaymarch from "./FetusRaymarch";
import NebulaBackdrop from "./NebulaBackdrop";
import AmnioticParticles from "./AmnioticParticles";

/** Slow cinematic drift + pointer parallax. */
function CameraRig({ week }: { week: number }) {
  const { camera, pointer, size } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // dolly out as the baby grows; back off further on narrow screens
    const aspect = size.width / size.height;
    const fit = aspect < 1 ? Math.pow(1 / aspect, 0.55) : 1;
    const dist = (3.0 + (week / 40) * 2.3) * fit;
    const orbit = Math.sin(t * 0.05) * 0.35;
    target.current.set(
      Math.sin(orbit) * dist + pointer.x * 0.35,
      0.12 + Math.sin(t * 0.07) * 0.12 + pointer.y * 0.25,
      Math.cos(orbit) * dist
    );
    camera.position.lerp(target.current, 0.025);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function WombCanvas({
  week,
  heartRate,
}: {
  week: number;
  heartRate: number;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.1, 3], fov: 42, near: 0.1, far: 80 }}
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <NebulaBackdrop />
        <AmnioticParticles count={2400} />
        <FetusRaymarch week={week} heartRate={heartRate} />
        <AmnioticParticles count={280} inFront />
        <CameraRig week={week} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.75} luminanceThreshold={0.32} luminanceSmoothing={0.28} mipmapBlur />
          <Vignette eskil={false} offset={0.18} darkness={0.86} />
          <Noise opacity={0.045} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
