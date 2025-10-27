'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { Card, Comment, ID } from '@/types';
import { EditableText } from '@/components/common/EditableText';
import styles from './Card.module.scss';

interface CardModalProps {
  card: Card;
  listId: ID;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTitle: (title: string) => void;
  onAddComment: (content: string) => void;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdateTitle,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const handleEsc = (e: globalThis.KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }
  const handleAddComment = (): void => {
    const trimmedComment = commentText.trim();
    
    if (trimmedComment) {
      onAddComment(trimmedComment);
      setCommentText('');
    }
  };
  const handleCommentKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddComment();
    }
  };
  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span className={styles.cardIcon}>📋</span>
            <EditableText
              value={card.title}
              onSave={onUpdateTitle}
              className={styles.modalCardTitle}
              placeholder="Enter card title..."
              isHeading
            />
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              💬 Comments ({card.comments.length})
            </h3>

            <div className={styles.addCommentForm}>
              <textarea
                className={styles.commentInput}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleCommentKeyDown}
                placeholder="Write a comment... (Ctrl+Enter to save)"
                rows={3}
              />
              <button
                className={styles.commentSubmitButton}
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                Add Comment
              </button>
            </div>

            <div className={styles.commentsList}>
              {card.comments.length === 0 ? (
                <p className={styles.noComments}>
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                card.comments.map((comment: Comment) => (
                  <div key={comment.id} className={styles.comment}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>User</span>
                      <span className={styles.commentDate}>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className={styles.commentContent}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};