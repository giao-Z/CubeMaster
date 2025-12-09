
export type CubeColor = 'white' | 'yellow' | 'green' | 'blue' | 'red' | 'orange' | 'gray';

export enum Face {
  U = 'U', // Up (White)
  D = 'D', // Down (Yellow)
  F = 'F', // Front (Green)
  B = 'B', // Back (Blue)
  L = 'L', // Left (Orange)
  R = 'R', // Right (Red)
}

export type FaceGrid = CubeColor[];

export type CubeState = {
  [key in Face]: FaceGrid;
};

export type CubeSize = 2 | 3 | 4 | 5;

export type SolveStep = {
  move: string;
  description: string;
};

export enum AppMode {
  HOME = 'HOME',
  SCAN = 'SCAN',
  VERIFY = 'VERIFY',
  SOLVING_LOADING = 'SOLVING_LOADING',
  GUIDE = 'GUIDE',
  PLAY = 'PLAY',
  LEARN = 'LEARN',
}

export type Language = 'en' | 'zh' | 'es' | 'fr' | 'ru' | 'ar';

export enum ControlMode {
  TOUCH = 'TOUCH',
  GESTURE = 'GESTURE'
}

export interface LearnSection {
  title: string;
  content: string;
  algorithm?: string;
  visual?: 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down';
}

export interface LearnTopic {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  sections: LearnSection[];
}
