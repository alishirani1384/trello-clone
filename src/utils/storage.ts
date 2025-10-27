import { Board, StorageData } from '@/types';
import { TrelloCloneError, ErrorCode } from './errorHandler';

const STORAGE_KEY = 'trello-clone-board';
const STORAGE_VERSION = '1.0.0';

export class StorageService {
  private static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
  static saveBoard(board: Board): void {
    if (!this.isStorageAvailable()) {
      throw new TrelloCloneError(
        'localStorage is not available',
        ErrorCode.STORAGE_ERROR
      );
    }

    try {
      const data: StorageData = {
        board,
        version: STORAGE_VERSION,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      throw new TrelloCloneError(
        'Failed to save board data',
        ErrorCode.STORAGE_ERROR,
        { originalError: error }
      );
    }
  }
  static loadBoard(): Board | null {
    if (!this.isStorageAvailable()) {
      throw new TrelloCloneError(
        'localStorage is not available',
        ErrorCode.STORAGE_ERROR
      );
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      
      if (!data) {
        return null;
      }

      const parsed: StorageData = JSON.parse(data);
      
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('Storage version mismatch, migration may be needed');
      }

      return parsed.board;
    } catch (error) {
      throw new TrelloCloneError(
        'Failed to load board data',
        ErrorCode.STORAGE_ERROR,
        { originalError: error }
      );
    }
  }

  static clearBoard(): void {
    if (this.isStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};