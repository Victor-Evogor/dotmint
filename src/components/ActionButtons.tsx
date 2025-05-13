import { useState, useEffect } from "react";
import { Download, Rocket, X, Copy, Check } from "lucide-react";
import { useAuthModal, usePixelEditor } from "@/hooks";
import { PIXEL_SIZE } from "@/constants";
import { useUser } from "@civic/auth-web3/react";
import { userHasWallet } from "@civic/auth-web3";
import { compressJsonToUrlSafe } from "@/utils/jsonCompressor";
import { StateInterface } from "@/types";
import { VersionedTransaction, Connection, Keypair, PublicKey } from "@solana/web3.js";

const ActionButtons = () => {
  const { canvas, preserveBackground, backgroundColor, strokes, stateHistory } =
    usePixelEditor();
  const [showMintModal, setShowMintModal] = useState(false);
  const [showPumpModal, setShowPumpModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState(
    `${window.location.protocol}//${window.location.hostname}`
  );
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
  const userContext = useUser();
  const { authStatus } = userContext;
  const { setShowAuthModal } = useAuthModal();

const [showSuccessModal, setShowSuccessModal] = useState(false);
const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false);
const [showErrorModal, setShowErrorModal] = useState(false);
const [txUrl, setTxUrl] = useState("");
const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (showShareModal) {
      const dataset: StateInterface = JSON.parse(
        JSON.stringify(stateHistory[stateHistory.length - 1])
      );
      dataset.strokes = dataset.strokes.map<{
        position: [number, number];
        color: string;
      }>((point) => {
        return {
          color: point.color,
          position: [point.position[0] / 20, point.position[1] / 20],
        };
      });
      const url = compressJsonToUrlSafe(dataset);
      setShareLink(
        `${window.location.protocol}//${window.location.hostname}/?data=${url}`
      );
    }
  }, [showShareModal]);

  // Function to get the canvas as a blob
  const getCanvasBlob = async (): Promise<Blob | null> => {
    if (!canvas) return null;

    // Create a temporary canvas without grid lines
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) return null;

    // Fill with background if preserving background
    if (preserveBackground) {
      tempCtx.fillStyle = backgroundColor;
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    // Draw all strokes
    for (const point of strokes) {
      tempCtx.fillStyle = point.color;
      tempCtx.fillRect(
        point.position[0],
        point.position[1],
        PIXEL_SIZE,
        PIXEL_SIZE
      );
    }

    return new Promise((resolve) => {
      tempCanvas.toBlob((blob) => {
        resolve(blob);
      });
    });
  };

  const saveImage = () => {
    if (!canvas) return;
    // Create a temporary canvas without grid lines
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) return;

    // Fill with white background if not preserving background
    if (preserveBackground) {
      tempCtx.fillStyle = backgroundColor;
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    // Draw all strokes
    for (const point of strokes) {
      tempCtx.fillStyle = point.color;
      tempCtx.fillRect(
        point.position[0],
        point.position[1],
        PIXEL_SIZE,
        PIXEL_SIZE
      );
    }

    // Create download link
    const link = document.createElement("a");
    link.download = "pixel-art.png";
    link.href = tempCanvas.toDataURL();
    link.click();
  };

  const handlePumpSubmit = async () => {
    try {
      const blob = await getCanvasBlob();
      if (!blob) {
        setErrorMessage("Failed to get canvas image. Please try again.");
        setShowErrorModal(true);
        return;
      }
      
      if (!userHasWallet(userContext)) {
        setShowAuthModal(true);
        return;
      }
      
      const connection = new Connection(import.meta.env.VITE_SOLANA_RPC_URL);
  
      const userSolBalance = await connection
              .getBalance(new PublicKey(userContext.solana.address));
      
      // Convert balance from lamports to SOL
      const balanceInSol = userSolBalance / 1000000000;
      const priorityFee = 0.002; // 0.002 SOL for priority fee
      
      // Check if user has enough SOL for transaction
      if (pumpFormData.amount > 0 && balanceInSol < pumpFormData.amount + priorityFee) {
        setShowInsufficientFundsModal(true);
        return;
      }
  
      // Form validation
      if (!pumpFormData.name || !pumpFormData.symbol) {
        setErrorMessage("Token name and symbol are required");
        setShowErrorModal(true);
        return;
      }
  
      // Generate a random keypair for token
      const mintKeypair = Keypair.generate();
  
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("name", pumpFormData.name);
      formData.append("symbol", pumpFormData.symbol);
      formData.append("description", pumpFormData.description);
      formData.append("twitter", pumpFormData.twitter);
      formData.append("telegram", pumpFormData.telegram);
      formData.append("website", pumpFormData.website);
      formData.append("showName", "true");
  
      // Create IPFS metadata storage
      const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: formData,
      });
  
      if (!metadataResponse.ok) {
        throw new Error(`Failed to upload to IPFS: ${metadataResponse.statusText}`);
      }
  
      const metadataResponseJSON = await metadataResponse.json();
  
      // Get the create transaction
      const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKey: userContext.solana.address,
          action: "create",
          tokenMetadata: {
            name: metadataResponseJSON.metadata.name,
            symbol: metadataResponseJSON.metadata.symbol,
            uri: metadataResponseJSON.metadataUri,
          },
          mint: mintKeypair.publicKey.toBase58(),
          denominatedInSol: "true",
          amount: pumpFormData.amount,
          slippage: pumpFormData.slippage,
          priorityFee: 0.0005,
          pool: "pump",
        }),
      });
  
      if (response.status === 200) {
        // successfully generated transaction
        const data = await response.arrayBuffer();
        const tx = VersionedTransaction.deserialize(new Uint8Array(data));
        const txSignature = await userContext.solana.wallet.sendTransaction(
          tx,
          connection
        );
  
        console.log("Transaction: https://solscan.io/tx/" + txSignature);
        
        // Set transaction URL and show success modal
        setTxUrl(`https://solscan.io/tx/${txSignature}`);
        setShowSuccessModal(true);
        setShowPumpModal(false);
      } else {
        // Handle API error
        const errorData = await response.text();
        throw new Error(`Transaction creation failed: ${errorData || response.statusText}`);
      }
    } catch (error) {
      console.error("Error launching on pump.fun:", error);
      setErrorMessage("Failed to launch on pump.fun. Please try again.");
      setShowErrorModal(true);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLaunchClick = () => {
    if (authStatus !== "authenticated") {
      setShowAuthModal(true);
      return;
    }
    setShowPumpModal(true);
  };

  return (
    <>
      <button
        className="flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-pixel transition-all"
        onClick={saveImage}
      >
        <Download size={18} />
        Download Artwork
      </button>

      <button
        className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-pixel transition-all"
        onClick={() => setShowMintModal(true)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
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
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16 8L18 6L22 2M16 2H22V8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Share Creation
      </button>

      {/* Mint NFT Modal */}
      {showMintModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div
            className="bg-gray-800 border-4 border-gray-600 rounded-lg p-6 w-full max-w-md relative shadow-pixel-lg"
            style={{ imageRendering: "pixelated" }}
          >
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
                <p className="text-gray-300">
                  NFT minting functionality will be available in the next
                  update. Stay tuned for this exciting feature!
                </p>
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
          <div
            className="bg-gray-800 border-4 border-gray-600 rounded-lg p-6 w-full max-w-md relative shadow-pixel-lg overflow-y-auto max-h-screen"
            style={{ imageRendering: "pixelated" }}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">
                Launch on pump.fun
              </h2>
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
                  onChange={(e) =>
                    setPumpFormData({ ...pumpFormData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Symbol</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  value={pumpFormData.symbol}
                  onChange={(e) =>
                    setPumpFormData({ ...pumpFormData, symbol: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  rows={3}
                  value={pumpFormData.description}
                  onChange={(e) =>
                    setPumpFormData({
                      ...pumpFormData,
                      description: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Twitter URL</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  value={pumpFormData.twitter}
                  onChange={(e) =>
                    setPumpFormData({
                      ...pumpFormData,
                      twitter: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Telegram URL</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  value={pumpFormData.telegram}
                  onChange={(e) =>
                    setPumpFormData({
                      ...pumpFormData,
                      telegram: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Website URL</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  value={pumpFormData.website}
                  onChange={(e) =>
                    setPumpFormData({
                      ...pumpFormData,
                      website: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">
                  Initial Dev Buy (SOL)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  // value={pumpFormData.telegram}
                  min={0}
                  onChange={(e) =>
                    setPumpFormData({
                      ...pumpFormData,
                      amount: +e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Slippage</label>
                <input
                  type="number"
                  value={pumpFormData.slippage}
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white shadow-pixel focus:border-blue-500 focus:outline-none"
                  min={0}
                  onChange={(e) =>
                    setPumpFormData({
                      ...pumpFormData,
                      slippage: +e.target.value,
                    })
                  }
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
          <div
            className="bg-gray-800 border-4 border-gray-600 rounded-lg p-6 w-full max-w-md relative shadow-pixel-lg"
            style={{ imageRendering: "pixelated" }}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">
                Share Your Creation
              </h2>
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
                  {isCopied ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <Copy size={16} className="text-white" />
                  )}
                </button>
              </div>

              <div className="p-4 bg-gray-700 rounded-lg border-2 border-gray-600">
                <p className="text-gray-300 text-center">
                  Share this link with anyone to show off your pixel art
                  creation!
                </p>
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div
            className="bg-gray-800 border-4 border-gray-600 rounded-lg p-6 w-full max-w-md relative shadow-pixel-lg"
            style={{ imageRendering: "pixelated" }}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">Launch Successful!</h2>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-gray-700 rounded-lg border-2 border-gray-600 flex flex-col items-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} className="text-white" />
                </div>
                <p className="text-green-300 text-xl font-pixel mb-4">Token Created Successfully!</p>
                <p className="text-gray-300 text-center mb-4">
                  Your pixel art token has been successfully launched on pump.fun!
                </p>
                <a
                  href={txUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-pixel transition-all flex items-center gap-2"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  View Transaction
                </a>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded shadow-pixel transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Funds Modal */}
      {showInsufficientFundsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div
            className="bg-gray-800 border-4 border-gray-600 rounded-lg p-6 w-full max-w-md relative shadow-pixel-lg"
            style={{ imageRendering: "pixelated" }}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">Insufficient Funds</h2>
              <button
                onClick={() => setShowInsufficientFundsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-700 rounded-lg border-2 border-gray-600">
                <div className="flex items-center justify-center w-full mb-4">
                  <svg 
                    width="64" 
                    height="64" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-yellow-400"
                  >
                    <path 
                      d="M12 9V12M12 16H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-yellow-300 text-center mb-4">Not Enough SOL!</p>
                <p className="text-gray-300 text-center">
                  You don't have enough SOL in your wallet for this transaction. You need at least {pumpFormData.amount + 0.002} SOL (including 0.002 SOL for transaction fees).
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowInsufficientFundsModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded shadow-pixel transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div
            className="bg-gray-800 border-4 border-gray-600 rounded-lg p-6 w-full max-w-md relative shadow-pixel-lg"
            style={{ imageRendering: "pixelated" }}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">Error</h2>
              <button
                onClick={() => setShowErrorModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-700 rounded-lg border-2 border-gray-600">
                <div className="flex items-center justify-center w-full mb-4">
                  <svg 
                    width="64" 
                    height="64" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-red-500"
                  >
                    <path 
                      d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="text-red-300 text-center mb-4">Launch Failed</p>
                <p className="text-gray-300 text-center">
                  {errorMessage}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowErrorModal(false)}
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
