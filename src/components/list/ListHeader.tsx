'use client';

import { useEffect, useRef, useState } from 'react';
import { EditableText } from '@/components/common/EditableText';
import styles from './List.module.scss';

interface ListHeaderProps {
  title: string;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  dragHandleProps?: Record<string, unknown>;
}

export const ListHeader: React.FC<ListHeaderProps> = ({
  title,
  onUpdateTitle,
  onDelete,
  dragHandleProps = {},
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleDelete = (): void => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      onDelete();
      setShowMenu(false);
    }
  };

  return (
    <div className={styles.listHeader}>
        <button
        className={styles.dragHandle}
        {...dragHandleProps}
        aria-label="Drag to reorder list"
        title="Drag to reorder"
      >
        ⋮⋮
      </button>
      <EditableText
        value={title}
        onSave={onUpdateTitle}
        className={styles.listTitle}
        placeholder="Enter list title..."
      />
      
      <div className={styles.listActions} ref={menuRef}>
        <button
          className={styles.menuButton}
          onClick={() => setShowMenu(!showMenu)}
          aria-label="List menu"
        >
          ⋯
        </button>
        
        {showMenu && (
          <div className={styles.menu}>
            <button
              className={styles.menuItem}
              onClick={handleDelete}
            >
              🗑️ Delete List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};