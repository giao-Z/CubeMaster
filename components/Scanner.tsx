
import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, Check, Grid3X3, Sliders } from 'lucide-react';
import { CubeColor, FaceGrid, Face, CubeSize } from '../types';
import { COLOR_HEX, FACE_CENTER_COLORS } from '../constants';

interface ScannerProps {
  currentFace: Face;
  cubeSize: CubeSize;
  onCapture: (colors: FaceGrid) => void;
  faceName: string;
  neighbors?: { top: CubeColor; bottom: CubeColor; left: CubeColor; right: CubeColor };
  dirNames?: { top: string; bottom: string; left: string; right: string };
  colorNames?: Record<string, string>;
}

const Scanner: React.FC<ScannerProps> = ({ 
  currentFace, 
  cubeSize, 
  onCapture, 
  faceName,
  neighbors,
  dirNames = { top: 'Top', bottom: 'Bottom', left: 'Left', right: 'Right' },
  colorNames = {}
}) => {
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

  // Re-attach stream when video element reappears
  useEffect(() => {
    if (videoRef.current && stream && !capturedImage) {
      videoRef.current.srcObject = stream;
    }
  }, [capturedImage, stream]);

  // --- COLOR DETECTION LOGIC ---
  
  // Convert RGB to HSV for better color segmentation
  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, v * 100];
  };

  const classifyColor = (r: number, g: number, b: number): CubeColor => {
    const [h, s, v] = rgbToHsv(r, g, b);

    // Dynamic thresholds based on common cube sticker colors
    
    // 1. Grayscale Check
    if (s < 15 && v > 40) return 'white'; // White usually has very low saturation
    if (v < 25) return 'gray'; // Too dark

    // 2. Hue Ranges (Optimized)
    // Red spans 0-10 and 340-360.
    if (h >= 0 && h <= 12) return 'red';
    if (h >= 340 && h <= 360) return 'red';
    
    // Orange is often close to Red. 12-45
    if (h > 12 && h <= 45) return 'orange';
    
    // Yellow is bright. 45-80
    if (h > 45 && h <= 80) return 'yellow';
    
    // Green. 80-160
    if (h > 80 && h <= 160) return 'green';
    
    // Blue. 160-260
    if (h > 160 && h <= 260) return 'blue';

    // 3. RGB Fallbacks for ambiguous edges
    // High brightness, low saturation -> White
    if (r > 200 && g > 200 && b > 200 && s < 25) return 'white';
    
    // Yellow vs White: Yellow has high R and G, low B.
    if (r > 180 && g > 180 && b < 100) return 'yellow';
    
    // Orange vs Red: Orange has more Green than Red does.
    if (r > 180 && g > 80 && g < 160 && b < 100) return 'orange';

    return 'white'; // Default safe fallback
  };

  const analyzeColors = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const newColors: FaceGrid = [];
    
    const size = cubeSize;
    const boxSize = Math.min(width, height) * 0.6; 
    const startX = (width - boxSize) / 2;
    const startY = (height - boxSize) / 2;
    const cellSize = boxSize / size;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Sample 5 points per cell (Center + 4 corners of center box) to average
        const cx = Math.floor(startX + col * cellSize + cellSize / 2);
        const cy = Math.floor(startY + row * cellSize + cellSize / 2);
        const offset = Math.floor(cellSize * 0.15);

        // Simple center sampling for now, but averages would be better
        const p = ctx.getImageData(cx, cy, 1, 1).data;
        
        // You could average standard deviation here for robustness
        const color = classifyColor(p[0], p[1], p[2]);
        newColors.push(color);
      }
    }

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
        
        // Draw the current frame
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
      alert("Please fill in all undetected cells manually.");
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

  // Helper component for orientation pill
  const OrientationPill: React.FC<{ dir: string, color: CubeColor, className?: string }> = ({ dir, color, className }) => (
    <div className={`absolute flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg ${className}`}>
      <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: COLOR_HEX[color] }}></div>
      <span className="text-[10px] font-bold text-white/90 uppercase tracking-wide">
        <span className="text-slate-400 mr-1">{dir}:</span> 
        {colorNames[color] || color}
      </span>
    </div>
  );

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
              className={`w-full h-full rounded-sm border transition-all duration-200 active:scale-95 shadow-inner flex items-center justify-center
                ${capturedImage ? 'border-white' : 'border-white/30'}
              `}
              style={{ backgroundColor: COLOR_HEX[color] }}
            >
              {color === 'gray' && <span className="text-white/50 text-[10px] font-bold">?</span>}
            </button>
          ))}
          
          {/* Neighbors Hints - Only show when NOT captured yet */}
          {!capturedImage && neighbors && (
            <>
              {/* Top Neighbor */}
              <OrientationPill 
                dir={dirNames.top} 
                color={neighbors.top} 
                className="-top-12 left-1/2 -translate-x-1/2" 
              />
              {/* Bottom Neighbor */}
              <OrientationPill 
                dir={dirNames.bottom} 
                color={neighbors.bottom} 
                className="-bottom-12 left-1/2 -translate-x-1/2" 
              />
              {/* Left Neighbor */}
              <OrientationPill 
                dir={dirNames.left} 
                color={neighbors.left} 
                className="top-1/2 -left-36 -translate-y-1/2" // Positioned outside grid
              />
               {/* Right Neighbor */}
              <OrientationPill 
                dir={dirNames.right} 
                color={neighbors.right} 
                className="top-1/2 -right-36 -translate-y-1/2" 
              />
            </>
          )}
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
              <span className="text-sm text-gray-400">Tap color circle, then tap grid to fix</span>
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
                  className={`w-10 h-10 shrink-0 rounded-full border-2 transition-transform flex items-center justify-center ${selectedColor === c ? 'scale-110 border-white ring-2 ring-white/50' : 'border-transparent scale-100'}`}
                  style={{ backgroundColor: COLOR_HEX[c] }}
                >
                   {selectedColor === c && <Check size={16} className={c === 'white' || c === 'yellow' ? 'text-black' : 'text-white'} />}
                </button>
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
