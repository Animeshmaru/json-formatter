import { Plus } from 'lucide-react';
import { Tab } from '@/types';
import { TabItem } from './TabItem';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onRenameTab: (id: string, name: string) => void;
  onAddTab: () => void;
}

export function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onRenameTab,
  onAddTab,
}: TabBarProps) {
  return (
    <div className="flex items-center bg-muted border-b border-border">
      <ScrollArea className="flex-1">
        <div className="flex items-end">
          {tabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onSelect={() => onSelectTab(tab.id)}
              onClose={() => onCloseTab(tab.id)}
              onRename={(name) => onRenameTab(tab.id, name)}
            />
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
