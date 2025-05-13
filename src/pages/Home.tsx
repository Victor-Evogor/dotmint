import {
  Undo2,
  Redo2,
  Moon,
  Sun,
  LogIn,
  LogOut,
  Copy,
  User,
  Wallet,
  Info,
} from "lucide-react";

// Component Imports
import Logo from "@/components/Logo";
import Canvas from "@/components/Canvas";
import Toolbar from "@/components/Toolbar";
import ColorPalette from "@/components/ColorPalette";
import AIPrompt from "@/components/AIPrompt";
import ActionButtons from "@/components/ActionButtons";
import { useUser } from "@civic/auth-web3/react";
import { useDarkMode, usePixelEditor, useUserDB } from "@/hooks";
import { useEffect, useState, useRef } from "react";
import { userHasWallet } from "@civic/auth-web3";
import { getUserByWalletAddress, createUser } from "@/utils/firebase";
import { Connection, PublicKey } from "@solana/web3.js";
import { AuthModal } from "@/components/AuthModal";
import { useLocation } from "react-router-dom";

import { decompressUrlSafeToJson } from "@/utils/jsonCompressor";

const App: React.FC = () => {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const userContext = useUser();
  const { signIn, signOut, user, isLoading } = userContext;
  const {
    stateHistory,
    setStateHistory,
    redoStack,
    setRedoStack,
    canvas,
    strokes,
    drawGrid,
    setBackgroundColor,
    loadDataSet,
  } = usePixelEditor();
  const { setUserDB } = useUserDB();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [solBalance, setSolBalance] = useState(0);

  const location = useLocation();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (canvas) {
      console.log("location.search == ", location.search);
      // Extract query parameters
      if (location.search) {
        const queryParams = new URLSearchParams(location.search);
        const data = queryParams.get("data");
        if (data) {
          console.log("Data from URL:", data);
          try {
            const dataset = decompressUrlSafeToJson<{
              strokes: {
                position: [number, number];
                color: string;
              }[];
              backgroundColor: string;
            }>(data);
            console.log("Processed dataset", dataset);
            loadDataSet(dataset.strokes);
            drawGrid();
            setBackgroundColor(dataset.backgroundColor);
          } catch (err) {
            console.log("error converting dataset to dotmint", err);
          }

          // Handle the data as needed
        }
      }
    }
  }, [canvas]);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignIn = async () => {
    await signIn();
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const copyWalletAddress = () => {
    if (userHasWallet(userContext)) {
      if (userContext.solana.address) {
        navigator.clipboard.writeText(userContext.solana.address);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  const handleUndo = () => {
    if (stateHistory.length > 1) {
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;

      // Get current state to move to redo stack
      const currentState = stateHistory[stateHistory.length - 1];

      // Push to redo stack
      setRedoStack((prev) => [...prev, currentState]);

      // Remove current state from history
      const newHistory = stateHistory.slice(0, -1);
      setStateHistory(newHistory);

      // Get previous state (which is now the latest state)
      const previousState = newHistory[newHistory.length - 1];

      // Apply the previous state
      setBackgroundColor(previousState.backgroundColor);
      ctx.fillStyle = previousState.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      loadState(ctx, previousState.strokes);
      drawGrid();
    }
  };

  useEffect(() => {
    if (user) {
      if (userHasWallet(userContext)) {
        console.log("User has a wallet");
        getUserByWalletAddress(userContext.solana.address).then((userDb) => {
          console.log("User from DB", userDb);
          if (userDb) {
            const connection = new Connection(
              import.meta.env.VITE_SOLANA_RPC_URL
            );
            connection
              .getBalance(new PublicKey(userContext.solana.address))
              .then((balance) => setSolBalance(balance));
            // Load user data into context or state
            setUserDB(userDb);
          } else {
            console.log("No user found in DB");
            createUser({
              credits: 3,
              walletAddress: userContext.solana.address,
            }).then((userDb) => {
              setUserDB(userDb);
            });
          }
        });
        console.log(userContext.solana.address);
      } else {
        userContext.createWallet().then(() => {
          if(userHasWallet(userContext)){
            createUser({
              credits: 3,
              walletAddress: userContext.solana.address,
            }).then((userDb) => {
              setUserDB(userDb);
            });
          }
        })
        
      }
    }
  }, [isLoading]);

  function loadState(
    ctx: CanvasRenderingContext2D,
    dataset: { position: [number, number]; color: string }[]
  ): void {
    strokes.clear();

    for (const point of dataset) {
      ctx.fillStyle = point.color;
      ctx.fillRect(point.position[0], point.position[1], 20, 20);
      strokes.push(point);
    }
  }

  const handleRedo = () => {
    if (redoStack.length > 0) {
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;

      // Get the state to restore from redo stack
      const nextState = redoStack[redoStack.length - 1];

      // Remove from redo stack
      const newRedoStack = redoStack.slice(0, -1);
      setRedoStack(newRedoStack);

      // Add to history stack
      setStateHistory((prev) => [...prev, nextState]);

      // Apply the state
      setBackgroundColor(nextState.backgroundColor);
      ctx.fillStyle = nextState.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      loadState(ctx, nextState.strokes);
      drawGrid();

      console.log(
        "After Redo - History:",
        [...stateHistory, nextState].length,
        "Redo:",
        newRedoStack.length
      );
    }
  };

  // Function to truncate wallet address for display
  const truncateWalletAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 4)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Check if buttons should be disabled
  const canUndo = stateHistory.length > 1;
  const canRedo = redoStack.length > 0;

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } font-pixel`}
    >
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <Logo />

          <div className="flex items-center gap-4">
            <button
              className={`p-2 ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } border-2 border-orange-500 rounded-lg shadow-pixel`}
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {!user && (
              <button
                className={`flex items-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-pixel transition-all ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            )}

            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  className={`flex items-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-pixel transition-all`}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User size={18} />
                  {truncateWalletAddress(
                    userHasWallet(userContext)
                      ? userContext.solana.address || ""
                      : ""
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-6 mt-2 w-64">
                    {/* Menu content */}
                    <div
                      className={`${
                        isDarkMode ? "bg-gray-800" : "bg-white"
                      } border-4 ${
                        isDarkMode ? "border-gray-700" : "border-gray-300"
                      } rounded-xl shadow-pixel z-50 p-4 relative`}
                    >
                      <div className="space-y-4">
                        <div className="border-b-2 border-orange-500 pb-2">
                          <p className="text-sm text-orange-500 font-bold">
                            Wallet
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs break-all">
                              {userHasWallet(userContext)
                                ? userContext.solana.address
                                : ""}
                            </p>
                            <button
                              onClick={copyWalletAddress}
                              className={`ml-2 p-1 ${
                                isDarkMode ? "bg-gray-700" : "bg-gray-200"
                              } rounded-md hover:bg-green-500 hover:text-white transition-colors`}
                            >
                              {copySuccess ? (
                                <span className="text-xs text-green-500">
                                  Copied!
                                </span>
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="border-b-2 border-orange-500 pb-2">
                          <div className="flex items-center">
                            <Wallet
                              size={16}
                              className="mr-2 text-orange-500"
                            />
                            <p className="font-bold text-sm">SOL Balance</p>
                          </div>
                          <p className="mt-1">{solBalance} SOL</p>
                        </div>

                        <div className="text-xs opacity-80 border-b-2 border-orange-500 pb-2">
                          <div className="flex items-start">
                            <Info
                              size={14}
                              className="mt-1 mr-1 text-orange-500"
                            />
                            <p>
                              Send SOL to your wallet address to make deposits.
                              Wallets are non-custodial.
                            </p>
                          </div>
                        </div>

                        <button
                          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-pixel transition-all"
                          onClick={handleSignOut}
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Tools */}
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } p-4 rounded-xl border-4 ${
              isDarkMode ? "border-gray-700" : "border-gray-300"
            } shadow-pixel`}
          >
            <Toolbar />

            <div className="mt-6">
              <h3 className="text-lg mb-3 text-orange-500 font-bold">Colors</h3>
              <ColorPalette />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Canvas Container */}
            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } p-6 rounded-xl border-4 ${
                isDarkMode ? "border-gray-700" : "border-gray-300"
              } shadow-pixel`}
            >
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold text-orange-500">
                  Pixel Canvas
                </h2>
                <div className="flex gap-2">
                  <button
                    className={`p-2 rounded-lg shadow-pixel ${
                      canUndo
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    onClick={handleUndo}
                    disabled={!canUndo}
                  >
                    <Undo2 size={18} className={!canUndo ? "opacity-50" : ""} />
                  </button>
                  <button
                    className={`p-2 rounded-lg shadow-pixel ${
                      canRedo
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    onClick={handleRedo}
                    disabled={!canRedo}
                  >
                    <Redo2 size={18} className={!canRedo ? "opacity-50" : ""} />
                  </button>
                </div>
              </div>

              <Canvas />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <ActionButtons />
            </div>
          </div>
          {/* Right Sidebar - AI Prompt */}
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } p-4 rounded-xl border-4 ${
              isDarkMode ? "border-gray-700" : "border-gray-300"
            } shadow-pixel`}
          >
            <AIPrompt />
          </div>
        </main>

        <footer className="mt-12 text-center text-sm opacity-70">
          <p>
            © 2025 DotMint. Powered by{" "}
            <span className="text-green-400">Solana &amp; Civic Auth</span>
          </p>
        </footer>
        <AuthModal />
      </div>
    </div>
  );
};

export default App;
