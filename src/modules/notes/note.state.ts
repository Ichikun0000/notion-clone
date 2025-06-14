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

  const clear = () => {
    setNotes([]);
  };

  /**
   * ノートとその子ノートを削除する
   * @param id 削除対象のノートID
   */
  const deleteNote = (id: number) => {
    /**
     * 指定された親ノートIDに紐づく全ての子ノートIDを再帰的に取得する
     * @param parentId 親ノートID
     * @returns 子ノートIDの配列
     */
    const findChildrenIds = (parentId: number): number[] => {
      // 直接の子ノートを取得
      const childrenIds = notes
        .filter((note) => note.parent_document === parentId)
        .map((child) => child.id);

      // 子ノートの子ノートを再帰的に取得して結合
      return childrenIds.concat(
        ...childrenIds.map((id) => findChildrenIds(id))
      );
    };

    // 削除対象のノートとその子ノートのIDを取得
    const childrenIds = findChildrenIds(id);
    const idsToDelete = [...childrenIds, id];

    // 指定されたIDのノートを除外して新しいノートリストを作成
    setNotes((oldNotes) =>
      oldNotes.filter((note) => !idsToDelete.includes(note.id))
    );
  };

/**
   * 処理フロー
   * 選択されたコードの再帰処理について詳しく解説いたします。

## `findChildrenIds`関数の再帰処理

この関数は、指定された親ノートIDに紐づく**全ての子ノート（孫、ひ孫なども含む）**のIDを取得する再帰関数です。

### 処理の流れ

```typescript
const findChildrenIds = (parentId: number): number[] => {
  // 1. 直接の子ノートを取得
  const childrenIds = notes
    .filter((note) => note.parent_document === parentId)
    .map((child) => child.id);

  // 2. 子ノートの子ノートを再帰的に取得して結合
  return childrenIds.concat(
    ...childrenIds.map((id) => findChildrenIds(id))
  );
};
```

### 具体例で理解する

以下のようなノート構造があるとします：

```
ノート1 (id: 1)
├── ノート2 (id: 2, parent_document: 1)
│   ├── ノート4 (id: 4, parent_document: 2)
│   └── ノート5 (id: 5, parent_document: 2)
├── ノート3 (id: 3, parent_document: 1)
    └── ノート6 (id: 6, parent_document: 3)
```

`findChildrenIds(1)`を実行した場合の処理：

#### 1回目の実行 `findChildrenIds(1)`
- **Step 1**: `parent_document === 1`のノートを検索
  - 結果: ノート2、ノート3 → `childrenIds = [2, 3]`

- **Step 2**: 各子ノートに対して再帰呼び出し
  - `findChildrenIds(2)` と `findChildrenIds(3)` を実行

#### 2回目の実行 `findChildrenIds(2)`
- **Step 1**: `parent_document === 2`のノートを検索
  - 結果: ノート4、ノート5 → `childrenIds = [4, 5]`
- **Step 2**: 各子ノートに対して再帰呼び出し
  - `findChildrenIds(4)` と `findChildrenIds(5)` を実行
  - どちらも子ノートが存在しないため、空配列 `[]` を返す
- **戻り値**: `[4, 5].concat([], []) = [4, 5]`

#### 3回目の実行 `findChildrenIds(3)`
- **Step 1**: `parent_document === 3`のノートを検索
  - 結果: ノート6 → `childrenIds = [6]`
- **Step 2**: 子ノートに対して再帰呼び出し
  - `findChildrenIds(6)` を実行
  - 子ノートが存在しないため、空配列 `[]` を返す
- **戻り値**: `[6].concat([]) = [6]`

#### 最終結果
`findChildrenIds(1)`の戻り値:
```typescript
[2, 3].concat([4, 5], [6]) = [2, 3, 4, 5, 6]
```

### 再帰処理のポイント

1. **ベースケース（終了条件）**: 子ノートが存在しない場合、空配列を返して再帰を終了
2. **再帰ケース**: 子ノートが存在する場合、その子ノートに対してさらに同じ処理を実行
3. **結果の結合**: 直接の子ノートIDと、再帰呼び出しで取得した孫ノートIDを結合

この再帰処理により、ノート1を削除する際に、その下にある全ての子ノート（2, 3, 4, 5, 6）も一緒に削除されることになります。
   */

  return {
    getAll: () => notes,
    set,
    getOne,
    delete: deleteNote,
    clear,
  };
};
