export type ID = string;
export type Timestamp = string;
export interface Comment {
  id: ID;
  content: string;
  createdAt: Timestamp;
  author?: string;
}
export interface Card {
  id: ID;
  title: string;
  comments: Comment[];
  order: number;
  createdAt: Timestamp;
}
export interface List {
  id: ID;
  title: string;
  cards: Card[];
  order: number;
  createdAt: Timestamp;
}
export interface Board {
  id: ID;
  title: string;
  lists: List[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
export interface BoardState {
  board: Board;
  isLoaded: boolean;
}

// Zustand actions
export interface BoardActions {
  updateBoardTitle: (title: string) => void;
  loadBoard: () => void;
  addList: (title: string) => void;
  deleteList: (listId: ID) => void;
  updateListTitle: (listId: ID, title: string) => void;
  reorderLists: (startIndex: number, endIndex: number) => void;
  addCard: (listId: ID, title: string) => void;
  updateCardTitle: (listId: ID, cardId: ID, title: string) => void;
  moveCard: (
    sourceListId: ID,
    destinationListId: ID,
    cardId: ID,
    destinationIndex: number
  ) => void;
  addComment: (listId: ID, cardId: ID, content: string) => void;
  getCardComments: (listId: ID, cardId: ID) => Comment[];
}
export type BoardStore = BoardState & BoardActions;
export interface DragItem {
  type: 'list' | 'card';
  id: ID;
  sourceListId?: ID;
}
export interface AppError extends Error {
  code?: string;
  context?: Record<string, unknown>;
}
export interface StorageData {
  board: Board;
  version: string;
}