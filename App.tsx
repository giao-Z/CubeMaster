
import React, { useState } from 'react';
import { 
  RotateCcw, ChevronRight, ChevronLeft, CheckCircle, 
  AlertTriangle, ArrowRight, Settings, BookOpen, 
  MonitorPlay, Zap, Globe, Hand, MousePointer2, HelpCircle, X, Info,
  ChevronDown
} from 'lucide-react';
import Scanner from './components/Scanner';
import Cube3D from './components/Cube3D';
import GestureControl from './components/GestureControl';
import { getSolveSteps } from './services/geminiService';
import { rotateFace, validateState } from './services/cubeLogic';
import { AppMode, CubeState, Face, FaceGrid, SolveStep, CubeSize, Language, ControlMode, LearnTopic } from './types';
import { FACE_ORDER, getInitialCubeState, LEARN_TOPICS_DATA, LANGUAGES, TRANSLATIONS, MOVE_DESCRIPTIONS_DATA, SCAN_NEIGHBORS } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [cubeSize, setCubeSize] = useState<CubeSize>(3);
  const [language, setLanguage] = useState<Language>('en');
  
  const [cubeState, setCubeState] = useState<CubeState>(getInitialCubeState(3));
  const [scanIndex, setScanIndex] = useState(0);
  const [solveSteps, setSolveSteps] = useState<SolveStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [controlMode, setControlMode] = useState<ControlMode>(ControlMode.TOUCH);
  const [showControlGuide, setShowControlGuide] = useState(false);
  const [showGestureTutorial, setShowGestureTutorial] = useState(false);
  const [pendingMove, setPendingMove] = useState<{face: Face, clockwise: boolean} | null>(null);

  const [selectedTopic, setSelectedTopic] = useState<LearnTopic | null>(null);

  const currentScanFace = FACE_ORDER[scanIndex];
  const t = TRANSLATIONS[language];
  const currentMoveDescriptions = MOVE_DESCRIPTIONS_DATA[language];
  const currentLearnTopics = LEARN_TOPICS_DATA[language];

  const getColorNames = () => ({
    white: t.colorWhite,
    yellow: t.colorYellow,
    green: t.colorGreen,
    blue: t.colorBlue,
    red: t.colorRed,
    orange: t.colorOrange,
  });

  const getFaceName = (face: Face) => {
    switch(face) {
      case Face.U: return t.faceU;
      case Face.D: return t.faceD;
      case Face.F: return t.faceF;
      case Face.B: return t.faceB;
      case Face.L: return t.faceL;
      case Face.R: return t.faceR;
      default: return face;
    }
  };

  const initMode = (targetMode: AppMode, size: CubeSize = 3) => {
    setCubeSize(size);
    setCubeState(getInitialCubeState(size));
    setScanIndex(0);
    setSolveSteps([]);
    setError(null);
    setMode(targetMode);
    setSelectedTopic(null);
    setPendingMove(null);
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
    const validationError = validateState(cubeState, cubeSize, getColorNames());
    if (validationError) {
      setError(`${t.colorCountError} (${validationError})`);
      return;
    }

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

  const handleFreePlayAction = (face: Face, clockwise: boolean) => {
    if (pendingMove && pendingMove.face === face && pendingMove.clockwise === clockwise) {
      executeMove(face, clockwise);
      setPendingMove(null);
    } else {
      setPendingMove({ face, clockwise });
    }
  };

  const handleGesture = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    let face: Face | null = null;
    let cw = true;

    if (direction === 'LEFT') { face = Face.U; cw = true; }
    if (direction === 'RIGHT') { face = Face.U; cw = false; }
    if (direction === 'UP') { face = Face.R; cw = true; }
    if (direction === 'DOWN') { face = Face.R; cw = false; }

    if (face) {
      executeMove(face, cw);
      setPendingMove(null); 
    }
  };

  const renderHome = () => (
    <div className="min-h-screen bg-slate-950 text-white overflow-y-auto pb-10">
      <div className="p-6 pt-10 flex flex-col items-center relative">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
          {t.appTitle}
        </h1>
        <p className="text-slate-400 text-sm">{t.subTitle}</p>
        
        <div className="absolute top-4 right-4 z-50">
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

      <div className="px-6 space-y-4">
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
        faceName={getFaceName(currentScanFace)}
        onCapture={handleFaceCaptured}
        neighbors={SCAN_NEIGHBORS[currentScanFace]}
        dirNames={{ top: t.dirTop, bottom: t.dirBottom, left: t.dirLeft, right: t.dirRight }}
        colorNames={getColorNames()}
        translations={t}
      />
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
          {t.preview}
        </div>
        <Cube3D state={cubeState} size={cubeSize} />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-4 text-sm flex gap-3 items-start animate-pulse">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" /> 
          <div>
            <div className="font-bold mb-1">{t.errorTitle}</div>
            {error}
          </div>
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
    } else if (!step) {
      return null;
    }

    return (
      <div className="h-screen bg-slate-950 flex flex-col relative">
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pointer-events-none">
          <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-white/10">
             <span className="text-green-400 font-mono font-bold">{t.arMode}</span>
          </div>
        </div>

        <div className="flex-1 relative bg-gradient-to-b from-slate-900 to-slate-950">
           <Cube3D state={cubeState} size={cubeSize} />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
              <div className="text-[120px] font-black text-white/5 select-none leading-none tracking-tighter">
                {step.move}
              </div>
           </div>
        </div>

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

  const renderVisualAid = (visual: string) => {
    let animationClass = '';
    let label = '';
    let Icon = Hand;
    
    switch (visual) {
      case 'swipe-up': animationClass = 'animate-swipe-up'; label = 'Swipe UP (Wrist)'; break;
      case 'swipe-down': animationClass = 'animate-swipe-down'; label = 'Swipe DOWN (Wrist)'; break;
      case 'swipe-left': animationClass = 'animate-swipe-left'; label = 'Push Left (Index)'; break;
      case 'swipe-right': animationClass = 'animate-swipe-right'; label = 'Push Right (Index)'; break;
      default: return null;
    }

    return (
      <div className="bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner flex flex-col items-center gap-2 mb-4">
         <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
            <Icon className={`text-blue-400 ${animationClass}`} size={32} />
         </div>
         <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{label}</span>
      </div>
    );
  };

  const renderLearn = () => {
    if (selectedTopic) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
          <div className="p-6 pb-4 border-b border-white/10 sticky top-0 bg-slate-950/90 backdrop-blur z-30">
            <button 
              onClick={() => setSelectedTopic(null)} 
              className="flex items-center gap-1 text-slate-400 hover:text-white mb-3 text-sm font-medium"
            >
              <ChevronLeft size={16} /> {t.learn}
            </button>
            <h1 className="text-2xl font-bold mb-2 leading-tight">{selectedTopic.title}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
               <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded uppercase font-bold tracking-wide">{selectedTopic.level}</span>
               <span>•</span>
               <span>{selectedTopic.duration}</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-2xl mx-auto w-full">
             {(!selectedTopic.sections || selectedTopic.sections.length === 0) ? (
                <div className="text-center text-slate-500 py-20">
                   <p>{t.comingSoon}</p>
                </div>
             ) : (
               selectedTopic.sections.map((section, idx) => (
                 <div key={idx} className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 relative">
                    <div className="absolute top-6 left-0 w-1 h-8 bg-blue-500 rounded-r-full" />
                    <h3 className="text-lg font-bold text-white mb-3 ml-2">
                       {section.title}
                    </h3>
                    {section.visual && renderVisualAid(section.visual)}
                    <p className="text-slate-300 leading-relaxed mb-4 text-sm whitespace-pre-line">{section.content}</p>
                    {section.algorithm && (
                       <div className="bg-black/40 p-4 rounded-xl font-mono text-center border border-white/5 shadow-inner">
                          <span className="text-blue-400 block text-[10px] uppercase tracking-widest mb-1 font-bold">{t.algorithm}</span>
                          <span className="text-lg tracking-wide font-bold text-white whitespace-pre-line">{section.algorithm}</span>
                       </div>
                    )}
                 </div>
               ))
             )}
             <div className="h-20" /> 
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setMode(AppMode.HOME)} className="p-2 bg-slate-900 rounded-full hover:bg-slate-800 border border-slate-800">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold">{t.learn}</h2>
        </div>

        <div className="space-y-4">
          {currentLearnTopics.map((topic) => (
            <div 
              key={topic.id} 
              onClick={() => setSelectedTopic(topic)}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-600 transition cursor-pointer group hover:bg-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                 <BookOpen size={64} />
              </div>
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  topic.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                  topic.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {topic.level}
                </span>
                <span className="text-slate-500 text-xs">{topic.duration}</span>
              </div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition relative z-10">{topic.title}</h3>
              <p className="text-sm text-slate-400 relative z-10">{topic.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGestureTutorial = () => (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-sm w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">{t.gestureTutorialTitle}</h3>
          <button onClick={() => setShowGestureTutorial(false)} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-8">{t.gestureTutorialDesc}</p>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden">
               <Hand className="text-blue-400 animate-swipe-up" size={32} />
               <div className="absolute inset-x-0 bottom-2 text-[10px] text-slate-500 font-mono">SWIPE UP</div>
            </div>
            <div className="text-xs text-white font-bold flex items-center gap-1">
              <RotateCcw size={12} className="text-red-400 rotate-90" />
              R (Right Up)
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden">
               <Hand className="text-blue-400 animate-swipe-down" size={32} />
               <div className="absolute inset-x-0 top-2 text-[10px] text-slate-500 font-mono">SWIPE DOWN</div>
            </div>
             <div className="text-xs text-white font-bold flex items-center gap-1">
              <RotateCcw size={12} className="text-red-400 -rotate-90" />
              R' (Right Down)
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden">
               <Hand className="text-blue-400 animate-swipe-left" size={32} />
               <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono rotate-90">LEFT</div>
            </div>
            <div className="text-xs text-white font-bold flex items-center gap-1">
               <RotateCcw size={12} className="text-white" />
               U (Top Left)
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden">
               <Hand className="text-blue-400 animate-swipe-right" size={32} />
               <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono -rotate-90">RIGHT</div>
            </div>
            <div className="text-xs text-white font-bold flex items-center gap-1">
               <RotateCcw size={12} className="text-white scale-x-[-1]" />
               U' (Top Right)
            </div>
          </div>
        </div>
        <div className="bg-blue-500/10 p-4 rounded-xl text-left border border-blue-500/20 mb-6">
          <h4 className="text-blue-300 text-xs font-bold uppercase mb-1 flex items-center gap-2">
            <Info size={12} /> {t.howItWorks}
          </h4>
          <p className="text-[11px] text-blue-100/70 leading-relaxed">
            {t.howItWorksDesc}
          </p>
        </div>
        <button 
          onClick={() => setShowGestureTutorial(false)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition"
        >
          {t.gotIt}
        </button>
      </div>
    </div>
  );

  const renderPlay = () => (
    <div className="h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 w-full flex items-center justify-between p-4 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => setMode(AppMode.HOME)} className="p-2 bg-slate-800 rounded-full text-white border border-white/10">
          <ChevronLeft size={20} />
        </button>
        <div className="flex bg-slate-900/80 p-1 rounded-full border border-white/10 backdrop-blur shadow-lg">
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

      {showGestureTutorial && renderGestureTutorial()}
      
      <div className="flex-1 relative">
         <Cube3D 
           state={cubeState} 
           size={cubeSize} 
           interactive={controlMode === ControlMode.TOUCH} 
           pendingMove={pendingMove}
         />
         
         {controlMode === ControlMode.GESTURE && (
           <>
              <GestureControl isActive={true} onGesture={handleGesture} />
              <div className="absolute top-20 right-4 z-20">
                <button 
                  onClick={() => setShowGestureTutorial(true)}
                  className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg shadow-purple-900/50 animate-bounce"
                >
                  <HelpCircle size={20} />
                </button>
              </div>
           </>
         )}
         
         {controlMode === ControlMode.TOUCH && (
           <>
            <div className="absolute top-20 right-4 z-20">
              <button 
                onClick={() => setShowControlGuide(!showControlGuide)} 
                className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white/70 hover:text-white border border-white/10"
              >
                {showControlGuide ? <X size={16}/> : <HelpCircle size={16} />}
              </button>
            </div>

            {showControlGuide && (
              <div className="absolute top-32 right-4 w-64 bg-slate-900/95 backdrop-blur-xl p-4 rounded-xl border border-white/10 z-20 text-xs text-slate-300 shadow-xl animate-fade-in">
                 <h4 className="font-bold text-white mb-3 pb-2 border-b border-white/10 flex justify-between">
                    <span>{t.controlsGuide || 'Controls Guide'}</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded">{t.controlsDesc || 'Notation'}</span>
                 </h4>
                 <div className="space-y-3">
                   {['U', 'D', 'R', 'L', 'F', 'B'].map((baseKey) => {
                     const primeKey = `${baseKey}'`;
                     const desc = currentMoveDescriptions[baseKey];
                     const descPrime = currentMoveDescriptions[primeKey];
                     if (!desc) return null;
                     return (
                        <div key={baseKey} className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0">
                           <div className="flex items-center justify-between">
                              <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-1.5 rounded w-8 text-center">{baseKey}</span>
                              <span className="text-right text-[10px] text-white/90">{desc}</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="font-mono text-red-400 font-bold bg-red-500/10 px-1.5 rounded w-8 text-center">{primeKey}</span>
                              <span className="text-right text-[10px] text-white/70">{descPrime}</span>
                           </div>
                        </div>
                     );
                   })}
                 </div>
              </div>
            )}

            <div className="absolute inset-y-0 right-4 flex flex-col justify-center gap-3 z-10 pointer-events-none">
               {Object.keys(Face).map((face) => {
                 const isPendingCW = pendingMove?.face === face && pendingMove?.clockwise === true;
                 const isPendingCCW = pendingMove?.face === face && pendingMove?.clockwise === false;

                 return (
                  <div key={face} className="flex gap-2 pointer-events-auto group relative">
                     <button 
                      onClick={() => handleFreePlayAction(face as Face, true)}
                      className={`w-10 h-10 backdrop-blur rounded border font-bold text-xs shadow-sm transition-all duration-300
                         ${isPendingCW 
                            ? 'bg-yellow-500 text-black border-yellow-400 scale-110 shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                            : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                         }`}
                     >
                       {face}
                     </button>
                     <button 
                      onClick={() => handleFreePlayAction(face as Face, false)}
                      className={`w-10 h-10 backdrop-blur rounded border font-bold text-xs shadow-sm transition-all duration-300
                         ${isPendingCCW 
                            ? 'bg-yellow-500 text-black border-yellow-400 scale-110 shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                            : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                         }`}
                     >
                       {face}'
                     </button>
                  </div>
                 );
               })}
            </div>
           </>
         )}
      </div>
    </div>
  );

  return (
    <div className="font-sans select-none">
      {mode === AppMode.HOME && renderHome()}
      {mode === AppMode.SCAN && renderScan()}
      {mode === AppMode.VERIFY && renderVerify()}
      {mode === AppMode.SOLVING_LOADING && (
         <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">{t.calculating}</h2>
            <p className="text-slate-400 text-sm">AI is analyzing {cubeSize}x{cubeSize} matrix...</p>
         </div>
      )}
      {mode === AppMode.GUIDE && renderGuide()}
      {mode === AppMode.PLAY && renderPlay()}
      {mode === AppMode.LEARN && renderLearn()}
    </div>
  );
};

export default App;
