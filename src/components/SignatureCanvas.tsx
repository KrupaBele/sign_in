import React, { useRef, useEffect, useState } from "react";
import { Trash2, Check, X } from "lucide-react";

interface SignatureCanvasProps {
  onSignatureComplete: (signatureData: string) => void;
  onCancel: () => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureComplete,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas
    ctx.strokeStyle = "#1e40af";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Fill with white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getEventPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasSignature(true);

    const { x, y } = getEventPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    if (!isDrawing) return;

    const { x, y } = getEventPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    // Ensure we get a high-quality PNG with transparent background
    const signatureData = canvas.toDataURL("image/png", 1.0);
    console.log("Signature saved, data URL length:", signatureData.length);
    onSignatureComplete(signatureData);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <p className="text-sm text-gray-600 text-center mb-4">
          Draw your signature below using your mouse or finger
        </p>
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="border border-gray-300 rounded-md cursor-crosshair bg-white mx-auto block touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={clearSignature}
          disabled={!hasSignature}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>

          <button
            onClick={saveSignature}
            disabled={!hasSignature}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Check className="h-4 w-4" />
            <span>Place Signature</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureCanvas;
