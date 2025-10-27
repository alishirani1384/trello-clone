'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { List as ListType, ID } from '@/types';
import { Card } from '@/components/card/Card';
import { AddCard } from '@/components/card/AddCard';
import { ListHeader } from './ListHeader';
import styles from './List.module.scss';

interface ListProps {
  list: ListType;
  index: number;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  onAddCard: (title: string) => void;
  onUpdateCardTitle: (cardId: ID, title: string) => void;
  onOpenCardModal: (cardId: ID) => void;
}

export const List: React.FC<ListProps> = ({
  list,
  index,
  isDragging = false,
  dragHandleProps = {},
  onUpdateTitle,
  onDelete,
  onAddCard,
  onUpdateCardTitle,
  onOpenCardModal,
}) => {
  const { setNodeRef } = useDroppable({
    id: list.id,
    data: {
      type: 'list',
      index,
    },
  });

  const cardIds = list.cards.map((card) => card.id);

  const listClassName = `${styles.list} ${isDragging ? styles.dragging : ''}`;
  return (
    <div className={listClassName}>
      <ListHeader
        title={list.title}
        onUpdateTitle={onUpdateTitle}
        onDelete={onDelete}
        dragHandleProps={dragHandleProps}
      />

      <div ref={setNodeRef} className={styles.cardsContainer}>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {list.cards.map((card, cardIndex) => (
            <Card
              key={card.id}
              card={card}
              listId={list.id}
              index={cardIndex}
              onUpdateTitle={(title) => onUpdateCardTitle(card.id, title)}
              onOpenModal={() => onOpenCardModal(card.id)}
            />
          ))}
        </SortableContext>
      </div>

      <div className={styles.addCardContainer}>
        <AddCard onAdd={onAddCard} />
      </div>
    </div>
  );
};