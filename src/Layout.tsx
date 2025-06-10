import { Navigate, Outlet, useNavigate } from "react-router-dom";
import SideBar from "./components/SideBar";
import { SearchModal } from "./components/SearchModal";
import { useCurrentUserStore } from "./modules/auth/current-user.state";
import { useEffect, useState } from "react";
import { noteRepository } from "./modules/notes/note.repository";
import { useNoteStore } from "./modules/notes/note.state";
import { Note } from "./modules/notes/note.entity";

const Layout = () => {
  const { currentUser } = useCurrentUserStore();
  const noteStore = useNoteStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isShowModal, setIsShowModal] = useState(false);
  const [searchResult, setSearchResult] = useState<Note[]>([]);
  const navigate = useNavigate();
  const fetchNotes = async () => {
    console.log("fetchNotes");
    setIsLoading(true);
    const notes = await noteRepository.find(currentUser!.id); // 親のノートのみ取得し、グローバルステートに保存
    if (notes == null) return;
    noteStore.set(notes);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const searchNotes = async (keyword: string) => {
    console.log("searchKeyword", keyword);
    const notes = await noteRepository.findByKeyword(currentUser!.id, keyword);
    console.log("searchNotes", notes);
    if (notes == null) return;
    // noteStore.set(notes);
    setSearchResult(notes);
  };

  const moveToDetail = (noteId: number) => {
    setIsShowModal(false);
    navigate(`/notes/${noteId}`);
  };

  if (currentUser === null) {
    return <Navigate to="/signin" />;
  }

  return (
    <div className="h-full flex">
      {!isLoading && (
        <SideBar onSearchButtonClicked={() => setIsShowModal(true)} />
      )}
      <main className="flex-1 h-full overflow-y-auto">
        <Outlet />
        <SearchModal
          isOpen={isShowModal}
          notes={searchResult}
          onItemSelect={moveToDetail}
          onKeywordChanged={searchNotes}
          onClose={() => setIsShowModal(false)}
        />
      </main>
    </div>
  );
};

export default Layout;
