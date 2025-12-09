import React, { useRef, useEffect, useState } from 'react';
import { Camera, Hand } from 'lucide-react';

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

  // Constants for optical flow
  const SAMPLE_SIZE = 32; // Low res for performance
  const THRESHOLD = 30; // Brightness diff threshold
  const MOVE_THRESHOLD = 2; // Movement sensitivity
  const COOLDOWN = 1000; // ms between gestures

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

  if (!isActive) return null;

  return (
    <div className="absolute top-4 right-4 w-24 h-24 bg-black/50 rounded-lg overflow-hidden border border-white/20 z-50">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-50 transform scale-x-[-1]" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         {hasPermission ? (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
         ) : (
            <Camera className="text-white/50" size={16} />
         )}
      </div>
      <div className="absolute bottom-1 w-full text-center text-[8px] text-white/70 bg-black/40">
        Gesture Cam
      </div>
    </div>
  );
};

export default GestureControl;