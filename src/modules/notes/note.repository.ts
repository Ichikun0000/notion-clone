import { Note, NoteInsert, supabase } from "@/lib/supabase";

export const noteRepository = {
  async create(userId: string, params: { title?: string; parentId?: number }): Promise<Note> {
    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          user_id: userId,
          title: params.title,
          parent_document: params.parentId,
        } satisfies NoteInsert
      ])
      .select()
      .single();

    if (error !== null) throw new Error(error?.message);
    return data;
  },
};


/*
// 意味について
素晴らしい質問ですね！それぞれの部分を詳しく説明します：

## `Promise<Note>`の意味

```typescript
async create(...): Promise<Note>
```

### 1. `Promise`とは
- **非同期処理の結果**を表すTypeScriptの型
- 「将来的にNoteを返す約束」という意味
- `async`関数は必ず`Promise`を返す

### 2. `<Note>`（ジェネリクス）
- `Promise`の中に**何の型が入るか**を指定
- `Promise<Note>` = 「Noteを返すPromise」
- `Promise<string>` = 「文字列を返すPromise」

```typescript
// 例で理解しよう
async function getString(): Promise<string> {
  return "hello"; // 実際には Promise<string> が返される
}

async function getNumber(): Promise<number> {
  return 42; // 実際には Promise<number> が返される
}

async function getNote(): Promise<Note> {
  return { id: 1, title: "test", ... }; // Promise<Note> が返される
}
```

## `satisfies NoteInsert`の意味

```typescript
{
  user_id: userId,
  title: params.title,
  parent_document: params.parentId,
} satisfies NoteInsert
```

### `satisfies`キーワード
- TypeScript 4.9で追加された新機能
- 「このオブジェクトがNoteInsert型の条件を満たしているか確認して」という意味
- 型安全性をチェックしつつ、元のオブジェクトの詳細な型情報も保持

### 従来の方法との違い

```typescript
// 従来の方法（型アサーション）
const data = {
  user_id: userId,
  title: params.title,
} as NoteInsert; // 強制的にNoteInsert型として扱う（危険）

// 型注釈
const data: NoteInsert = {
  user_id: userId,
  title: params.title,
}; // 型が固定される

// satisfies（推奨）
const data = {
  user_id: userId,
  title: params.title,
} satisfies NoteInsert; // 型チェック + 元の型情報保持
```

## 全体的な流れ

```typescript
export const noteRepository = {
  // 1. この関数は非同期でNoteを返すPromiseを返す
  async create(...): Promise<Note> {
    
    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          // 2. このオブジェクトがNoteInsert型の条件を満たしているかチェック
          user_id: userId,
          title: params.title,
          parent_document: params.parentId,
        } satisfies NoteInsert
      ])
      .select()
      .single();

    if (error !== null) throw new Error(error?.message);
    
    // 3. dataはNote型として返される（TypeScriptが自動で型推論）
    return data;
  },
};
```

## 使用時の利点

```typescript
// 使用する側
const newNote = await noteRepository.create("user123", { title: "Test" });
// newNoteはNote型として推論される！

console.log(newNote.id);       // ✅ idプロパティがあることを保証
console.log(newNote.title);    // ✅ titleプロパティがあることを保証
console.log(newNote.invalid);  // ❌ コンパイルエラー！存在しないプロパティ
```

このように、型安全性を確保しながら開発時にエラーを早期発見できるようになります！
*/