'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { List as ListType, ID } from '@/types';
import { List } from './List';
import styles from './List.module.scss';

interface SortableListProps {
  list: ListType;
  index: number;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  onAddCard: (title: string) => void;
  onUpdateCardTitle: (cardId: ID, title: string) => void;
  onOpenCardModal: (cardId: ID) => void;
}


export const SortableList: React.FC<SortableListProps> = ({
  list,
  index,
  ...props
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: 'list',
      index,
      list
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.sortableListWrapper}>
      <List
        list={list}
        index={index}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        {...props}
      />
    </div>
  );
};