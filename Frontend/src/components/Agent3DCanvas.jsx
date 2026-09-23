import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";

function CenterWireframeEmblem({ isSearching }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isSearching ? 1.8 : 0.8);
      meshRef.current.rotation.x += delta * (isSearching ? 1.0 : 0.4);
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1.2} floatIntensity={1.5}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.3, 0]} />
        <meshStandardMaterial
          color={isSearching ? "#E27870" : "#E85A4F"}
          emissive={isSearching ? "#E85A4F" : "#B83A31"}
          emissiveIntensity={isSearching ? 1.2 : 0.8}
          roughness={0.2}
          metalness={0.9}
          wireframe
        />
      </mesh>
    </Float>
  );
}

export default function Agent3DCanvas({ isSearching = false }) {
  return (
    <div className="w-full h-48 md:h-56 relative flex flex-col items-center justify-center bg-transparent border-0 shadow-none">
      <Canvas camera={{ position: [0, 0, 3.8], fov: 50 }} gl={{ alpha: true }} style={{ background: "transparent" }}>
        <ambientLight intensity={1.0} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#E27870" />
        <pointLight position={[-5, -5, -5]} intensity={1.5} color="#E85A4F" />
        <CenterWireframeEmblem isSearching={isSearching} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
      </Canvas>

      <div className="flex items-center gap-2 mt-2 pointer-events-none">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isSearching
              ? "bg-[#E27870] animate-ping"
              : "bg-[#E85A4F] animate-pulse"
          }`}
        />
        <span className="text-[11px] font-bold text-[#726363] tracking-wider uppercase">
          {isSearching
            ? "LangGraph Multi-Agent Engine Active"
            : "Interactive 3D Agent Engine Ready"}
        </span>
      </div>
    </div>
  );
}
