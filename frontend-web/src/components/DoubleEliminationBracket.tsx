import React, { useEffect, useState } from 'react';
import { IRoundProps } from 'react-brackets';
import LosingBracket from './LosingBracket';
import WiningBracket from './WiningBracket';
import { fetcher } from "../services/api";

const DoubleElimination = ({ tournamentId }) => {
  const [wining, setWining] = useState<IRoundProps[]>([]);
  const [losing, setLosing] = useState<IRoundProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const matchRes = await fetcher(`/matches/tournament/${tournamentId}`);
        const teamRes = await fetcher(`/teams/tournament/${tournamentId}`);

        const getTeamName = (teamId: number | null) => {
          if (!teamId) return 'TBD';
          const team = teamRes.find((t: any) => t.id === teamId);
          return team ? `${team.player1.firstName} ${team.player1.lastName} / ${team.player2.firstName} ${team.player2.lastName}` : 'TBD';
        };

        // Grupowanie meczów według stage
        const groupedRounds: { [key: string]: any[] } = {};
        matchRes.forEach((match: any) => {
          if (!groupedRounds[match.stage]) {
            groupedRounds[match.stage] = [];
          }
          groupedRounds[match.stage].push(match);
        });

        // Posortowanie rund według najniższego match_id
        const sortedRounds = Object.keys(groupedRounds)
          .sort((a, b) => {
            const minMatchIdA = Math.min(...groupedRounds[a].map(m => m.match_id));
            const minMatchIdB = Math.min(...groupedRounds[b].map(m => m.match_id));
            return minMatchIdA - minMatchIdB;
          });

        // Podział na winners i losers
        const winnersRounds = sortedRounds.filter(stage => !stage.includes("Loosers"));
        const losersRounds = sortedRounds.filter(stage => stage.includes("Loosers"));

        const winingData = winnersRounds.map(stage => ({
          title: stage,
          seeds: matchRes.filter((m: any) => m.stage === stage).map((match: any) => ({
            id: match.match_id,
            teams: [
              { id: match.team1?.id, name: getTeamName(match.team1?.id), score: match.winner === match.team1?.id ? 1 : 0 },
              { id: match.team2?.id, name: getTeamName(match.team2?.id), score: match.winner === match.team2?.id ? 1 : 0 }
            ],
          })),
        }));

        const losingData = losersRounds.map(stage => ({
          title: stage,
          seeds: matchRes.filter((m: any) => m.stage === stage).map((match: any) => ({
            id: match.match_id,
            teams: [
              { id: match.team1?.id, name: getTeamName(match.team1?.id), score: match.winner === match.team1?.id ? 1 : 0 },
              { id: match.team2?.id, name: getTeamName(match.team2?.id), score: match.winner === match.team2?.id ? 1 : 0 }
            ],
          })),
        }));

        setWining(winingData);
        setLosing(losingData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div style={{ position: 'relative', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 className="text-2xl font-bold mb-4">Double Elimination Bracket</h1>
      <WiningBracket rounds={wining} />
      <div style={{ height: 50 }}></div>
      <LosingBracket rounds={losing} />
    </div>
  );
};

export default DoubleElimination;