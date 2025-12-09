import { CubeState, Face, CubeSize, FaceGrid, CubeColor } from '../types';

// Deep copy helper
const cloneState = (state: CubeState): CubeState => JSON.parse(JSON.stringify(state));

// Rotate a 1D array representing a FaceGrid (NxN) 90 degrees clockwise
const rotateGridCW = (grid: FaceGrid, size: number): FaceGrid => {
  const newGrid = [...grid];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // (row, col) -> (col, size - 1 - row)
      newGrid[col * size + (size - 1 - row)] = grid[row * size + col];
    }
  }
  return newGrid;
};

// Rotate a 1D array representing a FaceGrid (NxN) 90 degrees counter-clockwise
const rotateGridCCW = (grid: FaceGrid, size: number): FaceGrid => {
  const newGrid = [...grid];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // (row, col) -> (size - 1 - col, row)
      newGrid[(size - 1 - col) * size + row] = grid[row * size + col];
    }
  }
  return newGrid;
};

export const rotateFace = (currentState: CubeState, face: Face, clockwise: boolean, size: number): CubeState => {
  const nextState = cloneState(currentState);
  
  // 1. Rotate the face itself
  nextState[face] = clockwise 
    ? rotateGridCW(currentState[face], size)
    : rotateGridCCW(currentState[face], size);

  // 2. Permute Adjacent Faces
  // Definitions of indices for adjacent strips for each face
  // Simplified standard orientation assumption:
  // F (Front): U-Bottom, R-Left, D-Top, L-Right
  
  // Helper to get row indices
  const getRowIndices = (rowIndex: number) => {
    return Array.from({ length: size }, (_, i) => rowIndex * size + i);
  };
  
  // Helper to get col indices
  const getColIndices = (colIndex: number) => {
    return Array.from({ length: size }, (_, i) => i * size + colIndex);
  };

  let uStrip: number[] = [], dStrip: number[] = [], lStrip: number[] = [], rStrip: number[] = [], fStrip: number[] = [], bStrip: number[] = [];
  
  // Define strips for each rotation case
  // Note: Directions must be consistent with standard cube notation
  
  switch (face) {
    case Face.F:
      // U Bottom Row, R Left Col, D Top Row, L Right Col
      uStrip = getRowIndices(size - 1);
      rStrip = getColIndices(0);
      dStrip = getRowIndices(0);
      lStrip = getColIndices(size - 1);
      
      if (clockwise) {
        // U -> R, R -> D, D -> L, L -> U
        const temp = uStrip.map(i => currentState[Face.U][i]);
        // U -> R (reversed order logic depends on face orientation, standard model mapping:)
        // U(left-to-right) goes to R(top-to-bottom)
        lStrip.slice().reverse().forEach((idx, i) => nextState[Face.U][uStrip[i]] = currentState[Face.L][idx]);
        dStrip.slice().reverse().forEach((idx, i) => nextState[Face.L][lStrip[i]] = currentState[Face.D][idx]);
        rStrip.forEach((idx, i) => nextState[Face.D][dStrip[i]] = currentState[Face.R][idx]); // D gets R (normal?)
        // Standard F Move:
        // U(6,7,8) -> R(0,3,6)
        // R(0,3,6) -> D(2,1,0) (Reversed relative to D index?)
        // Let's stick to a cyclic permutation that works for standard unfolding
        // U(row-last) -> R(col-first)
        // R(col-first) -> D(row-first-reversed)
        // D(row-first) -> L(col-last-reversed)
        // L(col-last) -> U(row-last)
        
        // Let's implement simpler cycle reading values then writing
        const uVals = uStrip.map(i => currentState[Face.U][i]);
        const rVals = rStrip.map(i => currentState[Face.R][i]);
        const dVals = dStrip.map(i => currentState[Face.D][i]);
        const lVals = lStrip.map(i => currentState[Face.L][i]);

        // F Clockwise
        // U -> R
        rStrip.forEach((idx, i) => nextState[Face.R][idx] = uVals[i]);
        // R -> D (Reversed)
        dStrip.forEach((idx, i) => nextState[Face.D][idx] = rVals[size - 1 - i]);
        // D -> L 
        lStrip.forEach((idx, i) => nextState[Face.L][idx] = dVals[size - 1 - i]); // Wait, geometric mapping
        // L -> U (Reversed? No, L is Up-Down, U is Left-Right)
        uStrip.forEach((idx, i) => nextState[Face.U][idx] = lVals[size - 1 - i]); // L goes to U
        
        // Correction: Standard F move
        // Top Face (U): 6 7 8 -> Right Face (R): 0 3 6
        // Right Face (R): 0 3 6 -> Bottom Face (D): 2 1 0
        // Bottom Face (D): 2 1 0 -> Left Face (L): 8 5 2
        // Left Face (L): 8 5 2 -> Top Face (U): 6 7 8
        
        for(let i=0; i<size; i++) {
           nextState[Face.R][rStrip[i]] = uVals[i]; // U -> R
           nextState[Face.D][dStrip[i]] = rVals[size - 1 - i]; // R -> D (rev)
           nextState[Face.L][lStrip[i]] = dVals[i]; // D -> L (Actually D is 2,1,0 -> L 8,5,2 so D[size-1-i] -> L[i])
           nextState[Face.U][uStrip[i]] = lVals[size - 1 - i]; // L -> U
        }
      } else {
        // Counter Clockwise
        const uVals = uStrip.map(i => currentState[Face.U][i]);
        const rVals = rStrip.map(i => currentState[Face.R][i]);
        const dVals = dStrip.map(i => currentState[Face.D][i]);
        const lVals = lStrip.map(i => currentState[Face.L][i]);
        
        for(let i=0; i<size; i++) {
           nextState[Face.L][lStrip[i]] = uVals[size - 1 - i];
           nextState[Face.D][dStrip[i]] = lVals[i];
           nextState[Face.R][rStrip[i]] = dVals[size - 1 - i];
           nextState[Face.U][uStrip[i]] = rVals[i];
        }
      }
      break;

    case Face.B:
       // B is opposite of F. 
       // U Top Row, L Left Col, D Bottom Row, R Right Col
       uStrip = getRowIndices(0);
       lStrip = getColIndices(0);
       dStrip = getRowIndices(size - 1);
       rStrip = getColIndices(size - 1);
       
       if (clockwise) {
         const uVals = uStrip.map(i => currentState[Face.U][i]);
         const lVals = lStrip.map(i => currentState[Face.L][i]);
         const dVals = dStrip.map(i => currentState[Face.D][i]);
         const rVals = rStrip.map(i => currentState[Face.R][i]);
         
         for(let i=0; i<size; i++) {
            nextState[Face.L][lStrip[i]] = uVals[size - 1 - i];
            nextState[Face.D][dStrip[i]] = lVals[i];
            nextState[Face.R][rStrip[i]] = dVals[size - 1 - i];
            nextState[Face.U][uStrip[i]] = rVals[i];
         }
       } else {
         const uVals = uStrip.map(i => currentState[Face.U][i]);
         const lVals = lStrip.map(i => currentState[Face.L][i]);
         const dVals = dStrip.map(i => currentState[Face.D][i]);
         const rVals = rStrip.map(i => currentState[Face.R][i]);

         for(let i=0; i<size; i++) {
            nextState[Face.R][rStrip[i]] = uVals[i];
            nextState[Face.D][dStrip[i]] = rVals[size - 1 - i];
            nextState[Face.L][lStrip[i]] = dVals[i];
            nextState[Face.U][uStrip[i]] = lVals[size - 1 - i];
         }
       }
       break;

    case Face.U:
      // F Top, R Top, B Top, L Top
      fStrip = getRowIndices(0);
      rStrip = getRowIndices(0);
      bStrip = getRowIndices(0);
      lStrip = getRowIndices(0);
      
      if (clockwise) {
         // F -> L -> B -> R -> F
         for(let i=0; i<size; i++) {
           nextState[Face.L][lStrip[i]] = currentState[Face.F][fStrip[i]];
           nextState[Face.B][bStrip[i]] = currentState[Face.L][lStrip[i]];
           nextState[Face.R][rStrip[i]] = currentState[Face.B][bStrip[i]];
           nextState[Face.F][fStrip[i]] = currentState[Face.R][rStrip[i]];
         }
      } else {
         for(let i=0; i<size; i++) {
           nextState[Face.R][rStrip[i]] = currentState[Face.F][fStrip[i]];
           nextState[Face.B][bStrip[i]] = currentState[Face.R][rStrip[i]];
           nextState[Face.L][lStrip[i]] = currentState[Face.B][bStrip[i]];
           nextState[Face.F][fStrip[i]] = currentState[Face.L][lStrip[i]];
         }
      }
      break;

    case Face.D:
      // F Bottom, R Bottom, B Bottom, L Bottom
      fStrip = getRowIndices(size - 1);
      rStrip = getRowIndices(size - 1);
      bStrip = getRowIndices(size - 1);
      lStrip = getRowIndices(size - 1);

      if (clockwise) {
         // F -> R -> B -> L -> F
         for(let i=0; i<size; i++) {
           nextState[Face.R][rStrip[i]] = currentState[Face.F][fStrip[i]];
           nextState[Face.B][bStrip[i]] = currentState[Face.R][rStrip[i]];
           nextState[Face.L][lStrip[i]] = currentState[Face.B][bStrip[i]];
           nextState[Face.F][fStrip[i]] = currentState[Face.L][lStrip[i]];
         }
      } else {
         for(let i=0; i<size; i++) {
           nextState[Face.L][lStrip[i]] = currentState[Face.F][fStrip[i]];
           nextState[Face.B][bStrip[i]] = currentState[Face.L][lStrip[i]];
           nextState[Face.R][rStrip[i]] = currentState[Face.B][bStrip[i]];
           nextState[Face.F][fStrip[i]] = currentState[Face.R][rStrip[i]];
         }
      }
      break;
      
    case Face.L:
      // U Left Col, F Left Col, D Left Col, B Right Col (inverted)
      uStrip = getColIndices(0);
      fStrip = getColIndices(0);
      dStrip = getColIndices(0);
      bStrip = getColIndices(size - 1); // Back is reversed horizontally relative to front loop? 
      // Vertical strips are consistent usually.
      
      if (clockwise) {
        // U -> F -> D -> B -> U
        // B needs inversion because it's on the back
        const uVals = uStrip.map(i => currentState[Face.U][i]);
        const fVals = fStrip.map(i => currentState[Face.F][i]);
        const dVals = dStrip.map(i => currentState[Face.D][i]);
        const bVals = bStrip.map(i => currentState[Face.B][i]);
        
        for(let i=0; i<size; i++) {
          nextState[Face.F][fStrip[i]] = uVals[i];
          nextState[Face.D][dStrip[i]] = fVals[i];
          nextState[Face.B][bStrip[size - 1 - i]] = dVals[i]; // Invert B
          nextState[Face.U][uStrip[i]] = bVals[size - 1 - i]; // Invert back
        }
      } else {
        const uVals = uStrip.map(i => currentState[Face.U][i]);
        const fVals = fStrip.map(i => currentState[Face.F][i]);
        const dVals = dStrip.map(i => currentState[Face.D][i]);
        const bVals = bStrip.map(i => currentState[Face.B][i]);
        
        for(let i=0; i<size; i++) {
          nextState[Face.B][bStrip[size - 1 - i]] = uVals[i];
          nextState[Face.D][dStrip[i]] = bVals[size - 1 - i];
          nextState[Face.F][fStrip[i]] = dVals[i];
          nextState[Face.U][uStrip[i]] = fVals[i];
        }
      }
      break;

    case Face.R:
      // U Right Col, B Left Col (inv), D Right Col, F Right Col
      uStrip = getColIndices(size - 1);
      bStrip = getColIndices(0);
      dStrip = getColIndices(size - 1);
      fStrip = getColIndices(size - 1);
      
      if (clockwise) {
        // U -> B -> D -> F -> U
        const uVals = uStrip.map(i => currentState[Face.U][i]);
        const bVals = bStrip.map(i => currentState[Face.B][i]);
        const dVals = dStrip.map(i => currentState[Face.D][i]);
        const fVals = fStrip.map(i => currentState[Face.F][i]);
        
        for(let i=0; i<size; i++) {
          nextState[Face.B][bStrip[size - 1 - i]] = uVals[i];
          nextState[Face.D][dStrip[i]] = bVals[size - 1 - i];
          nextState[Face.F][fStrip[i]] = dVals[i];
          nextState[Face.U][uStrip[i]] = fVals[i];
        }
      } else {
        const uVals = uStrip.map(i => currentState[Face.U][i]);
        const bVals = bStrip.map(i => currentState[Face.B][i]);
        const dVals = dStrip.map(i => currentState[Face.D][i]);
        const fVals = fStrip.map(i => currentState[Face.F][i]);
        
        for(let i=0; i<size; i++) {
          nextState[Face.F][fStrip[i]] = uVals[i];
          nextState[Face.D][dStrip[i]] = fVals[i];
          nextState[Face.B][bStrip[size - 1 - i]] = dVals[i];
          nextState[Face.U][uStrip[i]] = bVals[size - 1 - i];
        }
      }
      break;
  }

  return nextState;
};