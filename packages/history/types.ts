/**
 * Defines an action that can be executed and reverted.
 * Tells the action **WHAT** happends.
 */
export type Command<T = any> = {
  name: string; // Name of the action.

  /**
   * Undo the action attached to the command.
   */
  undo: () => T;

  /**
   * Redo the action attached to the command.
   */
  redo: () => T;
}