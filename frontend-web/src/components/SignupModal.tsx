'use client'
import { useState } from "react";
import { fetcher } from "../services/api";
import CommonModal from "./CommonModal";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";


export default function SignupModal({ open, onClose, tournamentId }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter();
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('You need to be logged in to register.');
        return;
      }

      const response = await fetcher(`/teams/register/${tournamentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Ensure token is included
        },
        body: JSON.stringify({ firstName, lastName, email })
      });

      await response;
      onClose();
      router.refresh();
    } catch (err) {
      toast.error("Błąd podczas zatwierdzania:" + err.message);
    }
  };

  return (
    <CommonModal open={open} onClose={onClose} title="Zapisz się na turniej">
        <div className="mt-4 space-y-4">
          <input
            type="text"
            placeholder="Imię"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Nazwisko"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
          />
        </div>
      <div className="bg-gray-50 px-4 py-3 flex justify-center space-x-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500"
        >
          Zapisz się
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-md bg-gray-300 text-gray-900 font-semibold hover:bg-gray-400"
        >
          Zrezygnuj
        </button>
      </div>
    </CommonModal>
  );
}