import { supabase } from "@/lib/supabase";
import { Note, NoteInsert } from "./note.entity";

export const noteRepository = {
  async create(
    userId: string,
    params: { title?: string; parentId?: number }
  ): Promise<Note> {
    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          user_id: userId,
          title: params.title,
          parent_document: params.parentId,
        } satisfies NoteInsert,
      ])
      .select()
      .single();

    if (error !== null) throw new Error(error?.message);
    return data;
  },
  async find(userId: string, parentDocumentId?: number): Promise<Note[] | null> {
    const query = supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data, error } =
      parentDocumentId != null
        ? await query.eq("parent_document", parentDocumentId)
        : await query.is("parent_document", null);

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


/*
選択されている`find`メソッドについて詳しく解説しますね！

## `find`メソッドの全体構造

```typescript
async find(userId: string, parentDocumentId: number): Promise<Note[]>
```

このメソッドは**ユーザーのノート一覧を取得**する機能です。

## パラメータの説明

- `userId: string` - 取得したいユーザーのID
- `parentDocumentId: number` - 親ドキュメントのID（階層構造に対応）
- `Promise<Note[]>` - Note型の配列を返すPromise

## 処理の流れを段階的に解説

### 1. 基本クエリの構築
```typescript
const query = supabase
  .from("notes")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false });
```

- `from("notes")` - notesテーブルから
- `select("*")` - 全てのカラムを選択
- `eq("user_id", userId)` - 指定されたユーザーのノートのみ
- `order("created_at", { ascending: false })` - 作成日時の降順（新しい順）でソート

### 2. 条件分岐による絞り込み
```typescript
const { data, error } =
  parentDocumentId != null
    ? await query.eq("parent_document", parentDocumentId)
    : await query.is("parent_document", null);
```

この部分が**重要なポイント**です！

#### パターン1: `parentDocumentId != null`の場合
```typescript
await query.eq("parent_document", parentDocumentId)
```
- 特定の親ドキュメントの**子ノート**を取得
- 例：parentDocumentId=5なら、parent_document=5のノートを取得

#### パターン2: `parentDocumentId == null`の場合
```typescript
await query.is("parent_document", null)
```
- parent_documentが**null**のノート（つまり**ルートレベル**のノート）を取得

### 3. エラーハンドリングと結果返却
```typescript
if (error !== null) throw new Error(error?.message);
return data;
```

## 使用例で理解しよう

```typescript
// ルートレベルのノートを取得
const rootNotes = await noteRepository.find("user123", null);
// → parent_documentがnullのノートを取得

// 特定ドキュメントの子ノートを取得  
const childNotes = await noteRepository.find("user123", 5);
// → parent_document=5のノートを取得
```

## 階層構造のイメージ

```
ノート構造の例：
├── ノートA (id:1, parent_document: null)    ← find("user123", null)で取得
│   ├── ノートA-1 (id:2, parent_document: 1) ← find("user123", 1)で取得
│   └── ノートA-2 (id:3, parent_document: 1) ← find("user123", 1)で取得
├── ノートB (id:4, parent_document: null)    ← find("user123", null)で取得
└── ノートC (id:5, parent_document: null)    ← find("user123", null)で取得
    └── ノートC-1 (id:6, parent_document: 5) ← find("user123", 5)で取得
```

## 三項演算子の詳細解説

```typescript
条件 ? true時の処理 : false時の処理
```

```typescript
parentDocumentId != null
  ? await query.eq("parent_document", parentDocumentId)  // 子ノート取得
  : await query.is("parent_document", null);             // ルートノート取得
```

このようにして、**一つのメソッドで階層構造に対応したノート取得**を実現しています！
*/