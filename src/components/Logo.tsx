import React from 'react';
import dotmintGif from "@/assets/dotmint.gif";

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-lg relative overflow-hidden">
        <img 
          src={dotmintGif} 
          alt="DotMint Logo" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-2xl font-bold">
        <span className="text-orange-500">Dot</span>
        <span className="text-purple-500">Mint</span>
      </div>
    </div>
  );
};

export default Logo;