import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, Check, Grid3X3, Sliders } from 'lucide-react';
import { CubeColor, FaceGrid, Face, CubeSize } from '../types';
import { COLOR_HEX, FACE_CENTER_COLORS } from '../constants';

interface ScannerProps {
  currentFace: Face;
  cubeSize: CubeSize;
  onCapture: (colors: FaceGrid) => void;
  faceName: string;
}

const Scanner: React.FC<ScannerProps> = ({ currentFace, cubeSize, onCapture, faceName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedColors, setDetectedColors] = useState<FaceGrid>([]);
  const [selectedColor, setSelectedColor] = useState<CubeColor | null>(null);

  // Initialize Detection Array based on size
  useEffect(() => {
    setDetectedColors(Array(cubeSize * cubeSize).fill('gray'));
  }, [cubeSize, currentFace]);

  // Initialize Camera
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        setStream(currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const analyzeColors = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Simulation: Pre-fill with "likely" colors (just center color for now for UX simplicity)
    // In a real app with OpenCV, we would slice the image into (size x size) grids and avg color.
    const centerColor = FACE_CENTER_COLORS[currentFace];
    // For even cubes (2x2, 4x4) where center doesn't exist technically, we guess based on standard orientation
    // or just default to gray to force user input.
    const fill = (cubeSize % 2 !== 0) ? centerColor : 'gray';
    const newColors: FaceGrid = Array(cubeSize * cubeSize).fill(fill);
    setDetectedColors(newColors);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        analyzeColors(ctx, canvas.width, canvas.height);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setDetectedColors(Array(cubeSize * cubeSize).fill('gray'));
  };

  const handleGridClick = (index: number) => {
    if (selectedColor && capturedImage) {
      const newColors = [...detectedColors];
      newColors[index] = selectedColor;
      setDetectedColors(newColors);
    }
  };

  const handleConfirm = () => {
    // Validate that no gray remains
    if (detectedColors.includes('gray')) {
      alert("Please fill in all colors.");
      return;
    }
    onCapture(detectedColors);
    handleRetake();
  };

  // Dynamic Grid Class
  const getGridClass = () => {
    switch(cubeSize) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      default: return 'grid-cols-3';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-black relative">
      {/* Header Info */}
      <div className="absolute top-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-medium shadow-lg flex items-center gap-2">
          <Grid3X3 size={16} className="text-blue-400" />
          <span>Scanning {cubeSize}x{cubeSize}: <span className="text-yellow-400">{faceName}</span></span>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-900">
        
        {!capturedImage && (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        )}

        {capturedImage && (
          <img 
            src={capturedImage} 
            alt="Captured Face" 
            className="absolute inset-0 w-full h-full object-cover blur-sm brightness-50"
          />
        )}

        {/* Dynamic Grid Overlay */}
        <div className={`relative z-10 w-72 h-72 lg:w-96 lg:h-96 grid gap-1 p-2 border-2 border-white/30 rounded-lg bg-black/10 backdrop-blur-[2px] ${getGridClass()}`}>
          {detectedColors.map((color, idx) => (
            <button
              key={idx}
              onClick={() => handleGridClick(idx)}
              className={`w-full h-full rounded-sm border transition-all duration-200 active:scale-95 shadow-inner
                ${capturedImage ? 'border-white' : 'border-white/30'}
              `}
              style={{ backgroundColor: COLOR_HEX[color] }}
            >
              {/* Optional: Center dot for odd cubes */}
              {cubeSize % 2 !== 0 && idx === Math.floor((cubeSize * cubeSize) / 2) && (
                <div className="w-1.5 h-1.5 bg-black/50 rounded-full mx-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Area */}
      <div className="bg-dark-card border-t border-white/10 p-4 pb-8 space-y-4">
        
        {/* Capture Mode Controls */}
        {!capturedImage ? (
          <div className="flex flex-col items-center gap-4">
             <p className="text-gray-400 text-sm">Align the {cubeSize}x{cubeSize} face within the grid</p>
             <button 
                onClick={handleCapture}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
             >
               <div className="w-12 h-12 bg-white rounded-full" />
             </button>
          </div>
        ) : (
          /* Validation Mode Controls */
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm text-gray-400">Select color below to fix cells</span>
              <button onClick={handleRetake} className="text-xs text-red-400 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded">
                <RefreshCw size={12} /> Retake
              </button>
            </div>

            {/* Color Palette */}
            <div className="flex justify-between gap-1 overflow-x-auto pb-2">
              {(Object.keys(COLOR_HEX) as CubeColor[]).filter(c => c !== 'gray').map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-10 h-10 shrink-0 rounded-full border-2 transition-transform ${selectedColor === c ? 'scale-110 border-white ring-2 ring-white/50' : 'border-transparent scale-100'}`}
                  style={{ backgroundColor: COLOR_HEX[c] }}
                />
              ))}
            </div>

            <button 
              onClick={handleConfirm}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              <Check size={20} /> Confirm Face
            </button>
          </div>
        )}
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Scanner;
