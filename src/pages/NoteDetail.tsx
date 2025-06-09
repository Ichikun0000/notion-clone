import { TitleInput } from "@/components/TitleInput";
import { useParams } from "react-router-dom";
import { noteRepository } from "@/modules/notes/note.repository";
import { useEffect, useState } from "react";
import { useCurrentUserStore } from "@/modules/auth/current-user.state";
import { useNoteStore } from "@/modules/notes/note.state";
import { NoteUpdate } from "@/modules/notes/note.entity";

const NoteDetail = () => {
  const params = useParams();
  const id = parseInt(params.id!);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useCurrentUserStore();
  const noteStore = useNoteStore();
  const note = noteStore.getOne(id);

  const fetchOne = async () => {
    setIsLoading(true);
    const note = await noteRepository.findOne(currentUser!.id, id);
    if (note == null) return;
    noteStore.set([note]);
    setIsLoading(false);
  };

  const updateNote = async (updateData: NoteUpdate) => {
    const updatedNote = await noteRepository.update(
      currentUser!.id,
      id,
      updateData
    );
    if (updatedNote == null) return;
    noteStore.set([updatedNote]);
  };

  useEffect(() => {
    fetchOne();
  }, [id]); // idが変わったら再取得したいため

  if (isLoading) return <div>Loading...</div>;
  if (note == null) return <div>Note not found</div>;

  return (
    <div className="pb-40 pt-20">
      <div className="md:max-w-3xl lg:md-max-w-4xl mx-auto">
        <TitleInput
          initialData={note}
          onTitleChange={(title) => {
            updateNote({ title });
          }}
        />
      </div>
    </div>
  );
};

export default NoteDetail;
