import { FunctionComponent, PropsWithChildren, useState } from "react"
import { CivicAuthProvider } from "@civic/auth-web3/react";
import AppContext from "./AppContext";
import {StrokeCollection, StateInterface, UserDB} from "@/types"

const AppProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [selectedColor, setSelectedColor] = useState<string>('#FF004D');
  const [selectedTool, setSelectedTool] = useState<string>('pencil');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [preserveBackground, setPreserveBackground] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [strokes, setStrokes] = useState<StrokeCollection>(new StrokeCollection());
  const [stateHistory, setStateHistory] = useState<StateInterface[]>([]);
  const [redoStack, setRedoStack] = useState<StateInterface[]>([]);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [userDB, setUserDB] = useState<UserDB | null>(null)
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  return (
    <AppContext.Provider value={{
      isDarkMode,
      setIsDarkMode,
      selectedColor,
      setSelectedColor,
      selectedTool,
      setSelectedTool,
      currentColor,
      setCurrentColor,
      preserveBackground,
      setPreserveBackground,
      backgroundColor,
      setBackgroundColor,
      strokes,
      setStrokes,
      stateHistory,
      setStateHistory,
      redoStack,
      setRedoStack,
      canvas,
      setCanvas,
      userDB,
      setUserDB,
      showAuthModal,
      setShowAuthModal
    }}>
    <CivicAuthProvider clientId={import.meta.env.VITE_CIVIC_AUTH_CLIENT_ID}>
      {children}
    </CivicAuthProvider>
    </AppContext.Provider>
  )
}

export default AppProvider