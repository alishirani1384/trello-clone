'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType, ID } from '@/types';
import { EditableText } from '@/components/common/EditableText';
import styles from './Card.module.scss';

interface CardProps {
  card: CardType;
  listId: ID;
  index: number;
  onUpdateTitle: (title: string) => void;
  onOpenModal: () => void;
}

export const Card: React.FC<CardProps> = ({
  card,
  listId,
  index,
  onUpdateTitle,
  onOpenModal,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      index,
      listId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardClassName = `${styles.card} ${isDragging ? styles.dragging : ''}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cardClassName}
      {...attributes}
      {...listeners}
    >
      <div className={styles.content}>
        <EditableText
          value={card.title}
          onSave={onUpdateTitle}
          className={styles.title}
          placeholder="Enter card title..."
        />
        
        {card.comments.length > 0 && (
          <div className={styles.metadata}>
            <span className={styles.commentBadge} title="Comments">
              💬 {card.comments.length}
            </span>
          </div>
        )}
      </div>
      
      <button
        className={styles.detailsButton}
        onClick={(e) => {
          e.stopPropagation();
          onOpenModal();
        }}
        aria-label="View card details"
      >
        Details
      </button>
    </div>
  );
};