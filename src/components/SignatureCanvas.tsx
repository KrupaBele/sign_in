import React, { useRef, useEffect, useState } from "react";
import { Trash2, Check, X, Palette, Type, Edit3, Loader2 } from "lucide-react";

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
  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("draw");
  const [signatureColor, setSignatureColor] = useState("#1e40af");
  const [typedSignature, setTypedSignature] = useState("");
  const [selectedFont, setSelectedFont] = useState("Dancing Script");
  const [isPlacing, setIsPlacing] = useState(false);

  const colors = [
    { name: "Blue", value: "#1e40af" },
    { name: "Black", value: "#000000" },
    { name: "Navy", value: "#1e3a8a" },
    { name: "Green", value: "#059669" },
    { name: "Purple", value: "#7c3aed" },
    { name: "Red", value: "#dc2626" },
  ];

  const fonts = [
    "Dancing Script",
    "Great Vibes",
    "Allura",
    "Alex Brush",
    "Pacifico",
    "Kaushan Script",
    "Satisfy",
    "Caveat",
  ];

  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Allura&family=Alex+Brush&family=Pacifico&family=Kaushan+Script&family=Satisfy&family=Caveat:wght@400;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas
    ctx.strokeStyle = signatureColor;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If in type mode and has typed signature, render it
    if (signatureMode === "type" && typedSignature) {
      renderTypedSignature();
    }
  }, [signatureColor, signatureMode, typedSignature, selectedFont]);

  const renderTypedSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !typedSignature) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set font and color
    ctx.fillStyle = signatureColor;
    ctx.font = `48px "${selectedFont}", cursive`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw the typed signature
    ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);

    setHasSignature(true);
  };

  const getEventPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (signatureMode === "type") return;

    e.preventDefault();
    setIsDrawing(true);
    setHasSignature(true);

    const { x, y } = getEventPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = signatureColor;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (signatureMode === "type") return;

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
    if (signatureMode === "type") return;

    e.preventDefault();
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      setTypedSignature("");
    }
  };

  const handleTypedSignatureChange = (value: string) => {
    setTypedSignature(value);
    if (value.trim()) {
      setHasSignature(true);
    } else {
      setHasSignature(false);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    setIsPlacing(true);
    const signatureData = canvas.toDataURL("image/png", 1.0);
    console.log("Signature saved, data URL length:", signatureData.length);
    onSignatureComplete(signatureData);
  };

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="flex items-center justify-center space-x-4 p-2 bg-gray-100 rounded-lg">
        <button
          onClick={() => {
            setSignatureMode("draw");
            clearSignature();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            signatureMode === "draw"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
          }`}
        >
          <Edit3 className="h-4 w-4" />
          <span>Draw</span>
        </button>
        <button
          onClick={() => {
            setSignatureMode("type");
            clearSignature();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            signatureMode === "type"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
          }`}
        >
          <Type className="h-4 w-4" />
          <span>Type</span>
        </button>
      </div>

      {/* Color Selection */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Palette className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Color:</span>
        </div>
        <div className="flex items-center space-x-2">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => setSignatureColor(color.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                signatureColor === color.value
                  ? "border-gray-800 scale-110"
                  : "border-gray-300 hover:border-gray-500"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Type Mode Controls */}
      {signatureMode === "type" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family:
            </label>
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {fonts.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Signature:
            </label>
            <input
              type="text"
              value={typedSignature}
              onChange={(e) => handleTypedSignatureChange(e.target.value)}
              placeholder="Type your name here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                fontFamily: `"${selectedFont}", cursive`,
                fontSize: "18px",
                color: signatureColor,
              }}
            />
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <p className="text-sm text-gray-600 text-center mb-4">
          {signatureMode === "draw"
            ? "Draw your signature below using your mouse or finger"
            : "Your typed signature will appear below"}
        </p>
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className={`border border-gray-300 rounded-md bg-gray-50 mx-auto block touch-none ${
            signatureMode === "draw" ? "cursor-crosshair" : "cursor-default"
          }`}
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
            {isPlacing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Placing...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Place Signature</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureCanvas;
