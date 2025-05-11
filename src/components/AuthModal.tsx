// Auth Modal Component
import { useDarkMode, useAuthModal } from "@/hooks"
import { useUser } from "@civic/auth-web3/react";
import { Sparkle, X } from 'lucide-react';

export const AuthModal = () => {
    const {isDarkMode} = useDarkMode()
    const { signIn } = useUser()
    const { setShowAuthModal, showAuthModal } = useAuthModal()
    if (!showAuthModal) return <></>
    const handleSignIn = async () => {
      await signIn();
      setShowAuthModal(false);
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
              You need to sign in to perform this action!
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