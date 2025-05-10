import {createContext, Dispatch, SetStateAction} from "react"
import {StrokeCollection, UserDB, StateInterface} from "@/types"

interface AppContextType {
    isDarkMode: boolean;
    setIsDarkMode: Dispatch<SetStateAction<boolean>>;
    selectedColor: string;
    setSelectedColor: Dispatch<SetStateAction<string>>;
    selectedTool: string;
    setSelectedTool: Dispatch<SetStateAction<string>>;
    currentColor: string,
    setCurrentColor: Dispatch<SetStateAction<string>>;
    preserveBackground: boolean;
    setPreserveBackground: Dispatch<SetStateAction<boolean>>;
    backgroundColor: string;
    setBackgroundColor: Dispatch<SetStateAction<string>>;
    strokes: StrokeCollection;
    setStrokes: Dispatch<SetStateAction<StrokeCollection>>;
    stateHistory: StateInterface[],
    setStateHistory: Dispatch<SetStateAction<StateInterface[]>>;
    redoStack: StateInterface[];
    setRedoStack: Dispatch<SetStateAction<StateInterface[]>>;
    canvas: HTMLCanvasElement | null,
    setCanvas: Dispatch<SetStateAction<HTMLCanvasElement | null>>;
    userDB: UserDB | null,
    setUserDB: Dispatch<SetStateAction<UserDB | null>>
}

const AppContext = createContext<AppContextType | null>(null)

export default AppContext