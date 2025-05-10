import {useTools} from "@/hooks"


const ColorPalette = () => {
  const { selectedColor, setSelectedColor} = useTools()
  // Pixel art color palette - old school game style
  const colors = [
    '#000000', '#FFFFFF', '#FF004D', '#00E436', 
    '#29ADFF', '#FF77A8', '#FFCCAA', '#FFA300', 
    '#8F974A', '#7E2553', '#83769C', '#5F574F',
    '#C2C3C7', '#FFF1E8', '#FFEC27', '#00B543'
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {colors.map((color) => (
        <button
          key={color}
          className={`w-8 h-8 rounded-lg shadow-pixel ${selectedColor === color ? 'ring-2 ring-white ring-opacity-70' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => setSelectedColor(color)}
          title={color}
        />
      ))}
      <div className="col-span-4 mt-2">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-full h-8 rounded cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ColorPalette;