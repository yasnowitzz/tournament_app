'use client'
import { useState } from "react";
import { fetcher } from "../services/api";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

export default function SignupModal({ open, onClose, tournamentId }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

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
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="text-center">
                <DialogTitle as="h3" className="text-lg font-semibold text-gray-900">
                  Zapisz się na turniej
                </DialogTitle>
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
              </div>
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
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}