import {
  Pencil,
  Eraser,
  PaintBucket,
  Pipette,
  Check,
  Trash2
} from 'lucide-react';
import { useTools, useDarkMode, usePixelEditor } from '@/hooks';

const Toolbar = () => {
  const { isDarkMode } = useDarkMode();
  const { selectedTool, setSelectedTool } = useTools();
  const { preserveBackground, setPreserveBackground, setStateHistory, setRedoStack, drawGrid, canvas, strokes, backgroundColor, } = usePixelEditor();

  const clearCanvas = () => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    strokes.clear()
    setStateHistory(prev => [...prev, {
      strokes: JSON.parse(JSON.stringify(strokes)),
      backgroundColor: backgroundColor
    }])
    
    setRedoStack([])
    drawGrid()
  }
  
  const tools = [
    { id: 'pencil', icon: <Pencil size={20} />, tooltip: 'Pencil' },
    { id: 'eraser', icon: <Eraser size={20} />, tooltip: 'Eraser' },
    { id: 'fill', icon: <PaintBucket size={20} />, tooltip: 'Fill' },
    { id: 'eyedropper', icon: <Pipette size={20} />, tooltip: 'Color Picker' },
  ];

  return (
    <div>
      <h3 className="text-lg mb-3 text-orange-500 font-bold">Tools</h3>
      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`p-3 flex items-center justify-center rounded-lg transition-all ${
              selectedTool === tool.id
                ? 'bg-orange-500 text-white shadow-inner'
                : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`
            }`}
            onClick={() => setSelectedTool(tool.id)}
            title={tool.tooltip}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      
      {/* Clear Canvas Button */}
      <button
        className={`w-full mt-4 p-2 flex items-center justify-center gap-2 rounded-lg transition-all 
          ${isDarkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-500 hover:bg-red-400'} text-white`}
        onClick={clearCanvas}
        title="Clear Canvas"
      >
        <Trash2 size={18} />
        <span>Clear</span>
      </button>
      
      {/* Preserve Background Color Checkbox */}
      <div className="mt-4">
        <label className={`flex items-center cursor-pointer ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          <div 
            className={`w-5 h-5 mr-2 flex items-center justify-center rounded border ${
              preserveBackground 
                ? 'bg-orange-500 border-orange-500' 
                : `${isDarkMode ? 'border-gray-500' : 'border-gray-400'}`
            }`}
            onClick={() => setPreserveBackground(!preserveBackground)}
          >
            {preserveBackground && <Check size={16} className="text-white" />}
          </div>
          <span className="text-sm">Preserve Background Color</span>
        </label>
      </div>
    </div>
  );
};

export default Toolbar;