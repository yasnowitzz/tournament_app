import { useState, useEffect, useRef } from "react";
import CommonModal from "./CommonModal";
import { fetcher } from "../services/api";
import { useRouter } from "next/navigation"; // Correct Next.js navigation
import { toast } from "react-toastify";



const MatchModal = ({ open, onClose = () => { }, match, tournamentId }) => {
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [teams, setTeams] = useState([]);
  const [filteredTeams1, setFilteredTeams1] = useState([]);
  const [filteredTeams2, setFilteredTeams2] = useState([]);
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);
  const [hasAssignedTeams, setHasAssignedTeams] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [scheduledTime, setScheduledTime] = useState(match?.scheduledTime || "");
  const [court, setCourt] = useState(match?.court || "");
  const matchId = match?.id;
  const router = useRouter();
  const dropdown1Ref = useRef(null);
  const dropdown2Ref = useRef(null);
  const [matchResult, setMatchResult] = useState("");
  const [activeTab, setActiveTab] = useState("teams"); // Dodana zakładka
  const [setScore, setSetScore] = useState({ team1: 0, team2: 0 });
  const [setDetails, setSetDetails] = useState([
    { team1: 0, team2: 0 },
    { team1: 0, team2: 0 },
    { team1: 0, team2: 0 },
  ]);



  useEffect(() => {
    fetcher(`/teams/tournament/${tournamentId}`)
      .then((data) => {
        const formattedTeams = data.map(team => ({
          id: team.id,
          name: `${team.player1.firstName} ${team.player1.lastName} & ${team.player2.firstName} ${team.player2.lastName}`
        }));
        setTeams(formattedTeams);
      })
      .catch((error) => toast.error("Błąd pobierania drużyn: " + error.message));
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
        toast.error("Błąd pobierania drużyn lub meczów:" + error.message);
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
      toast.error("Błąd przypisywania drużyn:" + error.message);
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
      toast.error("Błąd usuwania drużyn:" + error.message);
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

  useEffect(() => {
    if (match) {
      setMatchResult(match.result || ""); // Pobranie istniejącego wyniku meczu
    }
  }, [match]);

  useEffect(() => {
    if (match && match.result) {
      const resultParts = match.result.split(" ");
      const scores = resultParts[0].split(":").map(Number);
      setSetScore({ team1: scores[0], team2: scores[1] });

      const details = resultParts[1]?.match(/\(([^)]+)\)/)?.[1]
        .split(", ")
        .map(set => set.split(":").map(Number)) || [[0, 0], [0, 0], [0, 0]];

      setSetDetails(details.map(([team1, team2]) => ({ team1, team2 })));
    }
  }, [match]);

  const handleSaveResult = async () => {
    const formattedSetResults = setDetails.map(set => ({
      team1_score: set.team1,
      team2_score: set.team2
    }));

    try {
      await fetcher(`/matches/result/${match.id}`, {
        method: "POST",
        body: JSON.stringify({ setResults: formattedSetResults }),
        headers: { "Content-Type": "application/json" },
      });
      console.log("Zamykanie modala..."); // Debugowanie
      onClose();
      router.refresh();
    } catch (error) {
      toast.error("Błąd zapisu wyniku meczu:" + error.message);
    }
  };

  const handleSaveDetails = async () => {                                                                         
    // Walidacja danych przed wysłaniem                                                                           
    if (!scheduledTime || !court) {                                                                               
      toast.error("Proszę wprowadzić zarówno godzinę, jak i boisko.");                                            
      return;                                                                                                     
    }                                                                                                             
                                                                                                                  
    try {                                                                                                         
      await fetcher(`/matches/update-details/${matchId}`, {                                                       
        method: "PATCH",                                                                                          
        body: JSON.stringify({                                                                                    
          scheduledTime,                                                                                          
          court,                                                                                                  
        }),                                                                                                       
        headers: {                                                                                                
          "Content-Type": "application/json",                                                                     
          // Dodatkowe nagłówki, jeśli potrzebne (np. Authorization)                                              
        },                                                                                                        
      });                                                                                                         
                                                                                                                  
      toast.success("Szczegóły meczu zostały zaktualizowane.");                                                   
      onClose(); // Zamknij modal                                                                                 
      router.refresh(); // Odśwież stronę                                                                         
    } catch (error) {                                                                                             
      toast.error("Błąd zapisu szczegółów meczu: " + error.message);                                              
    }                                                                                                             
  }; 

  return (
    <CommonModal open={open} onClose={onClose} title={match ? `Mecz #${match.id}` : "Edytuj mecz"}>
      {/* Zakładki */}
      <div className="mt-4 flex border-b">
        {[
          { id: "teams", label: "Drużyny" },
          { id: "result", label: "Wynik meczu" },
          { id: "details", label: "Szczegóły meczu" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 font-semibold ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "details" && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Godzina</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Boisko</label>
            <input
              type="number"
              value={court}
              onChange={(e) => setCourt(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
            />
          </div>
        </div>
      )}
      {activeTab === "teams" && (
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
              <ul ref={dropdown2Ref} className="absolute top-full left-0 w-full border rounded-md bg-white shadow-md max-h-40 overflow-auto z-20">
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
      )}
      {activeTab === "result" && (
        <div className="mt-6 text-center">
          {/* Wyniki poszczególnych setów */}
          <div className="mt-6 text-center">
            <label className="block text-sm font-semibold text-gray-900">Dokładne wyniki setów</label>
            <div className="flex flex-col items-center mt-2 space-y-2">
              {setDetails.map((set, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-xs font-medium">Set {index + 1}:</span>
                  <input
                    type="number"
                    value={set.team1}
                    onChange={(e) => {
                      const newSetDetails = [...setDetails];
                      newSetDetails[index].team1 = Number(e.target.value);
                      setSetDetails(newSetDetails);
                    }}
                    className="w-12 h-8 text-sm p-1 border rounded-md text-center"
                    min="0"
                  />
                  <span className="text-sm font-semibold">:</span>
                  <input
                    type="number"
                    value={set.team2}
                    onChange={(e) => {
                      const newSetDetails = [...setDetails];
                      newSetDetails[index].team2 = Number(e.target.value);
                      setSetDetails(newSetDetails);
                    }}
                    className="w-12 h-8 text-sm p-1 border rounded-md text-center"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end space-x-4">
        {activeTab === "teams" && (
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500"
          >
            Zapisz
          </button>
        )}
        {hasAssignedTeams && activeTab === "teams" && (
          <button
            type="button"
            onClick={handleRemoveTeams}
            className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-500"
          >
            Usuń drużyny
          </button>
        )}
        {activeTab === "result" && (
          <button
            type="button"
            onClick={handleSaveResult}
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500"
          >
            Zapisz
          </button>
        )}
        {activeTab === "details" && (
          <button
            type="button"
            onClick={handleSaveDetails}
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500"
          >
            Zapisz
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
    </CommonModal>
  );
};

export default MatchModal;