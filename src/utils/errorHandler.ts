import { AppError } from '@/types';

export class TrelloCloneError extends Error implements AppError {
  code?: string;
  context?: Record<string, unknown>;

  constructor(message: string, code?: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'TrelloCloneError';
    this.code = code;
    this.context = context;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TrelloCloneError);
    }
  }
}

export enum ErrorCode {
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE = 'DUPLICATE',
  UNKNOWN = 'UNKNOWN',
}

export const handleError = (error: unknown, fallbackMessage = 'An unexpected error occurred'): string => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  if (error instanceof TrelloCloneError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallbackMessage;
};


export const validateNonEmpty = (value: string, fieldName: string): void => {
  if (!value || value.trim().length === 0) {
    throw new TrelloCloneError(
      `${fieldName} cannot be empty`,
      ErrorCode.VALIDATION_ERROR,
      { fieldName, value }
    );
  }
};


export const safeExecute = async <T>(
  fn: () => T | Promise<T>,
  errorMessage?: string
): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (error) {
    handleError(error, errorMessage);
    return undefined;
  }
};