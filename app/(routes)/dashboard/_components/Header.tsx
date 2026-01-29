import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const { user, logout, loading } = useAuth();

  if (loading || !user) {
    return (
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-md">
        <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="flex-1 ml-4">
          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-24 animate-pulse"></div>
        </div>
        <Button variant="destructive" disabled>
          Выйти
        </Button>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
          {user.nickname.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{user.nickname}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      <Button onClick={logout} variant="destructive">
        Выйти
      </Button>
    </header>
  );
};
