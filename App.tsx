import React, { useState } from 'react';
import { 
  RotateCcw, ChevronRight, ChevronLeft, CheckCircle, 
  AlertTriangle, ArrowRight, Settings, BookOpen, 
  MonitorPlay, Zap, Globe, Hand, MousePointer2
} from 'lucide-react';
import Scanner from './components/Scanner';
import Cube3D from './components/Cube3D';
import GestureControl from './components/GestureControl';
import { getSolveSteps } from './services/geminiService';
import { rotateFace } from './services/cubeLogic';
import { AppMode, CubeState, Face, FaceGrid, SolveStep, CubeSize, Language, ControlMode } from './types';
import { FACE_ORDER, FACE_NAMES, getInitialCubeState, LEARN_TOPICS, LANGUAGES, TRANSLATIONS } from './constants';

const App: React.FC = () => {
  // Global State
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [cubeSize, setCubeSize] = useState<CubeSize>(3);
  const [language, setLanguage] = useState<Language>('en');
  
  // Solver State
  const [cubeState, setCubeState] = useState<CubeState>(getInitialCubeState(3));
  const [scanIndex, setScanIndex] = useState(0);
  const [solveSteps, setSolveSteps] = useState<SolveStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Free Play State
  const [controlMode, setControlMode] = useState<ControlMode>(ControlMode.TOUCH);

  const currentScanFace = FACE_ORDER[scanIndex];
  const t = TRANSLATIONS[language];

  // Logic
  const initMode = (targetMode: AppMode, size: CubeSize = 3) => {
    setCubeSize(size);
    setCubeState(getInitialCubeState(size));
    setScanIndex(0);
    setSolveSteps([]);
    setError(null);
    setMode(targetMode);
  };

  const handleFaceCaptured = (colors: FaceGrid) => {
    setCubeState(prev => ({
      ...prev,
      [currentScanFace]: colors
    }));

    if (scanIndex < 5) {
      setScanIndex(prev => prev + 1);
    } else {
      setMode(AppMode.VERIFY);
    }
  };

  const startSolving = async () => {
    setMode(AppMode.SOLVING_LOADING);
    try {
      const steps = await getSolveSteps(cubeState, cubeSize);
      if (steps.length === 0) throw new Error("Could not generate steps.");
      if (steps[0].move === "ERROR" || steps[0].move === "Error") throw new Error(steps[0].description);
      
      setSolveSteps(steps);
      setMode(AppMode.GUIDE);
      setCurrentStepIndex(0);
    } catch (e: any) {
      setError(e.message || "AI failed to find solution.");
      setMode(AppMode.VERIFY);
    }
  };

  const executeMove = (face: Face, clockwise: boolean) => {
    setCubeState(prevState => rotateFace(prevState, face, clockwise, cubeSize));
  };

  const handleGesture = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    // Map gestures to moves (Simplified mapping for demo)
    // Left/Right -> Rotate U Face
    // Up/Down -> Rotate R Face
    if (direction === 'LEFT') executeMove(Face.U, true);
    if (direction === 'RIGHT') executeMove(Face.U, false);
    if (direction === 'UP') executeMove(Face.R, true);
    if (direction === 'DOWN') executeMove(Face.R, false);
  };

  // --- RENDERERS ---

  const renderHome = () => (
    <div className="min-h-screen bg-slate-950 text-white overflow-y-auto pb-10">
      {/* Header */}
      <div className="p-6 pt-10 flex flex-col items-center relative">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
          {t.appTitle}
        </h1>
        <p className="text-slate-400 text-sm">{t.subTitle}</p>
        
        {/* Language Selector */}
        <div className="absolute top-4 right-4">
          <div className="flex gap-2 bg-slate-900 p-1 rounded-full border border-slate-800">
             {LANGUAGES.map(lang => (
               <button 
                 key={lang.code}
                 onClick={() => setLanguage(lang.code)}
                 className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${language === lang.code ? 'bg-blue-600 scale-110 shadow' : 'opacity-50 grayscale'}`}
               >
                 {lang.flag}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Cube Selector */}
      <div className="px-6 mb-8">
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">{t.selectOrder}</h3>
        <div className="grid grid-cols-2 gap-4">
          {[2, 3, 4, 5].map((size) => (
            <button
              key={size}
              onClick={() => setCubeSize(size as CubeSize)}
              className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2
                ${cubeSize === size 
                  ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
            >
              <div className="w-12 h-12 relative pointer-events-none">
                 {/* Mini Cube Visual */}
                 <div className={`grid gap-[1px] w-full h-full p-1
                    ${size === 2 ? 'grid-cols-2' : size === 3 ? 'grid-cols-3' : size === 4 ? 'grid-cols-4' : 'grid-cols-5' }`
                 }>
                   {Array(size*size).fill(0).map((_, i) => (
                     <div key={i} className="bg-blue-500/80 rounded-[1px]" />
                   ))}
                 </div>
              </div>
              <span className={`font-bold ${cubeSize === size ? 'text-blue-400' : 'text-slate-500'}`}>{size}x{size}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Actions */}
      <div className="px-6 space-y-4">
        {/* Solver Card */}
        <button 
          onClick={() => initMode(AppMode.SCAN, cubeSize)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl flex items-center justify-between group shadow-lg shadow-blue-900/20"
        >
          <div className="text-left">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="fill-white" /> {t.aiSolver}
            </h2>
            <p className="text-blue-100 text-sm opacity-90">{t.aiSolverDesc}</p>
          </div>
          <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition">
             <ChevronRight />
          </div>
        </button>

        {/* Play/Gesture Card */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => initMode(AppMode.PLAY, cubeSize)}
            className="bg-slate-800 hover:bg-slate-700 p-5 rounded-2xl text-left transition border border-slate-700"
          >
            <MonitorPlay className="text-emerald-400 mb-3" />
            <div className="font-bold text-lg">{t.freePlay}</div>
            <p className="text-slate-500 text-xs">{t.freePlayDesc}</p>
          </button>

          <button 
            onClick={() => initMode(AppMode.LEARN)}
            className="bg-slate-800 hover:bg-slate-700 p-5 rounded-2xl text-left transition border border-slate-700"
          >
            <BookOpen className="text-purple-400 mb-3" />
            <div className="font-bold text-lg">{t.learn}</div>
            <p className="text-slate-500 text-xs">{t.learnDesc}</p>
          </button>
        </div>
      </div>

      {/* Missing Key Alert */}
      {!process.env.API_KEY && (
         <div className="m-6 p-4 bg-red-900/20 border border-red-500/20 rounded-xl text-center">
            <p className="text-red-400 text-xs font-mono">API_KEY environment variable missing</p>
         </div>
      )}
    </div>
  );

  const renderScan = () => (
    <div className="h-screen flex flex-col bg-black">
      <Scanner 
        currentFace={currentScanFace}
        cubeSize={cubeSize}
        faceName={FACE_NAMES[currentScanFace]}
        onCapture={handleFaceCaptured}
      />
      {/* Progress Dots */}
      <div className="bg-slate-900 py-6 px-4">
        <div className="flex justify-between items-center max-w-xs mx-auto">
          {FACE_ORDER.map((face, idx) => (
            <div key={face} className="flex flex-col items-center gap-1">
              <div 
                className={`w-3 h-3 rounded-full transition-all duration-300 
                  ${idx === scanIndex ? 'bg-white scale-150 shadow-[0_0_10px_white]' : idx < scanIndex ? 'bg-blue-500' : 'bg-slate-700'}
                `}
              />
              <span className={`text-[10px] uppercase font-bold ${idx === scanIndex ? 'text-white' : 'text-slate-600'}`}>
                {face}
              </span>
            </div>
          ))}
        </div>
        <button onClick={() => setMode(AppMode.HOME)} className="mt-4 w-full text-slate-500 text-sm">{t.backHome}</button>
      </div>
    </div>
  );

  const renderVerify = () => (
    <div className="flex flex-col h-screen bg-slate-950 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
          <CheckCircle className="text-green-400" /> {t.verify}
        </h2>
        <span className="bg-slate-800 px-3 py-1 rounded-full text-xs text-slate-400 font-mono">
          {cubeSize}x{cubeSize}
        </span>
      </div>

      <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 mb-6 relative">
        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur px-3 py-1 rounded-lg text-xs text-white">
          Preview
        </div>
        <Cube3D state={cubeState} size={cubeSize} />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-4 text-sm flex gap-3 items-start animate-pulse">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" /> 
          <div>{error}</div>
        </div>
      )}

      <div className="flex gap-4">
        <button 
          onClick={() => initMode(AppMode.SCAN, cubeSize)}
          className="flex-1 py-4 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
        >
          {t.rescan}
        </button>
        <button 
          onClick={startSolving}
          className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg shadow-green-900/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
        >
          {t.solve} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );

  const renderGuide = () => {
    const step = solveSteps[currentStepIndex];
    const isFinished = currentStepIndex >= solveSteps.length;

    if (isFinished) {
      return (
        <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />
          
          <div className="w-28 h-28 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.4)] animate-pulse-fast">
            <CheckCircle size={56} className="text-white" />
          </div>
          
          <h2 className="text-4xl font-black text-white mb-4">{t.solved}</h2>
          
          <button onClick={() => setMode(AppMode.HOME)} className="w-full max-w-sm px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white font-bold transition">
            {t.backHome}
          </button>
        </div>
      );
    }

    return (
      <div className="h-screen bg-slate-950 flex flex-col relative">
        {/* AR Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pointer-events-none">
          <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-white/10">
             <span className="text-green-400 font-mono font-bold">AR MODE</span>
          </div>
        </div>

        {/* Visualizer Area */}
        <div className="flex-1 relative bg-gradient-to-b from-slate-900 to-slate-950">
           <Cube3D state={cubeState} size={cubeSize} />
           
           {/* AR Overlay Text */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
              <div className="text-[120px] font-black text-white/5 select-none leading-none tracking-tighter">
                {step.move}
              </div>
           </div>
        </div>

        {/* Step Controller */}
        <div className="bg-slate-900 border-t border-slate-800 p-6 pb-10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-10">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-blue-400 uppercase bg-blue-500/10 px-2 py-1 rounded">
                  {t.step} {currentStepIndex + 1} / {solveSteps.length}
                </span>
             </div>
             <button onClick={() => setMode(AppMode.HOME)} className="text-slate-500 hover:text-white transition">
                <Settings size={20} />
             </button>
          </div>

          <div className="flex items-start gap-4 mb-8">
            <div className="flex-1">
              <h2 className="text-5xl font-black text-white mb-2">{step.move}</h2>
              <p className="text-lg text-slate-400 leading-snug">{step.description}</p>
            </div>
            {/* Visual Icon for Move Direction (Simplified) */}
            <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
               <RotateCcw className={`text-blue-500 ${step.move.includes("'") ? '' : 'scale-x-[-1]'}`} size={32} />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex === 0}
              className="p-5 rounded-2xl bg-slate-800 disabled:opacity-30 hover:bg-slate-700 transition border border-slate-700"
            >
              <ChevronLeft />
            </button>

            <button 
              onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              {t.nextMove} <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLearn = () => (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setMode(AppMode.HOME)} className="p-2 bg-slate-900 rounded-full hover:bg-slate-800">
          <ChevronLeft />
        </button>
        <h2 className="text-2xl font-bold">{t.learn}</h2>
      </div>

      <div className="space-y-4">
        {LEARN_TOPICS.map((topic) => (
          <div key={topic.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-600 transition cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                topic.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                topic.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {topic.level}
              </span>
              <span className="text-slate-500 text-xs">{topic.duration}</span>
            </div>
            <h3 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition">{topic.title}</h3>
            <p className="text-sm text-slate-400">{topic.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlay = () => (
    <div className="h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Play Header */}
      <div className="absolute top-0 w-full flex items-center justify-between p-4 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => setMode(AppMode.HOME)} className="p-2 bg-slate-800 rounded-full text-white border border-white/10">
          <ChevronLeft size={20} />
        </button>
        
        {/* Mode Toggle */}
        <div className="flex bg-slate-900/80 p-1 rounded-full border border-white/10 backdrop-blur">
          <button 
            onClick={() => setControlMode(ControlMode.TOUCH)}
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${controlMode === ControlMode.TOUCH ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            <MousePointer2 size={12} /> {t.touchControl}
          </button>
          <button 
            onClick={() => setControlMode(ControlMode.GESTURE)}
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${controlMode === ControlMode.GESTURE ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
          >
            <Hand size={12} /> {t.gestureControl}
          </button>
        </div>
      </div>
      
      {/* Main 3D View */}
      <div className="flex-1 relative">
         <Cube3D state={cubeState} size={cubeSize} interactive={controlMode === ControlMode.TOUCH} />
         
         {/* Gesture Cam Overlay */}
         <GestureControl isActive={controlMode === ControlMode.GESTURE} onGesture={handleGesture} />
         
         {/* Touch Controls Overlay */}
         {controlMode === ControlMode.TOUCH && (
           <div className="absolute inset-y-0 right-4 flex flex-col justify-center gap-3 z-10 pointer-events-none">
             {/* Face Rotations */}
             {Object.keys(Face).map((face) => (
                <div key={face} className="flex gap-2 pointer-events-auto">
                   <button 
                    onClick={() => executeMove(face as Face, true)}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded border border-white/10 text-white font-bold text-xs"
                   >
                     {face}
                   </button>
                   <button 
                    onClick={() => executeMove(face as Face, false)}
                    className="w-10 h-10 bg-white/5 hover:bg-white/10 backdrop-blur rounded border border-white/5 text-white/70 font-bold text-xs"
                   >
                     {face}'
                   </button>
                </div>
             ))}
           </div>
         )}
         
         {/* Instructions Toast */}
         <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none">
           <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-full text-xs text-white/80 border border-white/5">
              {controlMode === ControlMode.GESTURE ? t.gestureTip : t.touchTip}
           </div>
         </div>
         
         {/* Reset Bar */}
         <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-6 pointer-events-none">
           <div className="pointer-events-auto bg-slate-900/80 backdrop-blur p-4 rounded-2xl border border-white/10 flex gap-4">
              <button 
                onClick={() => setCubeState(getInitialCubeState(cubeSize))}
                className="flex flex-col items-center gap-1 text-slate-300 hover:text-white px-4"
              >
                <RotateCcw size={20} />
                <span className="text-[10px]">{t.reset}</span>
              </button>
           </div>
         </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
      <div className="relative mb-8">
         <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
         <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{t.calculating}</h3>
      <p className="text-slate-400 text-center max-w-xs leading-relaxed">
        Gemini AI is analyzing your {cubeSize}x{cubeSize} configuration.
      </p>
    </div>
  );

  return (
    <>
      {mode === AppMode.HOME && renderHome()}
      {mode === AppMode.SCAN && renderScan()}
      {mode === AppMode.VERIFY && renderVerify()}
      {mode === AppMode.SOLVING_LOADING && renderLoading()}
      {mode === AppMode.GUIDE && renderGuide()}
      {mode === AppMode.LEARN && renderLearn()}
      {mode === AppMode.PLAY && renderPlay()}
    </>
  );
};

export default App;