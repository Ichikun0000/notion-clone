import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { authRepository } from '../modules/auth/auth.repository';
import { useCurrentUserStore } from '../modules/auth/current-user.state';

function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserStore = useCurrentUserStore();
  
  const handleSignin = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    setError(null);
    
    try {
      const user = await authRepository.signin(email, password);
      currentUserStore.setUser(user);
    } catch (error) {
      console.error(error);
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    } finally {
      setIsSigningIn(false);
    }
  };

  // 認証状態がローディング中の場合は何も表示しない（App.tsxでハンドル）
  if (currentUserStore.isLoading) {
    return null;
  }

  // 認証済みの場合はホームページにリダイレクト
  if (currentUserStore.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Notionクローン
        </h2>
        <div className="mt-8 w-full max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="email"
                >
                  メールアドレス
                </label>
                <div className="mt-1">
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    id="email"
                    name="email"
                    placeholder="メールアドレス"
                    required
                    type="email"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="password"
                >
                  パスワード
                </label>
                <div className="mt-1">
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    id="password"
                    name="password"
                    placeholder="パスワード"
                    required
                    type="password"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <button
                  disabled={email === '' || password === '' || isSigningIn}
                  onClick={handleSignin}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSigningIn ? 'ログイン中...' : 'ログイン'}
                </button>
              </div>
              <div className="mt-4 text-center text-sm">
                登録は
                <Link className="underline" to={'/signup'}>
                  こちら
                </Link>
                から
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;
