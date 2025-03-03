'use client';

import { useState } from 'react';
import { fetcher } from '../../services/api';
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";



export default function TournamentWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    numTeams: '8',
    numCourts: '',
    startTime: '',
    type: 'Brazylijski',
    breakDuration: '5',
    hasLunchBreak: false,
    lunchBreakDuration: '',
    seeding: 'random',
    numSeededTeams: '',
    matchFormat: '1',
    setFormat: '21',
    tieBreakFormat: '',
    location: '',
    tournamentDescription: '',
    matchDuration: '20',
  });
  const router = useRouter();

  const handleChange = (e) => {
    let value = e.target.value;

    if (e.target.type === "radio") {
      value = e.target.value === "yes";
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: value
    }));
  };

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting:", formData);

    const token = localStorage.getItem("token");

    try {
      // Tworzenie turnieju
      const response = await fetcher("/tournaments", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response;
      console.log("Tournament created:", data);

      // Wywołanie endpointu do tworzenia meczów
      await fetcher(`/matches/create/${data.id}`, {
        method: "POST",
        body: JSON.stringify({ numTeams: formData.numTeams }),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      router.push(`/tournament_details/${data.id}`);
    } catch (err) {
      toast.error("Błąd podczas zatwierdzania:" + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Stwórz Turniej</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset>
          <legend className="text-lg font-semibold mb-4">Informacje ogólne</legend>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Miejsce turnieju</label>
            <input className="w-full p-3 border border-gray-300 rounded-md mb-2" name="location" type="text"
              onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Godzina rozpoczęcia</label>
            <input className="w-full p-3 border border-gray-300 rounded-md mb-2" name="startTime" type="datetime-local" onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Opis turnieju</label>
            <textarea className="w-full p-3 border border-gray-300 rounded-md mb-2" name="tournamentDescription"
              onChange={handleChange} required rows={6} />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Rodzaj turnieju</label>
            <select className="w-full p-3 border border-gray-300 rounded-md mb-2" name="type" value={formData.type}
              onChange={handleChange}>
              <option value="brazilian">Brazylijski</option>
              <option value="play-off">Play off</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Liczba drużyn</label>
            <select className="w-full p-3 border border-gray-300 rounded-md mb-2" name="numTeams" type="number" onChange={handleChange} required>
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="16">16</option>
              <option value="24">24</option>
              <option value="32">32</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Liczba boisk</label>
            <input className="w-full p-3 border border-gray-300 rounded-md mb-4 mb-2" name="numCourts" type="number" onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Długość meczu</label>
            <select className="w-full p-3 border border-gray-300 rounded-md mb-2"
              name="matchDuration"
              value={formData.matchDuration}
              onChange={handleChange}
              required
            >
              <option value="20">20 minut</option>
              <option value="30">30 minut</option>
              <option value="45">45 minut</option>
              <option value="60">60 minut</option>
              <option value="75">75 minut</option>
              <option value="90">90 minut</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Przerwa między meczami</label>
            <select className="w-full p-3 border border-gray-300 rounded-md mb-2"
              name="breakDuration"
              value={formData.breakDuration}
              onChange={handleChange}
              required
            >
              <option value="5">5 minut</option>
              <option value="10">10 minut</option>
              <option value="15">15 minut</option>
              <option value="20">20 minut</option>
              <option value="30">30 minut</option>
            </select>
          </div>
        </fieldset>

        <div className="flex justify-between mt-6">
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md">Submit</button>
        </div>
      </form>
    </div >
  );
}
