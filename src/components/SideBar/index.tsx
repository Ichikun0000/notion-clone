import { FC } from 'react';
import { Item } from './Item';
import { NoteList } from '../NoteList';
import UserItem from './UserItem';
import { Plus, Search } from 'lucide-react';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { useNoteStore } from '@/modules/notes/note.state';
import { useNavigate } from 'react-router-dom';
import { authRepository } from '@/modules/auth/auth.repository';

type Props = {
  onSearchButtonClicked: () => void;
};

const SideBar: FC<Props> = ({ onSearchButtonClicked }) => {
  const currentUserStore = useCurrentUserStore();
  const navigate = useNavigate();
  const noteStore = useNoteStore();
  const handleCreateNote = async () => {
    const newNote = await noteRepository.create(currentUserStore.currentUser!.id, {});
    noteStore.set([newNote]);
    navigate(`/notes/${newNote.id}`);
  };

  const handleSignout = async () => {
    await authRepository.signout();
    noteStore.clear();
    currentUserStore.setUser(null);
    navigate('/');
  };

  return (
    <>
      <aside className="group/sidebar h-full bg-neutral-100 overflow-y-auto relative flex flex-col w-60">
        <div>
          <div>
            <UserItem
              user={currentUserStore.currentUser!}
              signout={handleSignout}
            />
            <Item label="検索" icon={Search} onClick={onSearchButtonClicked} />
          </div>
          <div className="mt-4">
            <NoteList />
            <Item label="ノートを作成" icon={Plus} onClick={handleCreateNote} />
          </div>
        </div>
      </aside>
      <div className="absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]"></div>
    </>
  );
};

export default SideBar;
