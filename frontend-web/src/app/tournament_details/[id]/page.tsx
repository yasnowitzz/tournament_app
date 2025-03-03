"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetcher } from "../../../services/api";
import SignupModal from "../../../components/SignupModal";
import MatchModal from "../../../components/MatchModal";
import DoubleEliminationBracket from "../../../components/DoubleEliminationBracket";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";


const TournamentDetails = () => {
  const { user } = useAuth();
  console.log(user);
  const { id } = useParams();
  const tournamentId = Number(id);

  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isSignupModalOpen, setIsSingupModalOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTab, setActiveTab] = useState("matches"); // Domyślnie pierwsza zakładka
  const [results, setResults] = useState({});
  const [showFull, setShowFull] = useState(false);
  const toggleShow = () => setShowFull(!showFull);

  useEffect(() => {
    if (!isNaN(tournamentId)) {
      fetcher(`/tournaments/${tournamentId}`)
        .then((data) => setTournament(data))
        .catch((error) => toast.error("Błąd ładowania turnieju:" + error.message));

      // Jeśli domyślną zakładką są mecze, pobierz mecze od razu
      if (activeTab === "matches") {
        fetchMatches();
      }
    }
  }, [tournamentId, activeTab]);

  const fetchMatches = async () => {
    try {
      const data = await fetcher(`/matches/tournament/${tournamentId}`);
      setMatches(data);

      // Pobierz wyniki dla każdego meczu
      const resultsData = await Promise.all(
        data.map(async (match) => {
          try {
            const result = await fetcher(`/matches/${match.id}/result`);
            return { matchId: match.id, result };
          } catch (error) {
            toast.error(`Błąd ładowania wyniku meczu ${match.id}:`);
            return { matchId: match.id, result: null };
          }
        })
      );

      const resultsMap = resultsData.reduce((acc, curr) => {
        acc[curr.matchId] = curr.result;
        return acc;
      }, {});

      setResults(resultsMap);
    } catch (error) {
      toast.error("Błąd ładowania meczów:" + error.message);
    }
  };

  const fetchTeams = () => {
    fetcher(`/teams/tournament/${tournamentId}`)
      .then((data) => setTeams(data))
      .catch((error) => toast.error("Błąd ładowania uczestników:" + error.message));
  };

  const openMatchModal = (match) => {
    setSelectedMatch(match);
    setIsMatchModalOpen(true);
  };

  const openSignupModal = () => {
    setIsSingupModalOpen(true);
  };

  const groupAndSortMatches = (matches) => {
    const sortedMatches = [...matches].sort((a, b) => a.match_id - b.match_id);
    return sortedMatches.reduce((acc, match) => {
      const stage = match.stage || "Unknown Stage";
      if (!acc[stage]) acc[stage] = [];
      acc[stage].push(match);
      return acc;
    }, {});
  };

  const handleResultChange = (matchId, team, value) => {
    setResults((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));
  };

  const handleSaveResult = (match) => {
    if (results[match.id]?.team1 !== undefined && results[match.id]?.team2 !== undefined) {
      updateMatchResult(match.id, results[match.id].team1, results[match.id].team2);
    }
  };

  const groupedMatches = groupAndSortMatches(matches);

  const getWinner = () => {
    const team1SetsWon = setDetails.filter(set => set.team1 > set.team2).length;
    const team2SetsWon = setDetails.filter(set => set.team2 > set.team1).length;

    if (team1SetsWon > team2SetsWon) return "team1";
    if (team2SetsWon > team1SetsWon) return "team2";
    return null; // Remis lub brak wyniku
  };
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!tournament) return <p className="text-gray-700">Ładowanie szczegółów turnieju...</p>;

  const description = tournament.tournamentDescription;
  const shortDescription = description.length > 200 ? description.substring(0, 200) + '...' : description;
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mt-4">
        <h1 className="text-3xl font-bold mb-4">Szczegóły Turnieju #{tournament.id}</h1>
        {user?.role === "player" && (
          <button
            onClick={openSignupModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
            Zapisz się do turnieju
          </button>
        )}
      </div>
      <div className="mb-6 p-4 rounded-md" >
        <h2 className="text-xl font-semibold mb-2">Opis Turnieju</h2>
        <p className="text-gray-700">
          {showFull ? description : shortDescription}
          {description.length > 200 && (
            <span
              onClick={toggleShow}
              className="text-blue-500 hover:underline cursor-pointer ml-2"
            >
              {showFull ? 'Ukryj' : 'Czytaj więcej'}
            </span>
          )}
        </p>
      </div>
      {/* Nawigacja zakładek */}
      <div className="mt-6 flex border-b-2">
        {[
          { id: "matches", label: "Mecze" },
          { id: "bracket", label: "Drabinka" },
          { id: "teams", label: "Uczestnicy" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "matches") fetchMatches();
              if (tab.id === "teams") fetchTeams();
            }}
            className={`py-2 px-4 font-semibold ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Treść zakładek */}
      <div className="mt-6">
        {activeTab === "matches" && (
          <>
            {Object.entries(groupedMatches).map(([stage, stageMatches]) => {
              const maxSets = stageMatches.reduce((max, match) => {
                const sets = results[match.id]?.sets || [];
                return Math.max(max, sets.length);
              }, 0);

              return (
                <div key={stage} className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{stage}</h2>
                  <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <div className="max-h-[500px] overflow-y-auto">
                      {/* Ustawienie fixed-header */}
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 w-20">
                              Godzina
                            </th>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 w-56">
                              Drużyny
                            </th>
                            <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 w-24">
                              Wynik meczu
                            </th>
                            {Array.from({ length: maxSets }, (_, i) => (
                              <th
                                key={i}
                                className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 w-20"
                              >
                                Set {i + 1}
                              </th>
                            ))}
                            <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 w-20">
                              Boisko
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {stageMatches.map((match) => {
                            const sets = results[match.id]?.sets || [];
                            const team1Wins = sets.filter(set => set.team1_score > set.team2_score).length;
                            const team2Wins = sets.filter(set => set.team2_score > set.team1_score).length;
                            const winner = team1Wins > team2Wins ? "team1" : team2Wins > team1Wins ? "team2" : null; // ⬅ ZMIANA

                            return (
                              <tr
                                key={match.id}
                                onClick={user?.role === "admin" ? () => openMatchModal(match) : undefined}
                                className={`hover:bg-gray-50 ${user?.role === "admin" ? "cursor-pointer" : "cursor-not-allowed"}`}
                              >
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center w-20">
                                  {match.scheduledTime ? formatTime(match.scheduledTime) : "N/A"}
                                </td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6 w-56">
                                  <div className={`truncate ${winner === "team1" ? "font-bold text-blue-600" : ""}`}> {/* ⬅ ZMIANA */}
                                    {match.team1 ? `${match.team1.player1?.lastName} & ${match.team1.player2?.lastName}` : "TBD"}
                                  </div>
                                  <div className={`truncate ${winner === "team2" ? "font-bold text-blue-600" : ""}`}> {/* ⬅ ZMIANA */}
                                    {match.team2 ? `${match.team2.player1?.lastName} & ${match.team2.player2?.lastName}` : "TBD"}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-center w-24">
                                  {sets.length > 0 ? (
                                    <span className="font-semibold">
                                      {team1Wins > 0 || team2Wins > 0 ? `${team1Wins}-${team2Wins}` : "-"}
                                    </span>
                                  ) : "-"}
                                </td>
                                {Array.from({ length: maxSets }, (_, i) => {
                                  const set = sets[i];
                                  return (
                                    <td key={i} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center w-20">
                                      {set && (set.team1_score > 0 || set.team2_score > 0)
                                        ? `${set.team1_score}-${set.team2_score}`
                                        : "-"}
                                    </td>
                                  );
                                })}
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center w-20">
                                  {match.court || "N/A"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {activeTab === "bracket" && <DoubleEliminationBracket tournamentId={tournamentId} />}

        {activeTab === "teams" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Lista drużyn</h2>
            <ul className="mt-4 divide-y divide-gray-100">
              {teams.length > 0 ? (
                teams.map((team, index) => (
                  <li key={team.id} className="py-3">
                    <p className="text-gray-800 font-medium">{index + 1}. Drużyna</p> {/* ⬅ ZAMIANA team.id na index + 1 */}
                    <p className="text-sm text-gray-600">
                      {team.player1.lastName} & {team.player2.lastName}
                    </p>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">Brak drużyn w turnieju.</p>
              )}
            </ul>
          </div>
        )}

      </div>

      {/* Modale */}
      <SignupModal open={isSignupModalOpen} onClose={() => setIsSingupModalOpen(false)} tournamentId={tournamentId} />
      <MatchModal open={isMatchModalOpen} onClose={() => setIsMatchModalOpen(false)} tournamentId={tournamentId} match={selectedMatch} />
    </div>
  );
};

export default TournamentDetails;
