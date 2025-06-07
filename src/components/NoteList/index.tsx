import { cn } from "@/lib/utils";
import { NoteItem } from "./NoteItem";
import { useNoteStore } from "@/modules/notes/note.state";
import { useCurrentUserStore } from "@/modules/auth/current-user.state";
import { noteRepository } from "@/modules/notes/note.repository";
import { Note } from "@/modules/notes/note.entity";

interface NoteListProps {
  layer?: number;
  parentId?: number | null;
}

export function NoteList({ layer = 0, parentId = null }: NoteListProps) {
  const noteStore = useNoteStore();
  const notes = noteStore.getAll();
  console.log(notes);
  const { currentUser } = useCurrentUserStore();

  const createChildNote = async (e: React.MouseEvent, parentId: number) => {
    e.stopPropagation();
    const newNote = await noteRepository.create(currentUser!.id, { parentId });
    noteStore.set([newNote]);
  };

  const fetchChildren = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    const children = await noteRepository.find(currentUser!.id, note.id);
    if (children == null) return;
    noteStore.set(children);
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
          const hasChildren = notes.some(childNote => childNote.parent_document === note.id);
          
          return (
            <div key={note.id}>
              <NoteItem
                layer={layer}
                note={note}
                onExpand={(e: React.MouseEvent) => fetchChildren(e, note)}
                onCreate={(e: React.MouseEvent) => createChildNote(e, note.id)}
              />
              {hasChildren && <NoteList layer={layer + 1} parentId={note.id} />}
            </div>
          );
      })}
    </>
  );
}