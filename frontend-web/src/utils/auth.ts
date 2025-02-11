import { fetcher } from "../services/api";

const decodeToken = (token: string): Record<string, any> | null => {
  try {
    return JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  const payload = decodeToken(token);
  return payload ? payload.exp * 1000 > Date.now() : false;
};

export const getUserRole = async (token: string | null): Promise<string | null> => {
  console.log("Fetching user role with token:", token);
  
  if (!token) return null;

  try {
    // Fetcher returns already-parsed JSON, not a Response object
    const data = await fetcher("/users/role", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Parsed Response Data:", data);

    // Ensure data is valid before extracting
    if (!data || typeof data !== "object" || !("role" in data)) {
      console.error("Unexpected response format:", data);
      return null;
    }

    const { role } = data;
    console.log("Extracted Role:", role);
    return role || null;

  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("access_token");
};