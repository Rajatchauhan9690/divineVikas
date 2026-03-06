import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Sphere,
  MeshDistortMaterial,
  Sparkles,
  Float,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const Core = () => {
  const groupRef = useRef();
  const auraRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.rotation.z = t * 0.05;

    const targetX = state.pointer.x * 0.3;
    const targetY = state.pointer.y * 0.3;
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      0.05,
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.05,
    );

    if (auraRef.current) {
      auraRef.current.distort = 0.2 + Math.sin(t * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[1.2, 32, 32]}>
          <MeshDistortMaterial
            color="#ea580c"
            emissive="#ea580c"
            emissiveIntensity={2}
            distort={0.4}
            speed={3}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>

        <Sphere args={[1.4, 24, 24]}>
          <MeshDistortMaterial
            color="#fde047"
            emissive="#fbbf24"
            emissiveIntensity={2}
            wireframe
            distort={0.5}
            speed={2}
          />
        </Sphere>

        <Sphere args={[1.6, 32, 32]}>
          <MeshDistortMaterial
            ref={auraRef}
            color="#f43f5e"
            emissive="#e11d48"
            emissiveIntensity={1.5}
            transparent
            opacity={0.2}
            distort={0.2}
            speed={1.5}
          />
        </Sphere>

        <Sparkles
          count={150}
          scale={5}
          size={4}
          speed={0.6}
          color="#fef08a"
          opacity={0.8}
        />
      </Float>
    </group>
  );
};

export default function EnergyCore() {
  return (
    <div className="absolute inset-0 w-full h-full cursor-crosshair z-10">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ powerPreference: "high-performance", antialias: false }}
        camera={{ position: [0, 0, 4.5], fov: 45 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={2}
          color="#f97316"
        />

        <Core />

        <EffectComposer disableNormalPass>
          {/* ✅ FIX: Removed the invalid resolution prop */}
          <Bloom
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            intensity={1.5}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
