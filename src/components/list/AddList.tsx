'use client';

import { useState, KeyboardEvent } from 'react';
import styles from './List.module.scss';

interface AddListProps {
  onAdd: (title: string) => void;
}

export const AddList: React.FC<AddListProps> = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleAdd = (): void => {
    const trimmedTitle = title.trim();
    
    if (trimmedTitle) {
      onAdd(trimmedTitle);
      setTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      setTitle('');
      setIsAdding(false);
    }
  };
  const handleCancel = (): void => {
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        className={styles.addListButton}
        onClick={() => setIsAdding(true)}
        aria-label="Add a list"
      >
        + Add another list
      </button>
    );
  }

  return (
    <div className={styles.addListForm}>
      <input
        className={styles.addListInput}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter list title..."
        autoFocus
      />
      <div className={styles.addListActions}>
        <button
          className={styles.addListSubmit}
          onClick={handleAdd}
          disabled={!title.trim()}
        >
          Add List
        </button>
        <button
          className={styles.addListCancel}
          onClick={handleCancel}
          aria-label="Cancel"
        >
          ✕
        </button>
      </div>
    </div>
  );
};