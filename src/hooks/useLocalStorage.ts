import { useEffect } from 'react';
import { Board } from '@/types';
import { StorageService } from '@/utils/storage';
import { handleError } from '@/utils/errorHandler';


export const useLocalStorage = (board: Board, isLoaded: boolean): void => {
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      StorageService.saveBoard(board);
    } catch (error) {
      handleError(error, 'Failed to save changes to localStorage');
    }
  }, [board, isLoaded]);
};