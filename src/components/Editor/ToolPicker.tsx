import { Lock, ArrowRightLeft } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ENCODERS } from '@/toolsData/encoders';
import { CONVERTERS } from '@/toolsData/converters';

interface ToolPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectEncoder: (id: string) => void;
  onSelectConverter: (id: string) => void;
}

export function ToolPicker({ open, onOpenChange, onSelectEncoder, onSelectConverter }: ToolPickerProps) {
  const select = (fn: (id: string) => void, id: string) => {
    fn(id);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <DialogTitle>Tools</DialogTitle>
        <DialogDescription>Search and run an encoder or converter tool</DialogDescription>
      </VisuallyHidden>
      <CommandInput placeholder="Search tools..." />
      <CommandList>
        <CommandEmpty>No tools found.</CommandEmpty>
        <CommandGroup heading="Encoders">
          {ENCODERS.map((enc) => (
            <CommandItem
              key={enc.id}
              value={enc.label}
              onSelect={() => select(onSelectEncoder, enc.id)}
              className="gap-2"
            >
              <Lock className="text-primary" />
              {enc.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Converters">
          {CONVERTERS.map((conv) => (
            <CommandItem
              key={conv.id}
              value={conv.label}
              onSelect={() => select(onSelectConverter, conv.id)}
              className="gap-2"
            >
              <ArrowRightLeft className="text-primary" />
              {conv.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
