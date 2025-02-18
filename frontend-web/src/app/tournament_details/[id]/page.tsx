"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetcher } from "../../../services/api";
import SignupModal from "../../../components/SignupModal";
import MatchModal from "../../../components/MatchModal";
import DoubleEliminationBracket from "../../../components/DoubleEliminationBracket";

const TournamentDetails = () => {
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

  useEffect(() => {
    if (!isNaN(tournamentId)) {
      fetcher(`/tournaments/${tournamentId}`)
        .then((data) => setTournament(data))
        .catch((error) => console.error("Błąd ładowania turnieju:", error));

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
            console.error(`Błąd ładowania wyniku meczu ${match.id}:`, error);
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
      console.error("Błąd ładowania meczów:", error);
    }
  };

  const fetchTeams = () => {
    fetcher(`/teams/tournament/${tournamentId}`)
      .then((data) => setTeams(data))
      .catch((error) => console.error("Błąd ładowania uczestników:", error));
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

  if (!tournament) return <p className="text-gray-700">Ładowanie szczegółów turnieju...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mt-4">
        <h1 className="text-3xl font-bold">Szczegóły Turnieju #{tournament.id}</h1>
        <button
          onClick={openSignupModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
          Zapisz się do turnieju
        </button>
      </div>
      <p className="text-gray-700 mt-2">Liczba drużyn: {tournament.numTeams}</p>
      <p className="text-gray-700">Liczba boisk: {tournament.numCourts}</p>
      <p className="text-gray-700">Czas startu: {tournament.startTime}</p>
      <p className="text-gray-700">Lokalizacja: {tournament.location}</p>
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
            {Object.entries(groupedMatches).map(([stage, stageMatches]) => (
              <div key={stage} className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{stage}</h2>
                <ul role="list" className="divide-y divide-gray-100">
                  {stageMatches.map((match) => (
                    <li
                      key={match.id}
                      className="flex justify-between gap-x-6 py-5 cursor-pointer hover:bg-gray-100"
                      onClick={() => openMatchModal(match)}
                    >
                      <div className="flex min-w-0 gap-x-4">
                        <div className="min-w-0 flex-auto">
                          <p className="text-sm font-semibold text-gray-900">
                            {match.team1
                              ? `${match.team1.player1.lastName} / ${match.team1.player2.lastName}`
                              : "TBD"} vs{" "}
                            {match.team2
                              ? `${match.team2.player1.lastName} / ${match.team2.player2.lastName}`
                              : "TBD"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">{match.matchTime || "Godzina nieznana"}</p>
                        </div>
                      </div>
                      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                        <p className="text-sm text-gray-900">Boisko: {match.court || "N/A"}</p>
                        <p className="text-sm font-medium text-blue-600">
                          {results[match.id] && results[match.id].team1_score !== undefined && results[match.id].team2_score !== undefined
                            ? `${results[match.id].team1_score} - ${results[match.id].team2_score}`
                            : "Brak wyniku"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}

        {activeTab === "bracket" && <DoubleEliminationBracket tournamentId={tournamentId} />}

        {activeTab === "teams" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Lista drużyn</h2>
            <ul className="mt-4 divide-y divide-gray-100">
              {teams.length > 0 ? (
                teams.map((team) => (
                  <li key={team.id} className="py-3">
                    <p className="text-gray-800 font-medium">Drużyna #{team.id}</p>
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
