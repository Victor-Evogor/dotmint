import {
  useEffect,
  useRef,
  MouseEventHandler,
  useState,
  MouseEvent,
} from "react";
import { usePixelEditor } from "@/hooks";
import { CANVAS_SIZE, PIXEL_SIZE } from "@/constants";

const PixelEditor = () => {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    selectedTool,
    backgroundColor,
    
    selectedColor,
    setCanvas,
    canvas,
    setStateHistory,
    setRedoStack,
    strokes,
    
    setBackgroundColor,
    setSelectedColor,
    drawGrid
  } = usePixelEditor();
  const [isDrawing, setIsDrawing] = useState(false);
  const [didMove, setDidMove] = useState(false);
  const [, setDrawingPoints] = useState<{position: [number, number], color: string}[]>([]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      setCanvas(canvas);
    }
  }, [canvasRef, setCanvas]);

  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    // Set white background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    // Initialize history
    saveState();
  }, [canvas]);

  // Start drawing
  

  const pickColor = (e: MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>) => {
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE) * PIXEL_SIZE;
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE) * PIXEL_SIZE;
    
    const selectedPixel = strokes.find(stroke => 
      stroke.position[0] === x && stroke.position[1] === y
    );
    
    if (selectedPixel) {
      setSelectedColor(selectedPixel.color);
    }
  };

  // Track which pixels have already been drawn in the current drawing session
  // to prevent duplicate entries for the same pixel
  const drawnPixels = useRef(new Set<string>());

  // Main drawing function
  const draw = (
    event: MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) => {
    if (!canvas) return;
    if (!isDrawing) return;
    const ctx = canvas.getContext("2d")!;
    if (selectedTool === "eyedropper") {
      pickColor(event)
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / PIXEL_SIZE) * PIXEL_SIZE;
    const y = Math.floor((event.clientY - rect.top) / PIXEL_SIZE) * PIXEL_SIZE;
    const pixelKey = `${x},${y}`;

    if (selectedTool === "fill") {
      if (!strokes.isPositionExist(x, y)) {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setBackgroundColor(selectedColor);
        
        for (const point of strokes) {
          ctx.fillStyle = point.color;
          ctx.fillRect(
            point.position[0],
            point.position[1],
            PIXEL_SIZE,
            PIXEL_SIZE
          );
        }
        drawGrid();
        setDrawingPoints([]);
        saveState();
        return;
      }
    } else if (selectedTool === "eraser") {
      // Skip if already erased this pixel in current drawing
      if (drawnPixels.current.has(pixelKey)) return;
      
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
      if (strokes.isPositionExist(x, y)) {
        strokes.deleteByPosition(x, y);
      }
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
      
      // Add to current drawing session
      drawnPixels.current.add(pixelKey);
      return;
    } else {
      // Skip if already drawn this pixel in current drawing
      if (drawnPixels.current.has(pixelKey)) return;
      
      ctx.fillStyle = selectedColor;
      ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
      
      // Redraw grid lines for the affected cell
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
      
      strokes.push({
        color: selectedColor,
        position: [x, y],
      });
      
      // Add to current drawing session
      drawnPixels.current.add(pixelKey);
    }
  };

  const saveState = () => {
    setStateHistory((prev) => {
      const newHistory = [
        ...prev,
        {
          strokes: JSON.parse(JSON.stringify(strokes)),
          backgroundColor,
        },
      ];
      // Limit history size to prevent memory issues
      if (newHistory.length > 30) {
        return newHistory.slice(newHistory.length - 30);
      }
      return newHistory;
    });
    // Clear redo stack when a new action is performed
    setRedoStack([]);
  };

  const handleMouseDown: MouseEventHandler<HTMLCanvasElement> = (e) => {
    setIsDrawing(true);
    setDidMove(false);
    // Clear the set of drawn pixels for new drawing session
    drawnPixels.current.clear();
    // Start drawing at initial point
    draw(e);
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      // Save state if we were drawing and left the canvas
      saveState();
    }
    setIsDrawing(false);
  };

  const handleClick: MouseEventHandler<HTMLCanvasElement> = (e) => {
    setIsDrawing(true);
    drawnPixels.current.clear();
    draw(e);
    saveState();
    setIsDrawing(false);
  };

  const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!isDrawing) return;
    setDidMove(true);
    draw(e);
  };

  const handleMouseUp: MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (isDrawing) {
      if (!didMove) {
        // Handle as a click if mouse didn't move
        handleClick(e);
      } else {
        // Save state at the end of a drag operation
        saveState();
      }
    }
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative shadow-lg">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          className="cursor-crosshair border-2 border-gray-300 dark:border-gray-700"
        />
      </div>
    </div>
  );
};

export default PixelEditor;