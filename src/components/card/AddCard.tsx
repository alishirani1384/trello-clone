'use client';

import { useState, KeyboardEvent } from 'react';
import styles from './Card.module.scss';

interface AddCardProps {
  onAdd: (title: string) => void;
}

export const AddCard: React.FC<AddCardProps> = ({ onAdd }) => {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
        className={styles.addCardButton}
        onClick={() => setIsAdding(true)}
        aria-label="Add a card"
      >
        + Add a card
      </button>
    );
  }

  return (
    <div className={styles.addCardForm}>
      <textarea
        className={styles.addCardInput}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a title for this card..."
        autoFocus
        rows={3}
      />
      <div className={styles.addCardActions}>
        <button
          className={styles.addCardSubmit}
          onClick={handleAdd}
          disabled={!title.trim()}
        >
          Add Card
        </button>
        <button
          className={styles.addCardCancel}
          onClick={handleCancel}
          aria-label="Cancel"
        >
          ✕
        </button>
      </div>
    </div>
  );
};