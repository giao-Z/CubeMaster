import React, { useRef, useEffect, useState } from 'react';
import { Camera, Hand, Move } from 'lucide-react';

interface GestureControlProps {
  onGesture: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  isActive: boolean;
}

const GestureControl: React.FC<GestureControlProps> = ({ onGesture, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const lastFrameData = useRef<Uint8ClampedArray | null>(null);
  const lastGestureTime = useRef<number>(0);

  // Dragging State
  const [position, setPosition] = useState({ x: window.innerWidth - 120, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const boxStartRef = useRef({ x: 0, y: 0 });

  // Constants for optical flow
  const SAMPLE_SIZE = 32; // Low res for performance
  const THRESHOLD = 30; // Brightness diff threshold
  const MOVE_THRESHOLD = 2; // Movement sensitivity
  const COOLDOWN = 1000; // ms between gestures

  useEffect(() => {
    // Reset position on mount if needed, or keep persistent if moved to parent
    setPosition({ x: window.innerWidth - 120, y: 80 });
  }, []);

  useEffect(() => {
    if (!isActive) return;

    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 128, 
            height: 128, 
            frameRate: 15,
            facingMode: 'user' 
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
          detectMotion();
        }
      } catch (err) {
        console.error("Gesture Camera Error:", err);
      }
    };

    const detectMotion = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        // Draw small frame
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;
        // Mirror the image
        ctx.translate(SAMPLE_SIZE, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

        const imageData = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        const data = imageData.data;

        if (lastFrameData.current) {
          let dx = 0;
          let dy = 0;
          let changeCount = 0;

          // Simple center of mass of changes
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const prevAvg = (lastFrameData.current[i] + lastFrameData.current[i + 1] + lastFrameData.current[i + 2]) / 3;

            if (Math.abs(avg - prevAvg) > THRESHOLD) {
              const pixelIdx = i / 4;
              const x = pixelIdx % SAMPLE_SIZE;
              const y = Math.floor(pixelIdx / SAMPLE_SIZE);
              
              // Add deviation from center
              dx += (x - SAMPLE_SIZE / 2);
              dy += (y - SAMPLE_SIZE / 2);
              changeCount++;
            }
          }

          if (changeCount > 5) {
             // Calculate velocity vector
             const vx = dx / changeCount;
             const vy = dy / changeCount;
             
             const now = Date.now();
             if (now - lastGestureTime.current > COOLDOWN) {
               if (Math.abs(vx) > Math.abs(vy)) {
                 if (Math.abs(vx) > MOVE_THRESHOLD) {
                   onGesture(vx > 0 ? 'RIGHT' : 'LEFT');
                   lastGestureTime.current = now;
                 }
               } else {
                 if (Math.abs(vy) > MOVE_THRESHOLD) {
                   onGesture(vy > 0 ? 'DOWN' : 'UP'); // Y grows down
                   lastGestureTime.current = now;
                 }
               }
             }
          }
        }
        lastFrameData.current = data;
      }

      animationFrameId = requestAnimationFrame(detectMotion);
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isActive, onGesture]);

  // Pointer Events for Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    boxStartRef.current = { ...position };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    // Boundary checks (Assuming 96px width/height for the box)
    const boxSize = 96;
    const maxX = window.innerWidth - boxSize;
    const maxY = window.innerHeight - boxSize;

    const newX = Math.min(Math.max(0, boxStartRef.current.x + dx), maxX);
    const newY = Math.min(Math.max(0, boxStartRef.current.y + dy), maxY);

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  if (!isActive) return null;

  return (
    <div 
      className={`absolute w-24 h-24 bg-black/50 rounded-lg overflow-hidden border border-white/20 z-50 touch-none select-none shadow-xl backdrop-blur-sm transition-shadow ${isDragging ? 'shadow-blue-500/50 cursor-grabbing' : 'cursor-grab'}`}
      style={{ left: position.x, top: position.y }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-50 transform scale-x-[-1] pointer-events-none" />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Center Status Icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         {hasPermission ? (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
         ) : (
            <Camera className="text-white/50" size={16} />
         )}
      </div>

      {/* Drag Handle Indicator */}
      <div className="absolute top-1 right-1 pointer-events-none text-white/50">
        <Move size={12} />
      </div>

      <div className="absolute bottom-1 w-full text-center text-[8px] text-white/70 bg-black/40 pointer-events-none">
        Gesture Cam
      </div>
    </div>
  );
};

export default GestureControl;