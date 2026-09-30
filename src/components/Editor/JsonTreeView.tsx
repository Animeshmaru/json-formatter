import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { stripJsonComments } from '@/utils/jsonFormatter';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type JsonType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

interface JsonTreeViewProps {
  content: string;
}

export interface JsonTreeViewHandle {
  collapseAll: () => void;
  expandAll: () => void;
}

function typeOf(value: JsonValue): JsonType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as 'string' | 'number' | 'boolean' | 'object';
}

function containerEntries(value: JsonValue): [string, JsonValue][] | null {
  const type = typeOf(value);
  if (type === 'array') return (value as JsonValue[]).map((v, i) => [String(i), v]);
  if (type === 'object') return Object.entries(value as Record<string, JsonValue>);
  return null;
}

// Collects the path of every non-empty object/array in the tree, so
// collapseAll can mark them all collapsed in one shot.
function collectContainerPaths(value: JsonValue, path: string, acc: string[]) {
  const entries = containerEntries(value);
  if (!entries || entries.length === 0) return;
  acc.push(path);
  for (const [key, child] of entries) {
    collectContainerPaths(child, `${path}.${key}`, acc);
  }
}

export const JsonTreeView = forwardRef<JsonTreeViewHandle, JsonTreeViewProps>(function JsonTreeView(
  { content },
  ref
) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((path: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const parsed = useMemo(() => {
    if (!content.trim()) return { ok: true as const, value: undefined as JsonValue | undefined };
    try {
      return { ok: true as const, value: JSON.parse(stripJsonComments(content)) as JsonValue };
    } catch {
      return { ok: false as const, value: undefined };
    }
  }, [content]);

  useImperativeHandle(
    ref,
    () => ({
      collapseAll: () => {
        if (!parsed.ok || parsed.value === undefined) return;
        const paths: string[] = [];
        collectContainerPaths(parsed.value, '$', paths);
        setCollapsed(new Set(paths));
      },
      expandAll: () => setCollapsed(new Set()),
    }),
    [parsed]
  );

  if (!content.trim()) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-editor text-muted-foreground text-sm">
        Nothing to show
      </div>
    );
  }

  if (!parsed.ok) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-editor text-muted-foreground text-sm text-center px-6">
        Fix the JSON errors to see the tree view
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-editor font-mono text-sm px-3 py-3">
      <TreeNode
        label={null}
        value={parsed.value as JsonValue}
        path="$"
        depth={0}
        isLast
        collapsed={collapsed}
        onToggle={toggle}
      />
    </div>
  );
});

interface TreeNodeProps {
  label: { key: string; isIndex: boolean } | null;
  value: JsonValue;
  path: string;
  depth: number;
  isLast: boolean;
  collapsed: Set<string>;
  onToggle: (path: string) => void;
}

function KeyLabel({ label }: { label: TreeNodeProps['label'] }) {
  if (!label) return null;
  return (
    <>
      {label.isIndex ? (
        <span className="text-muted-foreground">{label.key}</span>
      ) : (
        <span className="text-primary">&quot;{label.key}&quot;</span>
      )}
      <span className="text-muted-foreground mr-1">:</span>
    </>
  );
}

function ValueLabel({ type, value }: { type: JsonType; value: JsonValue }) {
  switch (type) {
    case 'string':
      return <span className="text-amber-600 dark:text-amber-400">&quot;{value as string}&quot;</span>;
    case 'number':
      return <span className="text-blue-600 dark:text-blue-400">{String(value)}</span>;
    case 'boolean':
      return <span className="text-purple-600 dark:text-purple-400">{String(value)}</span>;
    case 'null':
      return <span className="text-muted-foreground italic">null</span>;
    default:
      return null;
  }
}

function TreeNode({ label, value, path, depth, isLast, collapsed, onToggle }: TreeNodeProps) {
  const type = typeOf(value);
  const isContainer = type === 'object' || type === 'array';
  const indent = depth * 16;

  if (!isContainer) {
    return (
      <div className="flex items-start leading-6" style={{ paddingLeft: indent }}>
        <span className="w-[18px] shrink-0" />
        <KeyLabel label={label} />
        <ValueLabel type={type} value={value} />
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  const entries = containerEntries(value) ?? [];
  const count = entries.length;
  const isCollapsed = collapsed.has(path);
  const bracketOpen = type === 'array' ? '[' : '{';
  const bracketClose = type === 'array' ? ']' : '}';
  const countLabel = `${count} ${type === 'array' ? (count === 1 ? 'item' : 'items') : count === 1 ? 'key' : 'keys'}`;

  return (
    <div>
      <div
        className={`flex items-center leading-6 -mx-1 px-1 rounded-sm ${count > 0 ? 'cursor-pointer hover:bg-secondary/50' : ''}`}
        style={{ paddingLeft: indent }}
        onClick={count > 0 ? () => onToggle(path) : undefined}
      >
        {count > 0 ? (
          isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <KeyLabel label={label} />
        <span className="text-muted-foreground">{bracketOpen}</span>
        {isCollapsed && count > 0 && (
          <span className="text-muted-foreground/70 italic mx-1.5 text-xs">{countLabel}</span>
        )}
        {isCollapsed && <span className="text-muted-foreground">{bracketClose}</span>}
        {!isCollapsed && count > 0 && (
          <span className="text-muted-foreground/70 italic ml-2 text-xs">{countLabel}</span>
        )}
        {isCollapsed && !isLast && <span className="text-muted-foreground">,</span>}
      </div>
      {!isCollapsed && (
        <>
          {entries.map(([key, childValue], i) => (
            <TreeNode
              key={key}
              label={type === 'array' ? { key, isIndex: true } : { key, isIndex: false }}
              value={childValue}
              path={`${path}.${key}`}
              depth={depth + 1}
              isLast={i === entries.length - 1}
              collapsed={collapsed}
              onToggle={onToggle}
            />
          ))}
          <div className="flex items-center leading-6" style={{ paddingLeft: indent }}>
            <span className="w-3.5 shrink-0" />
            <span className="text-muted-foreground">{bracketClose}</span>
            {!isLast && <span className="text-muted-foreground">,</span>}
          </div>
        </>
      )}
    </div>
  );
}
