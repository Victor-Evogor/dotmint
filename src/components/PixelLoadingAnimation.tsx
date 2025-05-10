import { useEffect, useState } from 'react';

const PixelLoadingAnimation = ({ isLoading }) => {
  const [frame, setFrame] = useState(0);
  const totalFrames = 8;
  
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % totalFrames);
    }, 150); // Slightly fast animation for retro feel
    
    return () => clearInterval(interval);
  }, [isLoading]);
  
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="flex flex-col items-center p-8 bg-gray-800 border-4 border-gray-700 rounded-xl shadow-pixel">
        <div className="mb-4">
          <div className="w-64 h-16 relative overflow-hidden">
            {/* Pacman-style loading character */}
            <div 
              className="absolute top-0 left-0 w-full h-full grid grid-cols-8 grid-rows-1"
              style={{ transform: `translateX(-${frame * 12.5}%)` }}
            >
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full" style={{
                    clipPath: i % 2 === 0 
                      ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' 
                      : 'polygon(0 0, 100% 50%, 0 100%)'
                  }}></div>
                </div>
              ))}
            </div>
            
            {/* Pixel dots */}
            <div className="absolute top-4 left-0 w-full flex justify-between px-4">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: i <= frame % 5 ? 'transparent' : '#9333ea',
                    opacity: i <= frame % 5 ? 0 : 1
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-white font-pixel text-center">
          <p className="mb-2 text-xl text-orange-500">CONNECTING WALLET</p>
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <span 
                key={i} 
                className="text-purple-500 text-2xl"
                style={{ 
                  opacity: i === frame % 3 ? 1 : 0.3,
                  transition: 'opacity 0.15s ease-in-out'
                }}
              >
                •
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-400">Please confirm in your wallet</p>
        </div>
      </div>
    </div>
  );
};

export default PixelLoadingAnimation;