import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import { CubeState, Face, CubeSize } from '../types';
import { COLOR_HEX } from '../constants';

interface Cube3DProps {
  state: CubeState;
  size: CubeSize;
  interactive?: boolean;
}

const CubePiece: React.FC<{ position: [number, number, number], colors: string[], scale: number }> = ({ position, colors, scale }) => {
  // colors array order: right, left, top, bottom, front, back
  return (
    <mesh position={position}>
      <boxGeometry args={[scale, scale, scale]} />
      {colors.map((c, i) => (
        <meshStandardMaterial key={i} attach={`material-${i}`} color={c} roughness={0.1} metalness={0.1} />
      ))}
    </mesh>
  );
};

const CubeModel: React.FC<{ state: CubeState, size: CubeSize }> = ({ state, size }) => {
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

          // Default Black
          const cubeColors = ['#111', '#111', '#111', '#111', '#111', '#111'];

          // Right (Face R)
          if (isRight) {
             // Map 3D coords to 2D face grid
             // For R face: Y goes top to bottom, Z goes front to back
             // We need to map (y,z) to index 0..size*size-1
             // 0,0 is Top-Left of the face
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
            />
          );
        }
      }
    }
    return pieces;
  }, [state, size]);

  return <group>{cubes}</group>;
};

const Cube3D: React.FC<Cube3DProps> = ({ state, size, interactive = true }) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [size * 1.5, size * 1.5, size * 1.5], fov: 45 }}>
        <Stage environment="city" intensity={0.5} adjustCamera={false}>
          <Center>
            <CubeModel state={state} size={size} />
          </Center>
        </Stage>
        <OrbitControls 
          autoRotate={interactive} 
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
