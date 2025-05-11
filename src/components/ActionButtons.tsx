import { useState, useEffect } from 'react';
import { Download, Rocket, X, Copy, Check } from 'lucide-react';
import { useAuthModal, usePixelEditor } from "@/hooks";
import { PIXEL_SIZE } from "@/constants";
import { useUser } from "@civic/auth-web3/react"
import { compressJsonToUrlSafe } from "@/utils/jsonCompressor"

const ActionButtons = () => {
  const { canvas, preserveBackground, backgroundColor, strokes } = usePixelEditor();
  const [showMintModal, setShowMintModal] = useState(false);
  const [showPumpModal, setShowPumpModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState(`${window.location.protocol}//${window.location.hostname}`)
  const [isCopied, setIsCopied] = useState(false);
  const [pumpFormData, setPumpFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "",
    amount: 0.0,
    slippage: 10,
  });
  const {authStatus} = useUser()
  const {setShowAuthModal} = useAuthModal()

  useEffect(() => {
    if (showShareModal){
      const url = compressJsonToUrlSafe(strokes)
      setShareLink(`${window.location.protocol}//${window.location.hostname}/?data=${url}`)
    }
  }, [showShareModal])

  // Function to get the canvas as a blob
  const getCanvasBlob = async (): Promise<Blob | null> => {
    if (!canvas) return null;
    
    // Create a temporary canvas without grid lines
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
  
    if (!tempCtx) return null;
  
    // Fill with background if preserving background
    if (preserveBackground) {
      tempCtx.fillStyle = backgroundColor;
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }
  
    // Draw all strokes
    for (const point of strokes) {
      tempCtx.fillStyle = point.color;
      tempCtx.fillRect(point.position[0], point.position[1], PIXEL_SIZE, PIXEL_SIZE);
    }

    return new Promise(resolve => {
      tempCanvas.toBlob(blob => {
        resolve(blob);
      });
    });
  };

  const saveImage = () => {
    if (!canvas) return;
    // Create a temporary canvas without grid lines
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
  
    if (!tempCtx) return;
  
    // Fill with white background if not preserving background
    if (preserveBackground) {
      tempCtx.fillStyle = backgroundColor;
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }
  
    // Draw all strokes
    for (const point of strokes) {
      tempCtx.fillStyle = point.color;
      tempCtx.fillRect(point.position[0], point.position[1], PIXEL_SIZE, PIXEL_SIZE);
    }
  
    // Create download link
    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = tempCanvas.toDataURL();
    link.click();
  };

  const handlePumpSubmit = async () => {
    try {
      const blob = await getCanvasBlob();
      if (!blob) return;
      
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("name", pumpFormData.name);
      formData.append("symbol", pumpFormData.symbol);
      formData.append("description", pumpFormData.description);
      formData.append("twitter", pumpFormData.twitter);
      formData.append("telegram", pumpFormData.telegram);
      formData.append("website", pumpFormData.website);
      formData.append("showName", "true");
      
      // Placeholder for the actual API call
      console.log("Submitting to pump.fun:", formData);
      
      // Close modal after submission
      setShowPumpModal(false);
      
    } catch (error) {
      console.error("Error launching on pump.fun:", error);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLaunchClick = () => {
    if (authStatus !== "authenticated"){
      setShowAuthModal(true);
      return
    }
    setShowPumpModal(true)
  }

  return (
    <>
      <button className="flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-pixel transition-all" onClick={saveImage}>
        <Download size={18} />
        Download Artwork
      </button>
      
      <button 
        className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-pixel transition-all"
        onClick={() => setShowMintModal(true)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
        </svg>
        Mint as NFT
      </button>
      
      <button 
        className="flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-pixel transition-all"
        onClick={handleLaunchClick}
      >
        <Rocket size={18} />
        Launch on pump.fun
      </button>
      
      <button 
        className="flex items-center justify-center gap-2 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-pixel transition-all"
        onClick={() => setShowShareModal(true)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 8L18 6L22 2M16 2H22V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Share Creation
      </button>

      {/* Mint NFT Modal */}
      {showMintModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div className="bg-gray-800 border-4 border-gray-600 rounded-lg p-6 w-full max-w-md relative shadow-pixel-lg" style={{ imageRendering: 'pixelated' }}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">Mint as NFT</h2>
              <button 
                onClick={() => setShowMintModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gray-700 rounded-lg border-2 border-gray-600">
                <p className="text-yellow-300 text-center mb-4">Coming Soon!</p>
                <p className="text-gray-300">NFT minting functionality will be available in the next update. Stay tuned for this exciting feature!</p>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => setShowMintModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded shadow-pixel transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Launch on pump.fun Modal */}
      {showPumpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div className="bg-gray-800 border-4 border-gray-600 rounded-lg p-6 w-full max-w-md relative shadow-pixel-lg overflow-y-auto max-h-screen" style={{ imageRendering: 'pixelated' }}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">Launch on pump.fun</h2>
              <button 
                onClick={() => setShowPumpModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Token Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  value={pumpFormData.name}
                  onChange={(e) => setPumpFormData({...pumpFormData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Symbol</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  value={pumpFormData.symbol}
                  onChange={(e) => setPumpFormData({...pumpFormData, symbol: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Description</label>
                <textarea 
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  rows={3}
                  value={pumpFormData.description}
                  onChange={(e) => setPumpFormData({...pumpFormData, description: e.target.value})}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Twitter URL</label>
                <input 
                  type="url" 
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  value={pumpFormData.twitter}
                  onChange={(e) => setPumpFormData({...pumpFormData, twitter: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Telegram URL</label>
                <input 
                  type="url" 
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  value={pumpFormData.telegram}
                  onChange={(e) => setPumpFormData({...pumpFormData, telegram: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Website URL</label>
                <input 
                  type="url" 
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  value={pumpFormData.website}
                  onChange={(e) => setPumpFormData({...pumpFormData, website: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Initial Dev Buy (SOL)</label>
                <input
                type='number' 
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  // value={pumpFormData.telegram}
                  min={0}
                  onChange={(e) => setPumpFormData({...pumpFormData, amount: +e.target.value})}
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Slippage</label>
                <input
                type='number' 
                value={pumpFormData.slippage}
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  min={0}
                  onChange={(e) => setPumpFormData({...pumpFormData, slippage: +e.target.value})}
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowPumpModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded shadow-pixel transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handlePumpSubmit}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-pixel transition-all flex items-center gap-2"
                >
                  <Rocket size={16} />
                  Launch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Creation Modal */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div className="bg-gray-800 border-4 border-gray-600 rounded-lg p-6 w-full max-w-md relative shadow-pixel-lg" style={{ imageRendering: 'pixelated' }}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">Share Your Creation</h2>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-3 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center">
                <input 
                  type="text" 
                  className="flex-1 bg-transparent border-none text-white focus:outline-none"
                  value={shareLink}
                  readOnly
                />
                <button 
                  onClick={copyShareLink}
                  className="ml-2 p-2 bg-purple-600 hover:bg-purple-500 rounded shadow-pixel flex items-center justify-center transition-all"
                >
                  {isCopied ? <Check size={16} className="text-white" /> : <Copy size={16} className="text-white" />}
                </button>
              </div>

              <div className="p-4 bg-gray-700 rounded-lg border-2 border-gray-600">
                <p className="text-gray-300 text-center">Share this link with anyone to show off your pixel art creation!</p>
              </div>
              
              <div className="flex justify-center gap-3">
                <div className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg shadow-pixel transition-all cursor-pointer">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </div>
                <div className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg shadow-pixel transition-all cursor-pointer">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg shadow-pixel transition-all cursor-pointer">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded shadow-pixel transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActionButtons;