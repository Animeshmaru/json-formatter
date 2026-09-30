import type { OnMount } from '@monaco-editor/react';
import type { IDisposable } from 'monaco-editor';

type MonacoEditor = Parameters<OnMount>[0];

// Monaco doesn't expose a public API for "did a fold region collapse/expand",
// so this reaches into the folding contribution's internals (the same object
// VS Code itself uses under the hood). If a future monaco-editor upgrade
// renames/removes these, attach() below fails safe and onFoldStateChange
// simply never fires.
interface FoldingRegionsLike {
  length: number;
  isCollapsed(index: number): boolean;
}

interface FoldingModelLike {
  regions: FoldingRegionsLike;
  onDidChange(listener: () => void): IDisposable;
}

interface FoldingControllerLike {
  getFoldingModel?: () => Promise<FoldingModelLike | null> | null;
}

/**
 * Reports (via `onFoldStateChange`) whether every foldable region in the
 * document is currently collapsed, so callers can flip a "Collapse All" /
 * "Unfold All" toggle accordingly.
 *
 * Returns a disposable that tears down all listeners.
 */
export function attachFoldStateTracking(editorInstance: MonacoEditor, onFoldStateChange: (allFolded: boolean) => void): IDisposable {
  let disposed = false;
  let foldingModelSub: IDisposable | null = null;

  const reportState = (foldingModel: FoldingModelLike) => {
    if (disposed) return;
    const regions = foldingModel.regions;
    let allFolded = regions.length > 0;
    for (let i = 0; i < regions.length; i++) {
      if (!regions.isCollapsed(i)) {
        allFolded = false;
        break;
      }
    }
    onFoldStateChange(allFolded);
  };

  const attach = () => {
    foldingModelSub?.dispose();
    foldingModelSub = null;

    const controller = editorInstance.getContribution('editor.contrib.folding') as unknown as FoldingControllerLike | null;
    const modelPromise = controller?.getFoldingModel?.();
    modelPromise?.then((foldingModel) => {
      if (disposed || !foldingModel) return;
      reportState(foldingModel);
      foldingModelSub = foldingModel.onDidChange(() => reportState(foldingModel));
    });
  };

  attach();
  const modelChangeSub = editorInstance.onDidChangeModel(() => attach());
  const disposeSub = editorInstance.onDidDispose(() => dispose());

  function dispose() {
    if (disposed) return;
    disposed = true;
    foldingModelSub?.dispose();
    modelChangeSub.dispose();
    disposeSub.dispose();
  }

  return { dispose };
}
