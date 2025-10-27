'use client';

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import styles from './EditableText.module.scss';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  isHeading?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  className = '',
  placeholder = 'Enter text...',
  multiline = false,
  isHeading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);


  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = (): void => {
    const trimmedValue = editValue.trim();
    
    if (trimmedValue && trimmedValue !== value) {
      onSave(trimmedValue);
    } else if (!trimmedValue) {
      // Revert to original value if empty
      setEditValue(value);
    }
    
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && multiline && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleBlur = (): void => {
    handleSave();
  };

  if (isEditing) {
    const commonProps = {
      onKeyDown: handleKeyDown,
      onBlur: handleBlur,
      placeholder,
      className: styles.input,
    };

    if (multiline) {
      const textareaProps = {
        ...commonProps,
        ref: inputRef as React.RefObject<HTMLTextAreaElement>,
        value: editValue,
        onChange: (e: ChangeEvent<HTMLTextAreaElement>) => setEditValue(e.target.value),
      };

      return <textarea {...textareaProps} rows={3} />;
    } else {
      const inputProps = {
        ...commonProps,
        ref: inputRef as React.RefObject<HTMLInputElement>,
        value: editValue,
        onChange: (e: ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value),
        type: 'text' as const,
      };

      return <input {...inputProps} />;
    }
  }

  const displayClassName = `${styles.display} ${className} ${
    isHeading ? styles.heading : ''
  }`;

  return (
    <div
      className={displayClassName}
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsEditing(true);
        }
      }}
    >
      {value}
    </div>
  );
};