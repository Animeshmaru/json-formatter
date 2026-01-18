import { useState, useRef, useEffect } from 'react';
import { X, FileJson } from 'lucide-react';
import { Tab } from '@/types';
import { cn } from '@/lib/utils';

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
  onRename: (newName: string) => void;
}

export function TabItem({ tab, isActive, onSelect, onClose, onRename }: TabItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(tab.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(tab.name);
    setIsEditing(true);
  };

  const handleSubmit = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== tab.name) {
      onRename(editValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(tab.name);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <button
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      className={cn(
        'group flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors relative',
        'min-w-[100px] max-w-[180px]',
        isActive
          ? 'bg-card text-foreground border-t-2 border-t-primary'
          : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground border-t-2 border-t-transparent'
      )}
    >
      <FileJson
        className={cn(
          'h-4 w-4 flex-shrink-0',
          !tab.isValid && 'text-destructive'
        )}
      />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none text-sm w-full min-w-0"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="truncate">{tab.name}</span>
      )}
      <span
        onClick={handleClose}
        className={cn(
          'ml-auto flex-shrink-0 p-0.5 rounded hover:bg-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity',
          isActive && 'opacity-100'
        )}
      >
        <X className="h-3 w-3" />
      </span>
    </button>
  );
}
