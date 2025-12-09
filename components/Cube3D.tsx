import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import { CubeState, Face, CubeSize } from '../types';
import { COLOR_HEX } from '../constants';
import * as THREE from 'three';

// Add type definitions for React Three Fiber elements
// Augment both global and module-scoped JSX namespaces to ensure compatibility
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      group: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      group: any;
    }
  }
}

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
  
  // colors array order: right, left, top, bottom, front, back
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Breathing Animation for highlighted pieces
    const t = state.clock.getElapsedTime();
    let breathe = 1;
    
    // Pop out animation logic
    // We modify the mesh's position relative to its group (which holds the base position)
    // Actually, `position` prop is passed to group. Mesh is at 0,0,0 relative to group.
    
    if (isHighlighted) {
      // 1. Breathe Scale
      breathe = 1 + Math.sin(t * 10) * 0.05;
      
      // 2. Pop Direction
      // We need to shift the piece slightly in the direction of the face normal
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
  // Helper to get color code
  const getC = (face: Face, idx: number): string => {
    const faceColors = state[face];
    if (!faceColors || !faceColors[idx]) return '#111';
    return COLOR_HEX[faceColors[idx]] || '#111';
  };

  const cubes = useMemo(() => {
    const pieces = [];
    const offset = (size - 1) / 2;
    const pieceSize = 0.95; 

    // Iterate through 3D grid
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          
          // Position centering
          const posX = x - offset;
          const posY = y - offset;
          const posZ = z - offset;

          // Determine if this piece is on the outside (visible)
          const isRight = x === size - 1;
          const isLeft = x === 0;
          const isTop = y === size - 1;
          const isBottom = y === 0;
          const isFront = z === size - 1;
          const isBack = z === 0;

          // Optimization: Skip internal cubes
          if (!isRight && !isLeft && !isTop && !isBottom && !isFront && !isBack) continue;
          
          // Check if this piece belongs to the pending move face
          let isHighlighted = false;
          if (pendingMove) {
            if (pendingMove.face === Face.U && isTop) isHighlighted = true;
            if (pendingMove.face === Face.D && isBottom) isHighlighted = true;
            if (pendingMove.face === Face.R && isRight) isHighlighted = true;
            if (pendingMove.face === Face.L && isLeft) isHighlighted = true;
            if (pendingMove.face === Face.F && isFront) isHighlighted = true;
            if (pendingMove.face === Face.B && isBack) isHighlighted = true;
          }

          // Default Black
          const cubeColors = ['#111', '#111', '#111', '#111', '#111', '#111'];

          // Right (Face R)
          if (isRight) {
             const row = (size - 1) - y;
             const col = (size - 1) - z;
             cubeColors[0] = getC(Face.R, row * size + col);
          }

          // Left (Face L)
          if (isLeft) {
            const row = (size - 1) - y;
            const col = z;
            cubeColors[1] = getC(Face.L, row * size + col);
          }

          // Top (Face U)
          if (isTop) {
            const row = (size - 1) - z; // Back is top, Front is bottom
            const col = x;
            cubeColors[2] = getC(Face.U, row * size + col);
          }

          // Bottom (Face D)
          if (isBottom) {
            const row = z;
            const col = x;
            cubeColors[3] = getC(Face.D, row * size + col);
          }

          // Front (Face F)
          if (isFront) {
            const row = (size - 1) - y;
            const col = x;
            cubeColors[4] = getC(Face.F, row * size + col);
          }

          // Back (Face B)
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
          autoRotate={interactive && !pendingMove} // Stop rotation if selecting a move
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