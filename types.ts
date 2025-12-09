export type CubeColor = 'white' | 'yellow' | 'green' | 'blue' | 'red' | 'orange' | 'gray';

export enum Face {
  U = 'U', // Up (White)
  D = 'D', // Down (Yellow)
  F = 'F', // Front (Green)
  B = 'B', // Back (Blue)
  L = 'L', // Left (Orange)
  R = 'R', // Right (Red)
}

// Grid of colors for a single face (size * size)
export type FaceGrid = CubeColor[];

// The entire state of the cube (6 faces)
export type CubeState = Record<Face, FaceGrid>;

export type CubeSize = 2 | 3 | 4 | 5;

export interface SolveStep {
  move: string; // e.g., "R", "U'", "F2", "Rw"
  description: string;
  rotationAxis?: 'x' | 'y' | 'z';
  rotationDirection?: 1 | -1;
}

export enum AppMode {
  HOME = 'HOME',
  SCAN = 'SCAN',
  VERIFY = 'VERIFY',
  SOLVING_LOADING = 'SOLVING_LOADING',
  GUIDE = 'GUIDE',
  LEARN = 'LEARN',
  PLAY = 'PLAY'
}

export interface ScanProgress {
  currentFace: Face;
  completedFaces: Face[];
}

export interface LearnSection {
  title: string;
  content: string;
  algorithm?: string;
  image?: string; // Placeholder for potential image assets
}

export interface LearnTopic {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  sections?: LearnSection[];
}

export type Language = 'en' | 'zh' | 'es' | 'fr' | 'ru' | 'ar';

export enum ControlMode {
  TOUCH = 'TOUCH',
  GESTURE = 'GESTURE'
}