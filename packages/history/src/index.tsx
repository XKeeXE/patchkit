"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Command } from "./types";

interface HistoryContextType<T> {
  addHistory: (command: Command<T>, immediate?: boolean) => void;
  undo: (steps?: number) => void;
  redo: (steps?: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  resetHistory: () => void;
}

// State and action types for the reducer
interface HistoryState {
  commands: Command<any>[];
  step: number;
}

type HistoryAction =
  | { type: "ADD"; command: Command<any>; limit: number }
  | { type: "UNDO"; steps: number }
  | { type: "REDO"; steps: number }
  | { type: "RESET" };

const initialState: HistoryState = {
  commands: [],
  step: 0,
};

/**
 * Pure reducer function that handles all history state transitions atomically.
 * Side effects (undo/redo) are handled outside the reducer to avoid
 * state updates during render.
 */
function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "ADD": {
      try {
        const newHistory = state.commands.slice(0, state.step);
        newHistory.push(action.command);

        if (newHistory.length > action.limit) {
          newHistory.shift();
        }

        return { commands: newHistory, step: newHistory.length };
      } catch (error) {
        console.error(`Failed to add command ${action.command.name}: ${error}`);
        return state;
      }
    }
    case "UNDO": {
      if (state.step <= 0) return state;
      return { ...state, step: Math.max(0, state.step - action.steps) };
    }
    case "REDO": {
      if (state.step >= state.commands.length) return state;
      return { ...state, step: Math.min(state.commands.length, state.step + action.steps) };
    }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface HistoryProviderProps<T> {
  children: React.ReactNode;
  limit?: number;
  onUndo?: (value: T) => void;
  onRedo?: (value: T) => void;
}

/**
 * Manages a history of commands to provide undo and redo functionality.
 *
 * Implements the Command design pattern's history tracking. It stores
 * a list of executed commands in a buffer with a limit.
 * When a new command is added after an `undo` operation, any existing `redo`
 * history is cleared. If the history limit is exceeded, the oldest command is
 * discarded.
 */
export function createHistory<T = any>() {
  const Context = createContext<HistoryContextType<T> | null>(null);

  function HistoryProvider({
    children,
    limit = 64,
    onUndo,
    onRedo,
  }: HistoryProviderProps<T>) {
    const [state, dispatch] = useReducer(historyReducer, initialState);

    const canUndo = state.step > 0;
    const canRedo = state.step < state.commands.length;
    const busy = useRef(false);

    const addHistory = useCallback(
      (command: Command<T>, immediate = false) => {
        if (immediate) command.redo();
        dispatch({ type: "ADD", command, limit });
      },
      [limit]
    );

    const undo = useCallback(async (steps = 1) => {
      if (steps <= 0) throw new Error(`undo() requires a positive number of steps, got ${steps}`);
      if (busy.current) return;
      const { commands, step } = state;
      const actual = Math.min(steps, step);
      if (actual === 0) return;

      busy.current = true;
      try {
        for (let index = 0; index < actual; index++) {
          const value = await commands[step - 1 - index].undo();
          onUndo?.(value as T);
        }
        dispatch({ type: "UNDO", steps: actual });
      } finally {
        busy.current = false;
      }
    }, [state, onUndo]);

    const redo = useCallback(async (steps = 1) => {
      if (steps <= 0) throw new Error(`redo() requires a positive number of steps, got ${steps}`);
      if (busy.current) return;
      const { commands, step } = state;
      const actual = Math.min(steps, commands.length - step);
      if (actual === 0) return;

      busy.current = true;
      try {
        for (let index = 0; index < actual; index++) {
          const value = await commands[step + index].redo();
          onRedo?.(value as T);
        }
        dispatch({ type: "REDO", steps: actual });
      } finally {
        busy.current = false;
      }
    }, [state, onRedo]);

    const resetHistory = useCallback(() => {
      dispatch({ type: "RESET" });
    }, []);

    const value = useMemo(
      () => ({
        addHistory,
        undo,
        redo,
        canUndo,
        canRedo,
        resetHistory,
      }),
      [addHistory, undo, redo, canUndo, canRedo, resetHistory]
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useHistory() {
    const context = useContext(Context);
    if (!context) throw new Error("useHistory must be used within a HistoryProvider");
    return context;
  }

  return { HistoryProvider, useHistory };
}