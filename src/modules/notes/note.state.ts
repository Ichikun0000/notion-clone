import { atom, useAtom } from "jotai";
import { Note } from "./note.entity";

const notesAtom = atom<Note[]>([]);

export const useNoteStore = () => {
  const [notes, setNotes] = useAtom(notesAtom);

  // 今回setterは自前で作成する
  // なぜなら、以下のようなことをしたいから。
  // ex) const a = [note1, note2, note3]、const b = [note3, note4, note5]
  // setNotesだと、notesの中身が完全にbになってしまう。
  // そうではなく、[note1, note2, note3, note4, note5]にしたい。
  // そのため、自前でsetterを作成する。

  const set = (newNotes: Note[]) => {
    setNotes((oldNotes) => {
      const combineNotes = [...oldNotes, ...newNotes];
      // ex) oldNotes = [note1, note2, note3]、newNotes = [note3, note4, note5]
      // combineNotes = [note1, note2, note3, note3, note4, note5]
      // ✴️重複しているnote3は、newNotesの方で上書きしたい。

      const uniqueNotes: { [key: number]: Note } = {};

      for (const note of combineNotes) {
        uniqueNotes[note.id] = note;
        // 1回目のループでは、uniqueNotes = { 1: note1 }
        // 2回目のループでは、uniqueNotes = { 1: note1, 2: note2 }
        // 3回目のループでは、uniqueNotes = { 1: note1, 2: note2, 3: note3 }
        // 4回目のループでは、uniqueNotes = { 1: note1, 2: note2, 3: note3, 4: note4 } ← ✴️ここで、note3が上書きされる
        // 5回目のループでは、uniqueNotes = { 1: note1, 2: note2, 3: note3, 4: note4, 5: note5 }
      }

      // この段階で、uniqueNotes = { 1: note1, 2: note2, 3: note3, 4: note4, 5: note5 }
      // ✴️これを、Object.values(uniqueNotes)で配列に変換する。
      // ✴️この段階で、[note1, note2, note3, note4, note5]になる。
      return Object.values(uniqueNotes);
    });
  };

  const getOne = (id: number) => notes.find((note) => note.id === id);

  return {
    getAll: () => notes,
    set,
    getOne,
  };
};  