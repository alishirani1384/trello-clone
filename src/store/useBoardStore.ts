/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { Board, BoardStore, ID, List, Card, Comment } from '@/types';
import { StorageService, generateId, getCurrentTimestamp } from '@/utils/storage';
import { validateNonEmpty, TrelloCloneError, ErrorCode } from '@/utils/errorHandler';

const createInitialBoard = (): Board => ({
  id: generateId(),
  title: 'Demo Board',
  lists: [
    {
      id: generateId(),
      title: 'To Do',
      order: 0,
      cards: [
        {
          id: generateId(),
          title: 'Welcome to Trello Clone! 👋',
          comments: [
            {
              id: generateId(),
              content: 'This is a sample comment. Click on a card to add your own!',
              createdAt: getCurrentTimestamp(),
            },
          ],
          order: 0,
          createdAt: getCurrentTimestamp(),
        },
        {
          id: generateId(),
          title: 'Drag and drop cards between lists',
          comments: [],
          order: 1,
          createdAt: getCurrentTimestamp(),
        },
      ],
      createdAt: getCurrentTimestamp(),
    },
    {
      id: generateId(),
      title: 'In Progress',
      order: 1,
      cards: [
        {
          id: generateId(),
          title: 'Click on any title to edit it ✏️',
          comments: [],
          order: 0,
          createdAt: getCurrentTimestamp(),
        },
      ],
      createdAt: getCurrentTimestamp(),
    },
    {
      id: generateId(),
      title: 'Done',
      order: 2,
      cards: [],
      createdAt: getCurrentTimestamp(),
    },
  ],
  createdAt: getCurrentTimestamp(),
  updatedAt: getCurrentTimestamp(),
});

export const useBoardStore = create<BoardStore>((set, get) => ({
  board: createInitialBoard(),
  isLoaded: false,
  loadBoard: () => {
    try {
      const savedBoard = StorageService.loadBoard();
      
      if (savedBoard) {
        set({ board: savedBoard, isLoaded: true });
      } else {
        const initialBoard = createInitialBoard();
        StorageService.saveBoard(initialBoard);
        set({ board: initialBoard, isLoaded: true });
      }
    } catch (error) {
      console.error('Failed to load board:', error);
      const initialBoard = createInitialBoard();
      set({ board: initialBoard, isLoaded: true });
    }
  },
  updateBoardTitle: (title: string) => {
    try {
      validateNonEmpty(title, 'Board title');
      
      set((state) => ({
        board: {
          ...state.board,
          title,
          updatedAt: getCurrentTimestamp(),
        },
      }));
    } catch (error) {
      throw new TrelloCloneError(
        'Failed to update board title',
        ErrorCode.VALIDATION_ERROR,
        { title }
      );
    }
  },
  addList: (title: string) => {
    try {
      validateNonEmpty(title, 'List title');

      const { board } = get();
      const newList: List = {
        id: generateId(),
        title,
        cards: [],
        order: board.lists.length,
        createdAt: getCurrentTimestamp(),
      };

      set((state) => ({
        board: {
          ...state.board,
          lists: [...state.board.lists, newList],
          updatedAt: getCurrentTimestamp(),
        },
      }));
    } catch (error) {
      throw new TrelloCloneError(
        'Failed to add list',
        ErrorCode.VALIDATION_ERROR,
        { title }
      );
    }
  },
  deleteList: (listId: ID) => {
    set((state) => ({
      board: {
        ...state.board,
        lists: state.board.lists
          .filter((list) => list.id !== listId)
          .map((list, index) => ({ ...list, order: index })),
        updatedAt: getCurrentTimestamp(),
      },
    }));
  },
  updateListTitle: (listId: ID, title: string) => {
    try {
      validateNonEmpty(title, 'List title');

      set((state) => ({
        board: {
          ...state.board,
          lists: state.board.lists.map((list) =>
            list.id === listId ? { ...list, title } : list
          ),
          updatedAt: getCurrentTimestamp(),
        },
      }));
    } catch (error) {
      throw new TrelloCloneError(
        'Failed to update list title',
        ErrorCode.VALIDATION_ERROR,
        { listId, title }
      );
    }
  },
  reorderLists: (startIndex: number, endIndex: number) => {
    set((state) => {
      const lists = [...state.board.lists];
      const [removed] = lists.splice(startIndex, 1);
      lists.splice(endIndex, 0, removed);

      const reorderedLists = lists.map((list, index) => ({
        ...list,
        order: index,
      }));

      return {
        board: {
          ...state.board,
          lists: reorderedLists,
          updatedAt: getCurrentTimestamp(),
        },
      };
    });
  },
  addCard: (listId: ID, title: string) => {
    try {
      validateNonEmpty(title, 'Card title');

      set((state) => {
        const lists = state.board.lists.map((list) => {
          if (list.id === listId) {
            const newCard: Card = {
              id: generateId(),
              title,
              comments: [],
              order: list.cards.length,
              createdAt: getCurrentTimestamp(),
            };

            return {
              ...list,
              cards: [...list.cards, newCard],
            };
          }
          return list;
        });

        return {
          board: {
            ...state.board,
            lists,
            updatedAt: getCurrentTimestamp(),
          },
        };
      });
    } catch (error) {
      throw new TrelloCloneError(
        'Failed to add card',
        ErrorCode.VALIDATION_ERROR,
        { listId, title }
      );
    }
  },

  updateCardTitle: (listId: ID, cardId: ID, title: string) => {
    try {
      validateNonEmpty(title, 'Card title');

      set((state) => ({
        board: {
          ...state.board,
          lists: state.board.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  cards: list.cards.map((card) =>
                    card.id === cardId ? { ...card, title } : card
                  ),
                }
              : list
          ),
          updatedAt: getCurrentTimestamp(),
        },
      }));
    } catch (error) {
      throw new TrelloCloneError(
        'Failed to update card title',
        ErrorCode.VALIDATION_ERROR,
        { listId, cardId, title }
      );
    }
  },
  moveCard: (
    sourceListId: ID,
    destinationListId: ID,
    cardId: ID,
    destinationIndex: number
  ) => {
    set((state) => {
      const lists = [...state.board.lists];
      const sourceList = lists.find((l) => l.id === sourceListId);
      const destinationList = lists.find((l) => l.id === destinationListId);

      if (!sourceList || !destinationList) {
        return state;
      }

      const cardIndex = sourceList.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) {
        return state;
      }

      const [card] = sourceList.cards.splice(cardIndex, 1);

      destinationList.cards.splice(destinationIndex, 0, card);

      sourceList.cards = sourceList.cards.map((c, i) => ({ ...c, order: i }));
      destinationList.cards = destinationList.cards.map((c, i) => ({
        ...c,
        order: i,
      }));

      return {
        board: {
          ...state.board,
          lists,
          updatedAt: getCurrentTimestamp(),
        },
      };
    });
  },
  addComment: (listId: ID, cardId: ID, content: string) => {
    try {
      validateNonEmpty(content, 'Comment');

      const newComment: Comment = {
        id: generateId(),
        content,
        createdAt: getCurrentTimestamp(),
      };

      set((state) => ({
        board: {
          ...state.board,
          lists: state.board.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  cards: list.cards.map((card) =>
                    card.id === cardId
                      ? {
                          ...card,
                          comments: [...card.comments, newComment],
                        }
                      : card
                  ),
                }
              : list
          ),
          updatedAt: getCurrentTimestamp(),
        },
      }));
    } catch (error) {
      throw new TrelloCloneError(
        'Failed to add comment',
        ErrorCode.VALIDATION_ERROR,
        { listId, cardId, content }
      );
    }
  },
  getCardComments: (listId: ID, cardId: ID): Comment[] => {
    const { board } = get();
    const list = board.lists.find((l) => l.id === listId);
    const card = list?.cards.find((c) => c.id === cardId);
    return card?.comments || [];
  },
}));