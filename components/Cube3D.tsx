
import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import { CubeState, Face, CubeSize } from '../types';
import { COLOR_HEX } from '../constants';
import * as THREE from 'three';

interface Cube3DProps {
  state: CubeState;
  size: CubeSize;
  interactive?: boolean;
  pendingMove?: { face: Face, clockwise: boolean } | null;
}

const CubePiece: React.FC<{ 
  position: [number, number, number], 
  colors: string[], 
  scale: number,
  isHighlighted?: boolean,
  highlightFace?: Face | null
}> = ({ position, colors, scale, isHighlighted, highlightFace }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const t = state.clock.getElapsedTime();
    let breathe = 1;
    
    if (isHighlighted) {
      breathe = 1 + Math.sin(t * 10) * 0.05;
      const popDist = 0.15;
      let popX = 0, popY = 0, popZ = 0;
      
      if (highlightFace === Face.U) popY = popDist;
      if (highlightFace === Face.D) popY = -popDist;
      if (highlightFace === Face.R) popX = popDist;
      if (highlightFace === Face.L) popX = -popDist;
      if (highlightFace === Face.F) popZ = popDist;
      if (highlightFace === Face.B) popZ = -popDist;
      
      meshRef.current.position.set(popX, popY, popZ);
    } else {
      meshRef.current.position.set(0, 0, 0);
    }
    
    meshRef.current.scale.setScalar(scale * breathe);
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        {colors.map((c, i) => (
          <meshStandardMaterial 
            key={i} 
            attach={`material-${i}`} 
            color={c} 
            roughness={0.1} 
            metalness={0.1}
            emissive={isHighlighted ? c : '#000000'}
            emissiveIntensity={isHighlighted ? 0.3 : 0}
          />
        ))}
      </mesh>
    </group>
  );
};

const CubeModel: React.FC<{ 
  state: CubeState, 
  size: CubeSize, 
  pendingMove?: { face: Face, clockwise: boolean } | null 
}> = ({ state, size, pendingMove }) => {
  const getC = (face: Face, idx: number): string => {
    const faceColors = state[face];
    if (!faceColors || !faceColors[idx]) return '#111';
    return COLOR_HEX[faceColors[idx]] || '#111';
  };

  const cubes = useMemo(() => {
    const pieces = [];
    const offset = (size - 1) / 2;
    const pieceSize = 0.95; 

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          
          const posX = x - offset;
          const posY = y - offset;
          const posZ = z - offset;

          const isRight = x === size - 1;
          const isLeft = x === 0;
          const isTop = y === size - 1;
          const isBottom = y === 0;
          const isFront = z === size - 1;
          const isBack = z === 0;

          if (!isRight && !isLeft && !isTop && !isBottom && !isFront && !isBack) continue;
          
          let isHighlighted = false;
          if (pendingMove) {
            if (pendingMove.face === Face.U && isTop) isHighlighted = true;
            if (pendingMove.face === Face.D && isBottom) isHighlighted = true;
            if (pendingMove.face === Face.R && isRight) isHighlighted = true;
            if (pendingMove.face === Face.L && isLeft) isHighlighted = true;
            if (pendingMove.face === Face.F && isFront) isHighlighted = true;
            if (pendingMove.face === Face.B && isBack) isHighlighted = true;
          }

          const cubeColors = ['#111', '#111', '#111', '#111', '#111', '#111'];

          if (isRight) {
             const row = (size - 1) - y;
             const col = (size - 1) - z;
             cubeColors[0] = getC(Face.R, row * size + col);
          }

          if (isLeft) {
            const row = (size - 1) - y;
            const col = z;
            cubeColors[1] = getC(Face.L, row * size + col);
          }

          if (isTop) {
            // FIXED MAPPING: Scan Row 0 (Top) is Back (z=0). Scan Row Max (Bottom) is Front (z=max).
            // So row index corresponds directly to z index.
            const row = z; 
            const col = x;
            cubeColors[2] = getC(Face.U, row * size + col);
          }

          if (isBottom) {
            // FIXED MAPPING: Scan Row 0 (Top) is Front (z=max). Scan Row Max (Bottom) is Back (z=0).
            // So row index is inverted relative to z.
            const row = (size - 1) - z;
            const col = x;
            cubeColors[3] = getC(Face.D, row * size + col);
          }

          if (isFront) {
            const row = (size - 1) - y;
            const col = x;
            cubeColors[4] = getC(Face.F, row * size + col);
          }

          if (isBack) {
             const row = (size - 1) - y;
             const col = (size - 1) - x;
             cubeColors[5] = getC(Face.B, row * size + col);
          }

          pieces.push(
            <CubePiece 
              key={`${x}-${y}-${z}`} 
              position={[posX, posY, posZ]} 
              colors={cubeColors} 
              scale={pieceSize}
              isHighlighted={isHighlighted}
              highlightFace={pendingMove?.face}
            />
          );
        }
      }
    }
    return pieces;
  }, [state, size, pendingMove]);

  return <group>{cubes}</group>;
};

const Cube3D: React.FC<Cube3DProps> = ({ state, size, interactive = true, pendingMove }) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [size * 1.5, size * 1.5, size * 1.5], fov: 45 }}>
        <Stage environment="city" intensity={0.5} adjustCamera={false}>
          <Center>
            <CubeModel state={state} size={size} pendingMove={pendingMove} />
          </Center>
        </Stage>
        <OrbitControls 
          autoRotate={interactive && !pendingMove} 
          autoRotateSpeed={1} 
          enableZoom={true} 
          enablePan={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
        />
      </Canvas>
    </div>
  );
};

export default Cube3D;
