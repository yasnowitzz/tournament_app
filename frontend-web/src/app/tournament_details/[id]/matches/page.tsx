"use client"
import DoubleEliminationBracket from "../../../../components/DoubleEliminationBracket";

export default function TournamentBracketPage({ params }: { params: { id: string } }) {
  return <DoubleEliminationBracket tournamentId={params.id} />;
}