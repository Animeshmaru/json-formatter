import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Tab } from '@/types';
import { TabItem } from './TabItem';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onRenameTab: (id: string, name: string) => void;
  onAddTab: () => void;
  onReorderTabs: (fromIndex: number, toIndex: number) => void;
}

export function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onRenameTab,
  onAddTab,
  onReorderTabs,
}: TabBarProps) {
  const dragIndex = useRef<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex.current !== null && dragIndex.current !== index) {
      onReorderTabs(dragIndex.current, index);
    }
    dragIndex.current = null;
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDropIndex(null);
  };

  return (
    <div className="flex items-center bg-muted border-b border-border">
      <ScrollArea className="flex-1">
        <div className="flex items-end">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'transition-transform duration-100 cursor-grab active:cursor-grabbing',
                dropIndex === index && dragIndex.current !== index && 'translate-x-1 opacity-60'
              )}
            >
              <TabItem
                tab={tab}
                isActive={tab.id === activeTabId}
                onSelect={() => onSelectTab(tab.id)}
                onClose={() => onCloseTab(tab.id)}
                onRename={(name) => onRenameTab(tab.id, name)}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Button
        variant="ghost"
        size="icon"
        onClick={onAddTab}
        className="
          h-8 w-8 mx-2
          text-muted-foreground
          hover:text-foreground
          hover:bg-secondary
          flex-shrink-0
        "
        title="New tab (Ctrl/Cmd + T)"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
