import { useContext } from "react";
import AppContext from "./AppContext";
import { PIXEL_SIZE } from "@/constants"

const useAppContext = () => {
  if (!AppContext) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const useDarkMode = () => {
  const { isDarkMode, setIsDarkMode } = useAppContext();
  return { isDarkMode, setIsDarkMode };
};

export const useTools = () => {
  const { selectedTool, selectedColor, setSelectedColor, setSelectedTool } =
    useAppContext();
  return { selectedTool, selectedColor, setSelectedColor, setSelectedTool };
};

export const usePixelEditor = () => {
  const {
    selectedColor,
    backgroundColor,
    currentColor,
    setCurrentColor,
    setPreserveBackground,
    preserveBackground,
    selectedTool,
    setSelectedTool,
    setBackgroundColor,
    stateHistory,
    strokes,
    redoStack,
    setRedoStack,
    setStateHistory,
    setStrokes,
    setSelectedColor,
    canvas, 
    setCanvas
  } = useAppContext();


// Draw grid on canvas
const drawGrid = () => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1;

  // Draw vertical lines
  for (let x = 0; x <= canvas.width; x += PIXEL_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = 0; y <= canvas.height; y += PIXEL_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
};


/**
 * Loads a dataset to the canvas element.
 *
 * @param ctx - The canvas element to load the dataset to.
 * @param dataset - The dataset to be loaded. It should be an array of objects with the following structure:
 *                  { color: string, position: number[] }
 *                  - color: The color of the dataset.
 *                  - position: The position of the dataset as an array of numbers.
 * @returns void
 */
function loadDataSet(
  dataset: { position: [number, number], color: string }[],
): void {
  if (!canvas) return
  const ctx = canvas.getContext("2d")!
  strokes.clear()
  const refinedDatatset = dataset.map<{ position: [number, number], color: string }>(point => {
    return {
      color: point.color,
      position: [point.position[0] * 20, point.position[1] * 20]
    }
  })
  for (const point of refinedDatatset) {
    ctx.fillStyle = point.color
    ctx.fillRect(point.position[0], point.position[1], 20, 20)
    strokes.push(point)
  }

}

  return {
    selectedColor,
    backgroundColor,
    currentColor,
    setCurrentColor,
    setPreserveBackground,
    preserveBackground,
    selectedTool,
    setSelectedTool,
    setBackgroundColor,
    stateHistory,
    strokes,
    redoStack,
    setRedoStack,
    setStateHistory,
    setStrokes,
    setSelectedColor,
    canvas,
    setCanvas,
    drawGrid,
    loadDataSet
  };
};

export const useUserDB = () => {
  const {userDB, setUserDB} = useAppContext()
  return {userDB, setUserDB}
}