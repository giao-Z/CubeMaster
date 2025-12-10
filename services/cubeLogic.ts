
import { CubeState, Face, FaceGrid } from '../types';

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

// Validation Function with Localization Support
export const validateState = (state: CubeState, size: number, colorNames: Record<string, string>): string | null => {
  const targetCount = size * size;
  const counts: Record<string, number> = {
    white: 0, yellow: 0, green: 0, blue: 0, red: 0, orange: 0
  };
  
  // Count all stickers
  Object.values(state).forEach(grid => {
    grid.forEach(color => {
      if (color !== 'gray' && counts[color] !== undefined) {
        counts[color]++;
      }
    });
  });

  const errors: string[] = [];
  const colors = ['white', 'yellow', 'green', 'blue', 'red', 'orange'];
  
  colors.forEach(c => {
    if (counts[c] !== targetCount) {
      const diff = counts[c] - targetCount;
      const msg = diff > 0 ? `+${diff}` : `${diff}`;
      const name = colorNames[c] || c;
      errors.push(`${name} (${msg})`);
    }
  });

  if (errors.length > 0) {
    return errors.join(", ");
  }

  return null;
};

export const rotateFace = (currentState: CubeState, face: Face, clockwise: boolean, size: number): CubeState => {
  const nextState = cloneState(currentState);
  
  // 1. Rotate the face itself
  nextState[face] = clockwise 
    ? rotateGridCW(currentState[face], size)
    : rotateGridCCW(currentState[face], size);

  // 2. Permute Adjacent Faces
  // Helper to get row indices
  const getRow = (rowIdx: number) => Array.from({ length: size }, (_, i) => rowIdx * size + i);
  // Helper to get col indices
  const getCol = (colIdx: number) => Array.from({ length: size }, (_, i) => i * size + colIdx);

  let strips: { face: Face, indices: number[] }[] = [];

  switch (face) {
    case Face.F:
      strips = [
        { face: Face.U, indices: getRow(size - 1) },         
        { face: Face.R, indices: getCol(0) },                
        { face: Face.D, indices: getRow(0) },                
        { face: Face.L, indices: getCol(size - 1) },         
      ];
      break;

    case Face.B:
      strips = [
        { face: Face.U, indices: getRow(0) },                
        { face: Face.L, indices: getCol(0) },                
        { face: Face.D, indices: getRow(size - 1) },         
        { face: Face.R, indices: getCol(size - 1) },         
      ];
      break;

    case Face.U:
      strips = [
        { face: Face.F, indices: getRow(0) },
        { face: Face.L, indices: getRow(0) },
        { face: Face.B, indices: getRow(0) },
        { face: Face.R, indices: getRow(0) },
      ];
      break;

    case Face.D:
      strips = [
        { face: Face.F, indices: getRow(size - 1) },
        { face: Face.R, indices: getRow(size - 1) },
        { face: Face.B, indices: getRow(size - 1) },
        { face: Face.L, indices: getRow(size - 1) },
      ];
      break;

    case Face.L:
      strips = [
        { face: Face.U, indices: getCol(0) },
        { face: Face.F, indices: getCol(0) },
        { face: Face.D, indices: getCol(0) },
        { face: Face.B, indices: getCol(size - 1) },
      ];
      break;

    case Face.R:
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

  if (face === Face.F) {
    if (clockwise) {
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val0[i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val1[size - 1 - i]);
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val2[i]);
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val3[size - 1 - i]);
    } else {
      strips[0].indices.forEach((idx, i) => nextState[strips[0].face][idx] = val1[i]);
      strips[1].indices.forEach((idx, i) => nextState[strips[1].face][idx] = val2[size - 1 - i]);
      strips[2].indices.forEach((idx, i) => nextState[strips[2].face][idx] = val3[i]);
      strips[3].indices.forEach((idx, i) => nextState[strips[3].face][idx] = val0[size - 1 - i]);
    }
  } 
  else if (face === Face.B) {
    if (clockwise) {
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
