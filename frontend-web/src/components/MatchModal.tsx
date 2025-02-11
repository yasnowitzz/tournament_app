import { useState, useEffect, useRef } from "react";
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from "@headlessui/react";
import { fetcher } from "../services/api";
import { useRouter } from "next/navigation"; // Correct Next.js navigation


const MatchModal = ({ open, onClose, match, tournamentId }) => {
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [teams, setTeams] = useState([]);
  const [filteredTeams1, setFilteredTeams1] = useState([]);
  const [filteredTeams2, setFilteredTeams2] = useState([]);
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);
  const [hasAssignedTeams, setHasAssignedTeams] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const matchId = match?.id;
  const router = useRouter();
  const dropdown1Ref = useRef(null);
  const dropdown2Ref = useRef(null);

  useEffect(() => {
    fetcher(`/teams/tournament/${tournamentId}`)
      .then((data) => {
        const formattedTeams = data.map(team => ({
          id: team.id,
          name: `${team.player1.firstName} ${team.player1.lastName} & ${team.player2.firstName} ${team.player2.lastName}`
        }));
        setTeams(formattedTeams);
      })
      .catch((error) => console.error("Error fetching teams:", error));
  }, []);

  useEffect(() => {
    if (!open) return; // Pobieramy drużyny tylko gdy modal jest otwarty
  
    const fetchTeams = async () => {
      try {
        console.log("Pobieranie drużyn i meczów...");
        const allTeams = await fetcher(`/teams/tournament/${tournamentId}`);
        const matches = await fetcher(`/matches/tournament/${tournamentId}`);
  
        // Wyciągnij ID drużyn, które są już przypisane do jakiegokolwiek meczu
        const assignedTeamIds = new Set();
        matches.forEach(match => {
          if (match.team1?.id) assignedTeamIds.add(match.team1.id);
          if (match.team2?.id) assignedTeamIds.add(match.team2.id);
        });
  
        console.log("Przypisane drużyny (ID):", assignedTeamIds);
  
        // Formatuj drużyny i usuń te, które już są przypisane do meczu
        const filteredTeams = allTeams
          .filter(team => !assignedTeamIds.has(team.id)) // Usuwamy przypisane drużyny
          .map(team => ({
            id: team.id,
            name: `${team.player1.firstName} ${team.player1.lastName} & ${team.player2.firstName} ${team.player2.lastName}`
          }));
  
        console.log("Dostępne drużyny:", filteredTeams);
  
        // Zapisujemy dostępne drużyny do stanu
        setAvailableTeams(filteredTeams);
  
      } catch (error) {
        console.error("Błąd pobierania drużyn lub meczów:", error);
      }
    };
  
    fetchTeams();
  }, [tournamentId, open]);

  useEffect(() => {
    if (match) {
      const foundTeam1 = teams.find(team => team.id === match.team1?.id);
      const foundTeam2 = teams.find(team => team.id === match.team2?.id);

      setTeam1(foundTeam1 ? foundTeam1.name : "");
      setTeam2(foundTeam2 ? foundTeam2.name : "");

      // Ustawienie flagi, czy mecz miał przypisane drużyny
      setHasAssignedTeams(!!(match.team1 && match.team2));
    }
  }, [match, teams]);

  const handleSearch1 = (query) => {
    setTeam1(query);
    setFilteredTeams1(
      availableTeams
        .filter(team => team.name && team.name.toLowerCase().includes(query.toLowerCase())) // Sprawdzamy czy `name` istnieje
        .filter(team => team.name !== team2) // Usuwamy drużynę wybraną w drugim polu
    );
    setShowDropdown1(true);
  };
  
  const handleSearch2 = (query) => {
    setTeam2(query);
    setFilteredTeams2(
      availableTeams
        .filter(team => team.name && team.name.toLowerCase().includes(query.toLowerCase()))
        .filter(team => team.name !== team1)
    );
    setShowDropdown2(true);
  };

  const handleSelectTeam1 = (name) => {
    setTeam1(name);
    setShowDropdown1(false);
  
    // Aktualizujemy dostępne drużyny (usuwamy wybraną)
    setFilteredTeams2(availableTeams.filter((team) => team.name !== name));
  };
  
  const handleSelectTeam2 = (name) => {
    setTeam2(name);
    setShowDropdown2(false);
  
    // Aktualizujemy dostępne drużyny (usuwamy wybraną)
    setFilteredTeams1(availableTeams.filter((team) => team.name !== name));
  };

  const handleSave = async () => {
    const selectedTeam1 = teams.find((team) => team.name === team1);
    const selectedTeam2 = teams.find((team) => team.name === team2);
  
    if (!selectedTeam1 || !selectedTeam2) {
      alert("Proszę wybrać poprawne drużyny");
      return;
    }
  
    try {
      await fetcher(`/matches/assign-teams/${tournamentId}/${matchId}`, {
        method: "POST",
        body: JSON.stringify({
          team1Id: selectedTeam1.id,
          team2Id: selectedTeam2.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      onClose(); // Zamknij modal
      router.refresh();
    } catch (error) {
      console.error("Error assigning teams:", error);
    }
  };

  const handleRemoveTeams = async () => {
    if (!matchId || !tournamentId) {
      console.error("Brak matchId lub tournamentId");
      console.error("matchId:", matchId);
      console.error("tournamentId:", tournamentId);
      return;
    }

    try {
      const response = await fetcher(`/matches/remove-teams/${tournamentId}/${matchId}`, {
        method: "DELETE",
      });

      setTeam1(""); // Resetuj drużyny na froncie
      setTeam2("");
      onClose(); // Zamknij modal
      router.refresh();
    } catch (error) {
      console.error("Error removing teams:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown1 && dropdown1Ref.current && !dropdown1Ref.current.contains(event.target)
      ) {
        setShowDropdown1(false);
      }
      if (
        showDropdown2 && dropdown2Ref.current && !dropdown2Ref.current.contains(event.target)
      ) {
        setShowDropdown2(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown1, showDropdown2]);


  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
      <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <DialogTitle className="text-lg font-semibold text-gray-900">Edytuj drużyny meczu</DialogTitle>
          <div className="mt-4 space-y-4 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Drużyna 1"
                value={team1}
                onChange={(e) => handleSearch1(e.target.value)}
                onFocus={() => {
                  setFilteredTeams1(availableTeams.filter((team) => team.name !== team2)); // Pokaż wszystkich, ale bez wybranego w drugim polu
                  setShowDropdown1(true);
                }}
                className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
              />
              {showDropdown1 && filteredTeams1.length > 0 && (
                <ul ref={dropdown1Ref} className="absolute top-full left-0 w-full border rounded-md bg-white shadow-md max-h-40 overflow-auto z-20">
                  {filteredTeams1.map((team) => (
                    <li
                      key={team.id}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSelectTeam1(team.name)}
                    >
                      {team.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Drużyna 2"
                value={team2}
                onChange={(e) => handleSearch2(e.target.value)}
                onFocus={() => {
                  setFilteredTeams2(availableTeams.filter((team) => team.name !== team1)); // Pokaż wszystkich, ale bez wybranego w pierwszym polu
                  setShowDropdown2(true);
                }}
                className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
              />

              {showDropdown2 && filteredTeams2.length > 0 && (
                <ul ref={dropdown2Ref}  className="absolute top-full left-0 w-full border rounded-md bg-white shadow-md max-h-40 overflow-auto z-20">
                  {filteredTeams2.map((team) => (
                    <li
                      key={team.id}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSelectTeam2(team.name)}
                    >
                      {team.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500"
            >
              Zapisz
            </button>

            {hasAssignedTeams && (
              <button
                type="button"
                onClick={handleRemoveTeams}
                className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-500"
              >
                Usuń drużyny
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-300 text-gray-900 font-semibold hover:bg-gray-400"
            >
              Anuluj
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default MatchModal;