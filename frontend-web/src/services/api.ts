const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetcher = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { ...options.headers, Authorization: `Bearer ${token}` } : options.headers;

  try {
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP Error: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    throw error; // Wyrzucenie błędu do komponentu
  }
};