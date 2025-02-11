'use client';

import { useState } from 'react';
import { fetcher } from '../../services/api';
import { useRouter } from "next/navigation";


export default function TournamentWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    numTeams: '8',
    numCourts: '',
    startTime: '',
    type: 'classic',
    breakDuration: '5',
    hasLunchBreak: false,
    lunchBreakDuration: '',
    seeding: 'random',
    numSeededTeams: '',
    matchFormat: '1',
    setFormat: '21',
    tieBreakFormat: '',
    location: '',
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
      console.error("Submission error:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Tournament Setup Wizard</h2>

      {/* Progress Bar */}
      <div className="relative w-full bg-gray-300 rounded-full h-2 mb-6">
        <div
          className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        ></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <fieldset>
            <legend className="text-lg font-semibold mb-2">General Information</legend>
            <div>
              <select className="w-full p-3 border border-gray-300 rounded-md" name="type" value={formData.type} onChange={handleChange}>
                <option value="classic">Klasyczny</option>
                <option value="king">Kingo of the Court</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Number of Teams</label>
              <select className="w-full p-3 border border-gray-300 rounded-md" name="numTeams" type="number" onChange={handleChange} required>
                <option value="8">8</option>
                <option value="12">12</option>
                <option value="16">16</option>
                <option value="24">24</option>
                <option value="32">32</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Number of Courts</label>
              <input className="w-full p-3 border border-gray-300 rounded-md" name="numCourts" type="number" onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Start Time</label>
              <input className="w-full p-3 border border-gray-300 rounded-md" name="startTime" type="time" onChange={handleChange} required />
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="text-lg font-semibold mb-2">Schedule</legend>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Przerwa między meczami</label>
              <select className="w-full p-3 border border-gray-300 rounded-md"
                name="breakDuration"
                value={formData.breakDuration}
                onChange={handleChange}
                required
              >
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </div>
            <div className="mt-3">
              <label className="block text-gray-700 font-medium mb-1">Include Lunch Break?</label>
              <div className="flex items-center space-x-4">
                {/* Yes Radio Button */}
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasLunchBreak"
                    value="yes"
                    checked={formData.hasLunchBreak === true}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Tak
                </label>

                {/* No Radio Button */}
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasLunchBreak"
                    value="no"
                    checked={formData.hasLunchBreak === false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Nie
                </label>
              </div>
            </div>
            {formData.hasLunchBreak && (
              <div className="mt-3">
                <label className="block text-gray-700 font-medium mb-1">Lunch Break Duration</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-md"
                  name="lunchBreakDuration"
                  onChange={handleChange}
                  value={formData.lunchBreakDuration}
                  required
                >
                  <option value="">Select Duration</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1 hour 30 minutes</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Seeding</label>
              <select className="w-full p-3 border border-gray-300 rounded-md" name="seeding" onChange={handleChange}>
                <option value="random">Random Draw</option>
                <option value="seeded">Seeded</option>
              </select>
            </div>
            {formData.seeding === "seeded" && (
              <div className="mt-3">
                <label className="block text-gray-700 font-medium mb-1">Number of Seeded Teams</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  name="numSeededTeams"
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            )}
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend className="text-lg font-semibold mb-2">Match Settings</legend>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Do ilu setów powinien być rozgrywany mecz?</label>
              <select className="w-full p-3 border border-gray-300 rounded-md" name="matchFormat" onChange={handleChange}>
                <option value="one">1 set</option>
                <option value="two_wins">Do dwóch wygranych setów</option>
                <option value="points_diff">2 sety (w przypadku 1:1 decyduje różnica punktów)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Do ilu punktow powinien być rozgrywany set?</label>
              <select className="w-full p-3 border border-gray-300 rounded-md" name={formData.setFormat} value={formData.setFormat} onChange={handleChange}>
                <option value="21">21</option>
                <option value="15">15</option>
                <option value="11">11</option>
              </select>
            </div>
            {formData.matchFormat === 'best_of_3' && (
              <div className="mt-3">
                <label className="block text-gray-700 font-medium mb-1">Do ilu punktow powinien być rozgrywany tie-break?</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-md"
                  name="tieBreakFormat"
                  value={formData.tieBreakFormat}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Duration</option>
                  <option value="15">15</option>
                  <option value="11">11</option>
                  <option value="5">5</option>
                </select>
              </div>
            )}
          </fieldset>
        )}

        {step === 4 && (
          <fieldset>
            <legend className="text-lg font-semibold mb-2">Location & Time</legend>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Tournament Location</label>
              <input className="w-full p-3 border border-gray-300 rounded-md" name="location" type="text" onChange={handleChange} required />
            </div>
          </fieldset>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 && <button type="button" className="px-4 py-2 bg-gray-300 rounded-md" onClick={handlePrev}>Back</button>}
          {step < 4 && <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={handleNext}>Next</button>}
          {step === 4 && <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md">Submit</button>}
        </div>
      </form>
    </div >
  );
}
