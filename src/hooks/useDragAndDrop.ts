import {
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { ID } from '@/types';

interface ActiveDragItem {
  id: ID;
  type: 'list' | 'card';
  sourceListId?: ID;
}
interface UseDragAndDropReturn {
  sensors: ReturnType<typeof useSensors>;
  activeItem: ActiveDragItem | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
}

interface UseDragAndDropProps {
  onListReorder: (startIndex: number, endIndex: number) => void;
  onCardMove: (
    sourceListId: ID,
    destinationListId: ID,
    cardId: ID,
    destinationIndex: number
  ) => void;
}
export const useDragAndDrop = ({
  onListReorder,
  onCardMove,
}: UseDragAndDropProps): UseDragAndDropReturn => {
  const [activeItem, setActiveItem] = useState<ActiveDragItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent): void => {
    const { active } = event;
    const data = active.data.current as {
      type: 'list' | 'card';
      index: number;
      listId?: ID;
    };

    setActiveItem({
      id: active.id as ID,
      type: data.type,
      sourceListId: data.listId,
    });
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    // No valid drop target or dropped on itself
    if (!over || active.id === over.id) {
      setActiveItem(null);
      return;
    }

    const activeData = active.data.current as {
      type: 'list' | 'card';
      index: number;
      listId?: ID;
    };

    const overData = over.data.current as {
      type: 'list' | 'card';
      index: number;
      listId?: ID;
    };

    // Handle list reordering
    if (activeData.type === 'list' && overData.type === 'list') {
      onListReorder(activeData.index, overData.index);
    }

    // Handle card moving
    if (activeData.type === 'card') {
      const sourceListId = activeData.listId!;
      
      // Determine destination list
      let destinationListId: ID;
      let destinationIndex: number;

      if (overData.type === 'card') {
        // Dropped on another card
        destinationListId = overData.listId!;
        destinationIndex = overData.index;
      } else if (overData.type === 'list') {
        // Dropped on an empty list
        destinationListId = over.id as ID;
        destinationIndex = 0;
      } else {
        setActiveItem(null);
        return;
      }

      onCardMove(sourceListId, destinationListId, active.id as ID, destinationIndex);
    }

    setActiveItem(null);
  };
  const handleDragCancel = (): void => {
    setActiveItem(null);
  };

  return {
    sensors,
    activeItem,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};