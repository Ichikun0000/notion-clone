import { cn } from "@/lib/utils";
import { NoteItem } from "./NoteItem";
import { useNoteStore } from "@/modules/notes/note.state";
import { useCurrentUserStore } from "@/modules/auth/current-user.state";
import { noteRepository } from "@/modules/notes/note.repository";
import { Note } from "@/modules/notes/note.entity";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NoteListProps {
  layer?: number;
  parentId?: number | null;
}

export function NoteList({ layer = 0, parentId = null }: NoteListProps) {
  const navigate = useNavigate();
  const noteStore = useNoteStore();
  const notes = noteStore.getAll();
  console.log(notes);
  const { currentUser } = useCurrentUserStore();
  const [expanded, setExpanded] = useState<Map<number, boolean>>(new Map());
  // 解説: { ノートID: 展開状態 } を管理するマップを作成。 デフォルトではすべてのノートが展開されていない
  console.log(expanded);

  const createChildNote = async (e: React.MouseEvent, parentId: number) => {
    e.stopPropagation();
    const newNote = await noteRepository.create(currentUser!.id, { parentId });
    noteStore.set([newNote]);
    setExpanded((prev) => prev.set(parentId, true));
    moveToDetail(newNote.id);
  };

  const fetchChildren = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    const children = await noteRepository.find(currentUser!.id, note.id); // TODO: エラーハンドリング
    noteStore.set(children);
    setExpanded((prev) => {
      const newExpanded = new Map(prev);
      newExpanded.set(note.id, !prev.get(note.id)); // たとえばnewExpandedが{1: true, 2: false}だったら、1: falseにする
      return newExpanded;
    });
  };

  const moveToDetail = (noteId: number) => {
    navigate(`/notes/${noteId}`);
  };

  return (
    <>
      <p
        className={cn(
          `hidden text-sm font-medium text-muted-foreground/80`,
          layer === 0 && "hidden"
        )}
        style={{ paddingLeft: layer ? `${layer * 12 + 25}px` : undefined }}
      >
        ページがありません
      </p>
      {notes
        .filter((note) => note.parent_document === parentId)
        .map((note) => {
          const hasChildren = notes.some(
            (childNote) => childNote.parent_document === note.id
          );

          return (
            <div key={note.id}>
              <NoteItem
                layer={layer}
                note={note}
                expanded={expanded.get(note.id)}
                onExpand={(e: React.MouseEvent) => fetchChildren(e, note)}
                onCreate={(e: React.MouseEvent) => createChildNote(e, note.id)}
                onClick={() => moveToDetail(note.id)}
              />
              {hasChildren && expanded.get(note.id) && (
                <NoteList layer={layer + 1} parentId={note.id} />
              )}
            </div>
          );
        })}
    </>
  );
}
