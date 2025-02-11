import { useState, ChangeEvent, FormEvent } from "react";
import { fetcher } from "../services/api";
import { useRouter } from "next/navigation";

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
          headers: { "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
           },
          
        });
  
        const data = await response;
  
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token); // Store token
          // setIsLoggedIn(true); // Update login state
          router.push("/");
        }
      } catch (err) {
        console.error("Login error:", err);
      }
      setIsModalOpen(false);
    } else {
      try {
        await fetcher("/auth/register", {
          method: "POST",
          body: JSON.stringify(formData),
          headers: { "Content-Type": "application/json" },
        });
  
        alert("Link aktywacyjny został wysłany na podany adres email.");
        setIsModalOpen(false);
      } catch (err) {
        console.error("Register error:", err);
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
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-96 relative">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-black"
                onClick={() => setIsModalOpen(false)}
              >
                ✖
              </button>
              <h1 className="text-2xl font-bold text-center">
                {isLoginMode ? "Logowanie" : "Rejestracja"}
              </h1>
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
            </div>
          </div>
        )}
      </div>
    );
  }