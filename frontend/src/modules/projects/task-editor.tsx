import MDEditor from '@uiw/react-md-editor';
import { useCallback, useEffect } from 'react';
import type { Mode } from '~/store/theme';
import { useHotkeys } from '~/hooks/use-hot-keys';

interface TaskEditorProps {
  markdown: string;
  setMarkdown: (newValue: string) => void;
  id: string;
  mode: Mode;
  toggleTaskClick?: (id: string) => void;
}

export const TaskEditor = ({ markdown, setMarkdown, id, mode, toggleTaskClick }: TaskEditorProps) => {
  const handleMDEscKeyPress: React.KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === 'Escape') toggleTaskClick?.(id);
    },
    [toggleTaskClick, id],
  );

  const handleHotKeysEsc = useCallback(() => {
    toggleTaskClick?.(id);
  }, [toggleTaskClick, id]);

  useHotkeys([['Escape', handleHotKeysEsc]]);

  // Textarea autofocus cursor on the end of the value
  useEffect(() => {
    const editorTextAria = document.getElementById(id);
    if (!editorTextAria) return;
    const textAreaElement = editorTextAria as HTMLTextAreaElement;
    if (markdown) textAreaElement.value = markdown;
    textAreaElement.focus();
    textAreaElement.setSelectionRange(textAreaElement.value.length, textAreaElement.value.length);
  }, [id]);

  return (
    <>
      <MDEditor
        onKeyDown={handleMDEscKeyPress}
        onBlur={(event) => {
          const newValue = (event as unknown as React.FocusEvent<HTMLTextAreaElement>).target.value;
          setMarkdown(newValue);
          toggleTaskClick?.(id);
        }}
        textareaProps={{ id: id }}
        value={markdown}
        preview={'edit'}
        onChange={(newValue) => {
          if (newValue) setMarkdown(newValue);
        }}
        defaultTabEnable={true}
        hideToolbar={true}
        visibleDragbar={false}
        height={'auto'}
        minHeight={20}
        style={{ color: mode === 'dark' ? '#F2F2F2' : '#17171C', background: 'transparent', boxShadow: 'none', padding: '0' }}
      />
    </>
  );
};