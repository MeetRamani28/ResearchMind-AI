import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

function GlowingEmblemMesh() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.2;
      meshRef.current.rotation.x += delta * 0.6;
    }
  });

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={1.2}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color="#9DB2BF"
          emissive="#526D82"
          emissiveIntensity={0.9}
          roughness={0.2}
          metalness={0.9}
          wireframe
        />
      </mesh>
    </Float>
  );
}

export default function ResearchMind3DText() {
  return (
    <div className="w-9 h-9 relative flex items-center justify-center pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#9DB2BF" />
        <GlowingEmblemMesh />
      </Canvas>
    </div>
  );
}
