import { useDarkMode, useUserDB } from "@/hooks";
import { Sparkle, X, Loader, CreditCard, Zap, Check, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUser } from "@civic/auth-web3/react";
import { generateImageFromStableDiffusion } from "@/utils/generateImageFromStableDiff";
import { generateDotMint } from "@/utils/generateDotmint";
import { usePixelEditor } from "@/hooks";
import { updateUser } from "@/utils/firebase";  
import { Transaction, SystemProgram, PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { userHasWallet } from "@civic/auth-web3";
import { convertAmountToSol } from "@/utils/convertUsdToSol";

const AIPrompt = () => {
  const { isDarkMode } = useDarkMode();
  const { userDB, setUserDB } = useUserDB();
  const userContext = useUser();
  const { authStatus, signIn } = userContext;
  const { drawGrid, loadDataSet } = usePixelEditor();
  
  // State for form inputs
  const [prompt, setPrompt] = useState('');
  const [artStyle, setArtStyle] = useState('Retro Game');
  const [complexity, setComplexity] = useState(5);
  const [isPromptEmpty, setIsPromptEmpty] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCreditPack, setSelectedCreditPack] = useState<{
    id: number;
    credits: number;
    price: number;
    popular: boolean;
  } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txSignature, setTxSignature] = useState('');

  // Credit packages
  const creditPackages = [
    { id: 1, credits: 20, price: 1.00, popular: false },
    { id: 2, credits: 100, price: 5.00, popular: true },
    { id: 3, credits: 500, price: 25.00, popular: false },
  ];

  // Handle generate button click
  const handleGenerate = async () => {
    // Check if prompt is empty
    if (!prompt.trim()) {
      setIsPromptEmpty(true);
      return;
    }
    
    if (authStatus === "unauthenticated") {
      setShowAuthModal(true);
      return;
    }

    if (!userDB){
      return
    }
    
    // Reset error state if prompt is valid
    setIsPromptEmpty(false);
    
    // Start loading animation
    setIsGenerating(true);
    
    try {
      const userCredits = userDB.credits;
      if (userCredits < 3) {
        await updateUser(userDB.id, { credits: userCredits - 3 });
        setUserDB({
          ...userDB,
          credits: userCredits - 3,
        })
      } else {
        setShowBuyCreditsModal(true);
      }
      const imageBuffer = await generateImageFromStableDiffusion(prompt, artStyle, complexity);
      const blob = new Blob([imageBuffer]);
      const url = URL.createObjectURL(blob);
      const dotmint = await generateDotMint(url);
      loadDataSet(dotmint);
      drawGrid();
    } catch (error) {
      // Handle error silently
      console.log(error)
    } finally {
      // Stop loading animation when complete or on error
      setIsGenerating(false);
    }
  };

  // Handle buy credits
  const handleBuyCredits = () => {
    setShowBuyCreditsModal(true);
  };

  // Handle purchase completion
  const handlePurchase = async () => {
    if (!selectedCreditPack) return;
    if(!userDB) return
    
    setIsProcessingPayment(true);
    
    try {
      // Here you would integrate with your actual payment processor
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (!userHasWallet(userContext)) return
      
      const publicKey = userContext.solana.address
      const connection = new Connection(import.meta.env.VITE_SOLANA_RPC_URL);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publicKey),
          toPubkey: new PublicKey(import.meta.env.VITE_PAYMENT_WALLET_ADDRESS),
          lamports: (await convertAmountToSol(selectedCreditPack.price)) * LAMPORTS_PER_SOL,
        })
      );
      const signature = await userContext.solana.wallet.sendTransaction(transaction, connection);
      // Save transaction signature for the success modal
      setTxSignature(signature);
      
      // Update user credits (this would be done server-side in production)
      updateUser(userDB.id, {
        credits: userDB.credits + selectedCreditPack.credits,
      });
      
      // Update local state
      setUserDB({
        ...userDB,
        credits: userDB.credits + selectedCreditPack.credits,
      });
      
      // Close credits modal and show success modal
      setShowBuyCreditsModal(false);
      setShowSuccessModal(true);
      setSelectedCreditPack(null);
      setIsProcessingPayment(false);
    } catch (error) {
      setIsProcessingPayment(false);
      console.log(error)
    }
  };

  useEffect(() => {
    if (authStatus === "authenticated") {
      setShowAuthModal(false);
    }
  }, [authStatus]);

  // Pixel loading animation component
  const PixelLoadingAnimation = () => {
    const pixelColors = isDarkMode 
      ? ['#9F7AEA', '#B794F4', '#D6BCFA', '#E9D8FD', '#FAF5FF'] 
      : ['#553C9A', '#6B46C1', '#805AD5', '#9F7AEA', '#B794F4'];
    
    return (
      <div className="flex items-center justify-center">
        <div className="flex space-x-1">
          {pixelColors.map((color, index) => (
            <div 
              key={index}
              className="h-3 w-3"
              style={{
                backgroundColor: color,
                animation: `pixelPulse 1.5s ease-in-out ${index * 0.15}s infinite`,
              }}
            ></div>
          ))}
        </div>
      </div>
    );
  };

  // Auth Modal Component
  const AuthModal = () => {
    const handleSignIn = async () => {
      await signIn();
    };
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
        <div className={`relative w-full max-w-md p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{
          boxShadow: `0 0 0 4px ${isDarkMode ? '#2D3748' : '#E2E8F0'}, 
                      0 0 0 8px ${isDarkMode ? '#1A202C' : '#CBD5E0'}`,
          border: `4px solid ${isDarkMode ? '#4A5568' : '#A0AEC0'}`,
          imageRendering: 'pixelated'
        }}>
          {/* Close button */}
          <button 
            onClick={() => setShowAuthModal(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
          
          {/* Modal content */}
          <div className="text-center">
            <div className="mb-4">
              <Sparkle className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            
            <h3 className={`text-xl font-pixel mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{
              textShadow: isDarkMode ? '2px 2px 0 #1A202C' : '2px 2px 0 #E2E8F0'
            }}>
              AUTHENTICATION REQUIRED
            </h3>
            
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} style={{
              fontFamily: 'monospace'
            }}>
              You need to sign in to generate pixel art!
            </p>
            
            <div className="flex flex-col gap-4">
              <button 
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all shadow-pixel"
                style={{
                  boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                  transform: 'translateY(-2px)',
                }}
                onClick={handleSignIn}
              >
                SIGN IN
              </button>
              
              <button 
                className={`w-full py-3 rounded-lg transition-all shadow-pixel ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                style={{
                  boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)',
                }}
                onClick={() => setShowAuthModal(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Buy Credits Modal Component
  const BuyCreditsModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
        <div className={`relative w-full max-w-md p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{
          boxShadow: `0 0 0 4px ${isDarkMode ? '#2D3748' : '#E2E8F0'}, 
                      0 0 0 8px ${isDarkMode ? '#1A202C' : '#CBD5E0'}`,
          border: `4px solid ${isDarkMode ? '#4A5568' : '#A0AEC0'}`,
          imageRendering: 'pixelated'
        }}>
          {/* Close button */}
          <button 
            onClick={() => setShowBuyCreditsModal(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            disabled={isProcessingPayment}
          >
            <X size={20} />
          </button>
          
          {/* Modal content */}
          <div className="text-center">
            <div className="mb-4">
              <CreditCard className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            
            <h3 className={`text-xl font-pixel mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{
              textShadow: isDarkMode ? '2px 2px 0 #1A202C' : '2px 2px 0 #E2E8F0'
            }}>
              BUY CREDITS
            </h3>
            
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} style={{
              fontFamily: 'monospace'
            }}>
              1 credit = $0.05 • You currently have <span className={isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}>{userDB?.credits || 0}</span> credits
            </p>
            
            <div className="grid grid-cols-1 gap-4 mb-6">
              {creditPackages.map((pack) => (
                <div 
                  key={pack.id} 
                  className={`relative p-4 rounded-lg cursor-pointer transition-all ${
                    selectedCreditPack?.id === pack.id 
                      ? isDarkMode ? 'bg-yellow-900 border-yellow-500' : 'bg-yellow-100 border-yellow-500' 
                      : isDarkMode ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                  } border-2`}
                  onClick={() => setSelectedCreditPack(pack)}
                  style={{
                    boxShadow: selectedCreditPack?.id === pack.id ? '0 0 0 2px rgba(245, 158, 11, 0.5)' : 'none',
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                      }`}>
                        <Zap size={20} className={isDarkMode ? 'text-yellow-400' : 'text-yellow-500'} />
                      </div>
                      <div className="text-left">
                        <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pack.credits} Credits</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>${pack.price.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedCreditPack?.id === pack.id 
                        ? isDarkMode ? 'border-yellow-400 bg-yellow-400' : 'border-yellow-500 bg-yellow-500' 
                        : isDarkMode ? 'border-gray-500' : 'border-gray-400'
                    }`}>
                      {selectedCreditPack?.id === pack.id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  
                  {pack.popular && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-xs font-bold text-white px-2 py-1 rounded-full">
                      POPULAR
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                className={`w-full py-3 ${
                  selectedCreditPack ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-yellow-400 opacity-50 cursor-not-allowed'
                } text-white rounded-lg transition-all shadow-pixel flex items-center justify-center gap-2`}
                style={{
                  boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                  transform: 'translateY(-2px)',
                }}
                onClick={handlePurchase}
                disabled={!selectedCreditPack || isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin">
                      <Loader size={16} />
                    </div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    {selectedCreditPack 
                      ? `Buy ${selectedCreditPack.credits} Credits for $${selectedCreditPack.price.toFixed(2)}` 
                      : 'Select a Package'}
                  </>
                )}
              </button>
              
              <button 
                className={`w-full py-3 rounded-lg transition-all shadow-pixel ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                style={{
                  boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)',
                }}
                onClick={() => setShowBuyCreditsModal(false)}
                disabled={isProcessingPayment}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Success Modal Component
  const SuccessModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
        <div className={`relative w-full max-w-md p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{
          boxShadow: `0 0 0 4px ${isDarkMode ? '#2D3748' : '#E2E8F0'}, 
                      0 0 0 8px ${isDarkMode ? '#1A202C' : '#CBD5E0'}`,
          border: `4px solid ${isDarkMode ? '#4A5568' : '#A0AEC0'}`,
          imageRendering: 'pixelated'
        }}>
          {/* Modal content */}
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-500" />
              </div>
            </div>
            
            <h3 className={`text-xl font-pixel mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{
              textShadow: isDarkMode ? '2px 2px 0 #1A202C' : '2px 2px 0 #E2E8F0'
            }}>
              PAYMENT SUCCESSFUL!
            </h3>
            
            <div className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-3`} style={{
              fontFamily: 'monospace'
            }}>
              <p>Credits have been added to your account!</p>
              <p className="text-sm">You now have <span className={isDarkMode ? 'text-yellow-300 font-bold' : 'text-yellow-600 font-bold'}>{userDB?.credits || 0}</span> credits</p>
              
              <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} text-left text-xs`}>
                <p className="mb-2">Transaction Details:</p>
                <p className="truncate">{txSignature}</p>
                <a 
                  href={`https://solscan.io/tx/${txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-2 flex items-center justify-center gap-1 py-1 px-2 rounded ${
                    isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  View on Solscan
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
            
            <button 
              className={`w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-pixel`}
              style={{
                boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                transform: 'translateY(-2px)',
              }}
              onClick={() => setShowSuccessModal(false)}
            >
              AWESOME!
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-lg mb-3 text-orange-500 font-bold flex items-center gap-2">
        <Sparkle size={18} />
        AI Pixel Generator
      </h3>
      
      <div className="mb-4">
        <p className="text-sm mb-2 opacity-80">Generate pixel art from text prompts</p>
        <textarea 
          className={`w-full h-32 p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none border-2 ${
            isPromptEmpty ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}
          placeholder="Describe your pixel art... (e.g. 'A retro space invader with bright colors')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
        />
        {isPromptEmpty && <p className="text-red-500 text-xs mt-1">Please enter a prompt</p>}
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span>Art Style:</span>
          <select 
            className={`rounded-lg p-1 ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
            } border-2`}
            value={artStyle}
            onChange={(e) => setArtStyle(e.target.value)}
            disabled={isGenerating}
          >
            <option>Retro Game</option>
            <option>Voxel</option>
            <option>Minecraft</option>
            <option>Commodore 64</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span>Complexity:</span>
          <div className="w-24">
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={complexity}
              onChange={(e) => setComplexity(parseInt(e.target.value))}
              className="w-full"
              disabled={isGenerating}
            />
          </div>
        </div>
        
        <button 
          className={`mt-4 w-full py-3 bg-purple-600 ${!isGenerating ? 'hover:bg-purple-700' : 'opacity-90'} text-white rounded-lg shadow-pixel flex items-center justify-center gap-2 transition-all`}
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin">
                <Loader size={16} />
              </div>
              Generating
              <PixelLoadingAnimation />
            </>
          ) : (
            <>
              <Sparkle size={16} />
              Generate (3 Credit)
            </>
          )}
        </button>
        
        {userDB ? (
          <div className="mt-2 text-center text-xs flex flex-col gap-2">
            <div><span className={isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}>{userDB.credits} Credits</span> Remaining</div>
            
            <button 
              className={`py-2 px-4 text-xs rounded-lg shadow-pixel transition-all flex items-center justify-center gap-1
                ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'}`}
              style={{
                boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                transform: 'translateY(-1px)',
                imageRendering: 'pixelated',
                border: `2px solid ${isDarkMode ? '#B7791F' : '#D69E2E'}`
              }}
              onClick={handleBuyCredits}
            >
              <span className="text-lg">+</span>
              Buy More Credits
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>

      {/* Render the auth modal when showAuthModal is true */}
      {showAuthModal && <AuthModal />}
      
      {/* Render the buy credits modal when showBuyCreditsModal is true */}
      {showBuyCreditsModal && <BuyCreditsModal />}
      
      {/* Render the success modal when showSuccessModal is true */}
      {showSuccessModal && <SuccessModal />}
    </div>
  );
};

export default AIPrompt;