"use client";
import React from "react";
import { useState, useEffect } from "react";
import { fetcher } from "../services/api";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; // Correct Next.js navigation
import { toast } from "react-toastify";



const Home = () => {
  const [tournaments, setTournaments] = useState([]);
  const router = useRouter(); // Initialize navigation function

  useEffect(() => {
    // Fetch tournaments from an API or local state
    fetcher("/tournaments")
    .then((res) => {
      if (Array.isArray(res)) {
        return res; // Directly return array if already parsed
      }
      if (!res || !res.ok) {
        throw new Error(`HTTP error! status: ${res ? res.status : "undefined"}`);
      }
      return res.json();
    })
    .then((data) => {
      setTournaments(data);
    })
    .catch((error) => toast.error("Error fetching tournaments:", error));
}, []);


return (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Zaplanowane Turnieje</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tournaments.length > 0 ? (
        tournaments.map((tournament) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              router.push(`/tournament_details/${tournament.id}`); // Navigate on card click
            }} // Navigate on card click
            className="cursor-pointer"
          >
            <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="p-2">
                <h2 className="text-xl font-semibold">Turniej #{tournament.id}</h2>
                <p className="text-gray-600">Liczba drużyn: {tournament.numTeams}</p>
                <p className="text-gray-600">Liczba boisk: {tournament.numCourts}</p>
                <p className="text-gray-600">Czas startu: {tournament.startTime}</p>
                <p className="text-gray-600">Lokalizacja: {tournament.location}</p>
                <button
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents parent div click event
                    router.push(`/tournament_details/${tournament.id}`); // Navigate to details
                  }}
                >
                  Szczegóły
                </button>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <p>Brak zaplanowanych turniejów.</p>
      )}
    </div>
  </div>
);
};

export default Home;

