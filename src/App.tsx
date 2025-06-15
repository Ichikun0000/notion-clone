import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./Layout"
import { Home } from "./pages/Home"
import NoteDetail from "./pages/NoteDetail"
import Signin from "./pages/Signin"
import Signup from "./pages/Signup"
import { useEffect } from "react"
import { useCurrentUserStore } from "./modules/auth/current-user.state"
import { authRepository } from "./modules/auth/auth.repository"

function App() {
  const currentUserStore = useCurrentUserStore();
  // セッションを取得
  useEffect(() => {
    console.log('setSession');
    setSession();
  }, []);

  const setSession = async () => {
    try {
      currentUserStore.setLoading(); // ローディング状態を設定
      const currentUser = await authRepository.getCurrentUser();
      currentUserStore.setUser(currentUser); // 認証状態を適切に設定
    } catch (error) {
      console.error('セッション取得エラー:', error);
      currentUserStore.setUser(null); // エラー時は未認証状態に設定
    }
  }

  // 認証状態がローディング中の場合はローディング画面を表示
  if (currentUserStore.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="h-full">
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route index element={<Home />} />
            <Route path="/notes/:id" element={<NoteDetail />} />
          </Route>
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
