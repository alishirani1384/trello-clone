'use client';

import { useEffect, useState } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStore } from '@/store/useBoardStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { ID } from '@/types';
import { EditableText } from '@/components/common/EditableText';
import { AddList } from '@/components/list/AddList';
import { CardModal } from '@/components/card/CardModal';
import { handleError } from '@/utils/errorHandler';
import styles from './Board.module.scss';
import { useShallow } from 'zustand/shallow';
import { SortableList } from '../list/SortableList';

export const Board: React.FC = () => {
  const {
    board,
    isLoaded,
    loadBoard,
    updateBoardTitle,
    addList,
    deleteList,
    updateListTitle,
    reorderLists,
    addCard,
    updateCardTitle,
    moveCard,
    addComment,
  } = useBoardStore(useShallow((state) => ({board: state.board, isLoaded: state.isLoaded, loadBoard: state.loadBoard, updateBoardTitle: state.updateBoardTitle, addList: state.addList, deleteList: state.deleteList, updateListTitle: state.updateListTitle, reorderLists: state.reorderLists, addCard: state.addCard, updateCardTitle: state.updateCardTitle, moveCard: state.moveCard, addComment: state.addComment, getCardComments: state.getCardComments})));

  const [selectedCard, setSelectedCard] = useState<{
    listId: ID;
    cardId: ID;
  } | null>(null);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  useLocalStorage(board, isLoaded);

  const { sensors, activeItem, handleDragStart, handleDragEnd, handleDragCancel } =
    useDragAndDrop({
      onListReorder: reorderLists,
      onCardMove: moveCard,
    });

  const handleOpenCardModal = (listId: ID, cardId: ID): void => {
    setSelectedCard({ listId, cardId });
  };

  
  const handleCloseCardModal = (): void => {
    setSelectedCard(null);
  };

 
  const getSelectedCardData = () => {
    if (!selectedCard) return null;

    const list = board.lists.find((l) => l.id === selectedCard.listId);
    const card = list?.cards.find((c) => c.id === selectedCard.cardId);

    return card && list ? { card, list } : null;
  };

  const renderDragOverlay = () => {
    if (!activeItem) return null;

    if (activeItem.type === 'list') {
      const list = board.lists.find((l) => l.id === activeItem.id);
      return (
        <div className={styles.dragOverlay}>
          <div className={styles.dragOverlayList}>
            📋 {list?.title || 'List'}
          </div>
        </div>
      );
    }

    if (activeItem.type === 'card' && activeItem.sourceListId) {
      const list = board.lists.find((l) => l.id === activeItem.sourceListId);
      const card = list?.cards.find((c) => c.id === activeItem.id);
      return (
        <div className={styles.dragOverlay}>
          <div className={styles.dragOverlayCard}>
            📝 {card?.title || 'Card'}
          </div>
        </div>
      );
    }

    return null;
  };

  if (!isLoaded) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading board...</p>
      </div>
    );
  }

  const selectedCardData = getSelectedCardData();
  const listIds = board.lists.map((list) => list.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={styles.board}>
        {/* Board Header */}
        <header className={styles.header}>
          <EditableText
            value={board.title}
            onSave={(title) => {
              try {
                updateBoardTitle(title);
              } catch (error) {
                alert(handleError(error));
              }
            }}
            className={styles.boardTitle}
            placeholder="Enter board title..."
            isHeading
          />
          
        </header>

        {/* Lists Container */}
        <div className={styles.listsContainer}>
          <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
            {board.lists.map((list, index) => (
              <div key={list.id} className={styles.listWrapper}>
                <SortableList
                  key={list.id}
                  list={list}
                  index={index}
                  onUpdateTitle={(title) => {
                    try {
                      updateListTitle(list.id, title);
                    } catch (error) {
                      alert(handleError(error));
                    }
                  }}
                  onDelete={() => deleteList(list.id)}
                  onAddCard={(title) => {
                    try {
                      addCard(list.id, title);
                    } catch (error) {
                      alert(handleError(error));
                    }
                  }}
                  onUpdateCardTitle={(cardId, title) => {
                    try {
                      updateCardTitle(list.id, cardId, title);
                    } catch (error) {
                      alert(handleError(error));
                    }
                  }}
                  onOpenCardModal={(cardId) => handleOpenCardModal(list.id, cardId)}
                />
              </div>
            ))}
          </SortableContext>

          {/* Add List Button */}
          <AddList
            onAdd={(title) => {
              try {
                addList(title);
              } catch (error) {
                alert(handleError(error));
              }
            }}
          />
        </div>

        {/* Card Modal */}
        {selectedCardData && (
          <CardModal
            card={selectedCardData.card}
            listId={selectedCard!.listId}
            isOpen={true}
            onClose={handleCloseCardModal}
            onUpdateTitle={(title) => {
              try {
                updateCardTitle(selectedCard!.listId, selectedCard!.cardId, title);
              } catch (error) {
                alert(handleError(error));
              }
            }}
            onAddComment={(content) => {
              try {
                addComment(selectedCard!.listId, selectedCard!.cardId, content);
              } catch (error) {
                alert(handleError(error));
              }
            }}
          />
        )}

        {/* Drag Overlay (visual feedback during drag) */}
        <DragOverlay>
          {renderDragOverlay()}
        </DragOverlay>
      </div>
    </DndContext>
  );
};