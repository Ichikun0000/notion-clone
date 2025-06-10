import { ja } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";

interface EditorProps {
  onContentChange: (value: string) => void;
  initialContent?: string | null;
}

function Editor({ onContentChange, initialContent }: EditorProps) {
  const editor = useCreateBlockNote({
    dictionary: ja,
    initialContent:
      initialContent != null ? JSON.parse(initialContent) : undefined,
  });

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme="light"
        onChange={() => onContentChange(JSON.stringify(editor.document))}
      />
      {/* TODO: ダークモードも実装する */}
    </div>
  );
}

export default Editor;
