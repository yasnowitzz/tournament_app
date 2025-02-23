"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthModal from "./AuthModal";

import { useAuth } from "../context/AuthContext"; 

const Header = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  console.log("User:", user);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleAddTournament = () => {
    router.push("/tournament");
  };

  return (
    <header className="flex justify-between items-center py-4 border-b">
      <div className="flex items-center space-x-4">
        {/* ✅ Wrapped "SetMecz" inside Link to navigate to home */}
        <Link href="/" className="text-2xl font-bold cursor-pointer hover:opacity-80">
          SetMecz
        </Link>
        {user?.role === "admin" && (
          <button onClick={handleAddTournament} className="bg-blue-600 text-white p-2 rounded">
            Dodaj Turniej
          </button>
        )}
      </div>
      <div>
        {!user ? (
          <AuthModal />
        ) : (
          <button onClick={handleLogout} className="bg-red-600 text-white p-2 rounded">
            Wyloguj się
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;