import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface HabitVisualizationProps {
  data: {
    completionRate: number;
    streak: number;
    trend: number;
    consistency: number;
    timeOfDay: Record<string, number>;
    weeklyPerformance: Record<string, number>;
    predictedSuccess: number;
    adaptability: number;
  };
}

// Move Ring component inside Scene to use hooks
const Ring = ({ color, scale, rotation = [0, 0, 0] }: { 
  color: string; 
  scale: number; 
  rotation?: [number, number, number];
}) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <mesh ref={ringRef} rotation={rotation} scale={[scale, scale, scale]}>
      <torusGeometry args={[1.2, 0.02, 16, 32]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.4}
        metalness={0.8}
        roughness={0.2}
        envMapIntensity={1}
      />
    </mesh>
  );
};

// Move OctagonFace component inside Scene to use hooks
const OctagonFace = ({
  position,
  rotation,
  color,
  insight,
  isActive,
  onClick,
  pulseIntensity,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  insight: {
    title: string;
    value: string;
    description: string;
    label?: string;
  };
  isActive: boolean;
  onClick: () => void;
  pulseIntensity: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [elevation, setElevation] = useState(0);

  const { scale } = useSpring({
    scale: hovered || isActive ? 1.1 : 1,
    config: { tension: 300, friction: 10 },
  });

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      setElevation(Math.sin(time * 2) * 0.05 * pulseIntensity);
      meshRef.current.rotation.z = time * 0.1;
    }
  });

  return (
    <animated.group
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <animated.mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        position-z={elevation}
      >
        <cylinderGeometry args={[1, 1, 0.1, 8]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.8}
          metalness={0.5}
          roughness={0.2}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.2}
        />

        {(isActive || hovered) && (
          <>
            <Ring color={color} scale={1.1} />
            <Ring color={color} scale={1.2} rotation={[Math.PI / 4, 0, 0]} />
          </>
        )}

        <Html
          center
          position={[0, 0, 0.06]}
          className="pointer-events-none"
          distanceFactor={20}
        >
          <div className="flex flex-col items-center justify-center text-center scale-[0.55]">
            <p className="text-[8px] font-medium text-white/90 mb-0.5">{insight.title}</p>
            <p className="text-[10px] font-bold text-white">{insight.value}</p>
          </div>
        </Html>
        
        {(hovered || isActive) && (
          <Html
            center
            position={[0, 0, 0.2]}
            className="pointer-events-none"
            distanceFactor={20}
          >
            <div className="bg-gray-900/90 p-3 rounded-lg shadow-xl max-w-[200px] border border-gray-700/50 backdrop-blur-sm scale-75">
              <p className="text-xs text-white font-medium">{insight.title}</p>
              <p className="text-[10px] text-gray-300 mt-1">{insight.description}</p>
              {insight.value && (
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">{insight.label}</span>
                  <span className="text-xs font-medium text-white">{insight.value}</span>
                </div>
              )}
            </div>
          </Html>
        )}
      </animated.mesh>
    </animated.group>
  );
};

// Create Scene component to contain all 3D elements
const Scene = ({ data }: HabitVisualizationProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && !activeIndex) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  const insights = [
    {
      title: 'Completion Rate',
      value: `${data.completionRate.toFixed(1)}%`,
      description: 'Your current habit completion rate',
      color: '#4F46E5',
    },
    {
      title: 'Current Streak',
      value: `${data.streak} days`,
      description: 'Keep going to maintain your streak!',
      color: '#10B981',
    },
    {
      title: 'Trend',
      value: `${(data.trend * 100).toFixed(1)}%`,
      description: 'Your progress trend over time',
      color: data.trend >= 0 ? '#10B981' : '#EF4444',
    },
    {
      title: 'Consistency',
      value: `${(data.consistency * 100).toFixed(1)}%`,
      description: 'How consistent you are with this habit',
      color: '#8B5CF6',
    },
    {
      title: 'Peak Time',
      value: Object.entries(data.timeOfDay).sort((a, b) => b[1] - a[1])[0][0],
      description: 'Your most productive time of day',
      color: '#F59E0B',
    },
    {
      title: 'Best Day',
      value: Object.entries(data.weeklyPerformance).sort((a, b) => b[1] - a[1])[0][0],
      description: 'Your most successful day of the week',
      color: '#EC4899',
    },
    {
      title: 'Predicted Success',
      value: `${data.predictedSuccess.toFixed(1)}%`,
      description: 'AI-predicted success rate',
      color: '#2DD4BF',
    },
    {
      title: 'Adaptability',
      value: `${data.adaptability.toFixed(1)}%`,
      description: 'Your ability to maintain this habit',
      color: '#6366F1',
    },
  ];

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls 
        enableZoom={false}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.5}
      />

      <group ref={groupRef} rotation={[0, 0, 0]} scale={0.9}>
        {insights.map((insight, index) => {
          const angle = (index / insights.length) * Math.PI * 2;
          const radius = 3;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <OctagonFace
              key={insight.title}
              position={[x, 0, z]}
              rotation={[0, -angle, 0]}
              color={insight.color}
              insight={insight}
              isActive={activeIndex === index}
              onClick={() => setActiveIndex(index === activeIndex ? null : index)}
              pulseIntensity={1 + (activeIndex === index ? 0.5 : 0)}
            />
          );
        })}
      </group>

      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
        />
      </EffectComposer>
    </>
  );
};

export const HabitVisualization: React.FC<HabitVisualizationProps> = ({ data }) => {
  return (
    <div className="w-full h-[500px] bg-gray-900 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <Scene data={data} />
      </Canvas>
    </div>
  );
};