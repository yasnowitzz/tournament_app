"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { fetcher } from "../services/api";
import { useRouter } from "next/navigation";
import CommonModal from "./CommonModal";
import { toast } from "react-toastify";                                                                                                    
import "react-toastify/dist/ReactToastify.css"; 


interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: "player" | "admin";
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "player",
  });
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log(isLoginMode ? "Logowanie:" : "Rejestracja:", formData);

    if (isLoginMode) {
      try {
        const response = await fetcher("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: formData.email, password: formData.password }),
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
          },

        });

        const data = await response;

        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token); // Store token
          router.refresh(); // Refresh page
        }
      } catch (err) {
        toast.error(err.message || "Wystąpił błąd podczas logowania.");
      }
    } else {
      try {
        await fetcher("/auth/register", {
          method: "POST",
          body: JSON.stringify(formData),
          headers: { "Content-Type": "application/json" },
        });
        toast.success("Link aktywacyjny został wysłany na podany adres email."
        );
        setIsModalOpen(false);
      } catch (err) {
        toast.error("Wystąpił błąd podczas rejestracji: " + err.message);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <button
        className="bg-blue-600 text-white p-2 rounded mr-4"
        onClick={() => {
          setIsLoginMode(true);
          setIsModalOpen(true);
        }}
      >
        Zaloguj się
      </button>
      <button
        className="bg-green-600 text-white p-2 rounded"
        onClick={() => {
          setIsLoginMode(false);
          setIsModalOpen(true);
        }}
      >
        Zarejestruj się
      </button>

      {isModalOpen && (
        <CommonModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isLoginMode ? "Logowanie" : "Rejestracja"}
        >
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            {!isLoginMode && (
              <>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Imię"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Nazwisko"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="player">Zawodnik</option>
                  <option value="admin">Koordynator turnieju</option>
                </select>
              </>
            )}
            <input
              type="password"
              name="password"
              placeholder="Hasło"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
              {isLoginMode ? "Zaloguj się" : "Zarejestruj się"}
            </button>
          </form>
          <p className="text-center mt-4">
            {isLoginMode ? "Nie masz konta?" : "Masz już konto?"}
            <button
              className="text-blue-600 underline"
              onClick={() => setIsLoginMode(!isLoginMode)}
            >
              {isLoginMode ? "Zarejestruj się" : "Zaloguj się"}
            </button>
          </p>
        </CommonModal>
      )}
    </div>
  );
}