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
  // We define "strips" of adjacent faces.
  // Standard Unfolded Cube Layout Logic:
  // U (Up): Row 0=Back, Row N-1=Front
  // D (Down): Row 0=Front, Row N-1=Back
  // F (Front): Row 0=Up, Row N-1=Down
  // B (Back): Row 0=Up, Row N-1=Down
  // L (Left): Col 0=Back, Col N-1=Front
  // R (Right): Col 0=Front, Col N-1=Back

  // Helper to get row indices
  const getRow = (rowIdx: number) => Array.from({ length: size }, (_, i) => rowIdx * size + i);
  // Helper to get col indices
  const getCol = (colIdx: number) => Array.from({ length: size }, (_, i) => i * size + colIdx);

  // We need to fetch current values for 4 adjacent strips
  // And map them to their new positions.
  
  // Arrays of indices for the 4 adjacent strips involved in the rotation
  let strips: { face: Face, indices: number[] }[] = [];

  switch (face) {
    case Face.F:
      // Front Face CW: U(Bottom) -> R(Left) -> D(Top) -> L(Right) -> U(Bottom)
      // U: Row (size-1) (Left to Right)
      // R: Col 0 (Top to Bottom)
      // D: Row 0 (Right to Left) -> Wait, logic below handles index mapping
      // L: Col (size-1) (Bottom to Top)

      strips = [
        { face: Face.U, indices: getRow(size - 1) },         // 0: U Bottom Row
        { face: Face.R, indices: getCol(0) },                // 1: R Left Col
        { face: Face.D, indices: getRow(0) },                // 2: D Top Row
        { face: Face.L, indices: getCol(size - 1) },         // 3: L Right Col
      ];
      break;

    case Face.B:
      // Back Face CW: U(Top) -> L(Left) -> D(Bottom) -> R(Right) -> U(Top)
      // U: Row 0 (Right to Left)
      // L: Col 0 (Top to Bottom)
      // D: Row (size-1) (Left to Right)
      // R: Col (size-1) (Bottom to Top)
      strips = [
        { face: Face.U, indices: getRow(0) },                // 0: U Top Row
        { face: Face.L, indices: getCol(0) },                // 1: L Left Col
        { face: Face.D, indices: getRow(size - 1) },         // 2: D Bottom Row
        { face: Face.R, indices: getCol(size - 1) },         // 3: R Right Col
      ];
      break;

    case Face.U:
      // Up Face CW: F(Top) -> L(Top) -> B(Top) -> R(Top) -> F(Top)
      // Standard: F -> L -> B -> R -> F
      strips = [
        { face: Face.F, indices: getRow(0) },
        { face: Face.L, indices: getRow(0) },
        { face: Face.B, indices: getRow(0) },
        { face: Face.R, indices: getRow(0) },
      ];
      break;

    case Face.D:
      // Down Face CW: F(Bottom) -> R(Bottom) -> B(Bottom) -> L(Bottom) -> F(Bottom)
      // Standard: F -> R -> B -> L -> F
      strips = [
        { face: Face.F, indices: getRow(size - 1) },
        { face: Face.R, indices: getRow(size - 1) },
        { face: Face.B, indices: getRow(size - 1) },
        { face: Face.L, indices: getRow(size - 1) },
      ];
      break;

    case Face.L:
      // Left Face CW: U(Left) -> F(Left) -> D(Left) -> B(Right) -> U(Left)
      // U: Col 0
      // F: Col 0
      // D: Col 0
      // B: Col (size-1) (Note: B orientation is inverted vertically relative to F, so Col (size-1) is the one touching L)
      strips = [
        { face: Face.U, indices: getCol(0) },
        { face: Face.F, indices: getCol(0) },
        { face: Face.D, indices: getCol(0) },
        { face: Face.B, indices: getCol(size - 1) },
      ];
      break;

    case Face.R:
      // Right Face CW: U(Right) -> B(Left) -> D(Right) -> F(Right) -> U(Right)
      // U: Col (size-1)
      // B: Col 0 (Touching R)
      // D: Col (size-1)
      // F: Col (size-1)
      strips = [
        { face: Face.U, indices: getCol(size - 1) },
        { face: Face.B, indices: getCol(0) },
        { face: Face.D, indices: getCol(size - 1) },
        { face: Face.F, indices: getCol(size - 1) },
      ];
      break;
  }

  // extract values
  const val0 = strips[0].indices.map(i => currentState[strips[0].face][i]);
  const val1 = strips[1].indices.map(i => currentState[strips[1].face][i]);
  const val2 = strips[2].indices.map(i => currentState[strips[2].face][i]);
  const val3 = strips[3].indices.map(i => currentState[strips[3].face][i]);

  /*
    MAPPING LOGIC (The Hard Part):
    We need to handle the orientation of movement.
    Example F CW: 
    - U Row (L->R) moves to R Col (T->B). (Direct order)
    - R Col (T->B) moves to D Row (R->L). (Reverse order)
    - D Row (R->L) moves to L Col (B->T). (Direct relative to previous, or Reverse relative to L array?) 
      - D Row indices are 0..N. Index 0 is LEFT (near L). Index N is RIGHT (near R).
      - R Col moves to D. R-Top maps to D-Right. R-Bottom maps to D-Left.
        So R[i] -> D[size-1-i].
      - D Row moves to L. D-Right maps to L-Top. D-Left maps to L-Bottom.
        So D[i] -> L[i].
      - L Col moves to U. L-Top maps to U-Right. L-Bottom maps to U-Left.
        So L[i] -> U[size-1-i].
  */

  if (face === Face.F) {
    if (clockwise) {
      // U(i) -> R(i)
      // R(i) -> D(size-1-i)
      // D(i) -> L(i)
      // L(i) -> U(size-1-i)
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val0[i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val1[size - 1 - i]);
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val2[i]);
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val3[size - 1 - i]);
    } else {
      // CCW is reverse of CW
      // U <- R <- D <- L <- U
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val1[i]);
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val2[size - 1 - i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val3[i]);
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val0[size - 1 - i]);
    }
  } 
  else if (face === Face.B) {
    // B CW: U(Top) -> L(Left) -> D(Bottom) -> R(Right)
    // U(R->L) -> L(T->B)? 
    // U Top indices are 0..N. 0 is Left, N is Right.
    // U(i) maps to L(size-1-i). U-Right(N) maps to L-Top(0). U-Left(0) maps to L-Bottom(N).
    // L(i) maps to D(i). L-Top(0) maps to D-Right(N). Wait.
    // L-Top maps to D-Left? No.
    // B rotation. Top-Right of B (near L-Top) moves to Bottom-Right of B (near D-Back).
    // Sticker on L-Top moves to D-Back-Left?
    // Let's trust standard cycles.
    
    if (clockwise) {
      // U -> L (reverse)
      // L -> D (direct)
      // D -> R (reverse)
      // R -> U (direct)
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val0[size - 1 - i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val1[i]);
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val2[size - 1 - i]);
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val3[i]);
    } else {
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val1[size - 1 - i]);
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val0[i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val3[size - 1 - i]);
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val2[i]);
    }
  }
  else if (face === Face.U) {
    if (clockwise) {
      // F -> L -> B -> R -> F (All direct)
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val0[i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val1[i]);
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val2[i]);
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val3[i]);
    } else {
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val0[i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val3[i]);
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val2[i]);
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val1[i]);
    }
  }
  else if (face === Face.D) {
    if (clockwise) {
      // F -> R -> B -> L -> F (All direct)
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val0[i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val1[i]);
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val2[i]);
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val3[i]);
    } else {
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val0[i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val3[i]);
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val2[i]);
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val1[i]);
    }
  }
  else if (face === Face.L) {
    // L CW: U(Left) -> F(Left) -> D(Left) -> B(Right) -> U(Left)
    // U -> F (Direct)
    // F -> D (Direct)
    // D -> B (Reverse: D-Bottom maps to B-Top)
    // B -> U (Reverse: B-Top maps to U-Top)
    if (clockwise) {
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val0[i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val1[i]);
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val2[size - 1 - i]);
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val3[size - 1 - i]);
    } else {
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val0[size - 1 - i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val3[size - 1 - i]);
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val2[i]);
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val1[i]);
    }
  }
  else if (face === Face.R) {
    // R CW: U(Right) -> B(Left) -> D(Right) -> F(Right)
    // U -> B (Reverse)
    // B -> D (Reverse)
    // D -> F (Direct)
    // F -> U (Direct)
    if (clockwise) {
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val0[size - 1 - i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val1[size - 1 - i]);
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val2[i]);
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val3[i]);
    } else {
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val0[i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val3[i]);
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val2[size - 1 - i]);
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val1[size - 1 - i]);
    }
  }

  return nextState;
};