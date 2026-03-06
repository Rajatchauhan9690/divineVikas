import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";

const count = 150; // Number of floating geometries
const tunnelDepth = 250; // How deep the tunnel goes

// ✅ FIX: We generate the random particles OUTSIDE the component.
// This prevents React's strict compiler from flagging impure functions during render,
// and ensures the geometries never randomly change positions if the component re-renders.
const particles = Array.from({ length: count }, () => {
  const theta = Math.random() * Math.PI * 2;
  const radius = 6 + Math.random() * 10; // Keep the center hollow for the camera

  return {
    x: Math.cos(theta) * radius,
    y: Math.sin(theta) * radius,
    z: Math.random() * -tunnelDepth,
    rx: Math.random() * Math.PI,
    ry: Math.random() * Math.PI,
    rz: Math.random() * Math.PI,
    scale: 0.5 + Math.random() * 1.5,
    rotationSpeed: 0.005 + Math.random() * 0.015,
  };
});

export default function AkashicTunnel() {
  const meshRef = useRef();
  const scroll = useScroll(); // Hijacks the scroll wheel progress (0 to 1)

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    // scroll.offset goes from 0 (top of page) to 1 (bottom of page)
    const offset = scroll.offset;

    // 1. Move the entire tunnel toward the camera based on scroll
    meshRef.current.position.z = offset * (tunnelDepth * 0.85);

    // 2. Twist the entire tunnel as you fly through it
    meshRef.current.rotation.z = offset * Math.PI;

    // 3. Organically rotate the individual geometries
    particles.forEach((p, i) => {
      p.rx += p.rotationSpeed;
      p.ry += p.rotationSpeed;

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rx, p.ry, p.rz);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    // InstancedMesh renders 350 complex objects using only 1 draw call (Elite Performance)
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#f97316"
        emissive="#fbbf24"
        emissiveIntensity={1.5}
        wireframe
        transparent
        opacity={0.25}
      />
    </instancedMesh>
  );
}
