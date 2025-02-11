"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthModal from "./AuthModal";
import { isTokenValid, getUserRole, logout } from "../utils/auth";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && isTokenValid(token)) {
      setIsLoggedIn(true);
      getUserRole(token)
        .then((role) => {
          if (role === "admin") setIsAdmin(true);
        })
        .catch(() => {
          logout();
          setIsLoggedIn(false);
        });
    }
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setIsAdmin(false);
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
        {isAdmin && (
          <button onClick={handleAddTournament} className="bg-blue-600 text-white p-2 rounded">
            Dodaj Turniej
          </button>
        )}
      </div>
      <div>
        {!isLoggedIn ? (
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