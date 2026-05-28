"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import { Command } from "./types";

interface HistoryContextType<T> {
  addHistory: (command: Command<T>, immediate?: boolean) => void;
  undo: () => void;
  redo: () => void;
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
  | { type: "UNDO" }
  | { type: "REDO" }
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
      return { ...state, step: state.step - 1 };
    }
    case "REDO": {
      if (state.step >= state.commands.length) return state;
      return { ...state, step: state.step + 1 };
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

    const addHistory = useCallback(
      (command: Command<T>, immediate = false) => {
        if (immediate) command.redo();
        dispatch({ type: "ADD", command, limit });
      },
      [limit]
    );

    const undo = useCallback(() => {
      const { commands, step } = state;
      if (step <= 0) return;

      const command = commands[step - 1];
      const value = command.undo();
      onUndo?.(value as T);
      dispatch({ type: "UNDO" });
    }, [state, onUndo]);

    const redo = useCallback(() => {
      const { commands, step } = state;
      if (step >= commands.length) return;

      const command = commands[step];
      const value = command.redo();
      onRedo?.(value as T);
      dispatch({ type: "REDO" });
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