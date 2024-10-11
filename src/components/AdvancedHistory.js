'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdvancedHistory = ({ matchHistory }) => {
  // Process match history to group by player
  const playerMatches = matchHistory.reduce((acc, match) => {
    [...match.team1, ...match.team2].forEach(player => {
      if (!acc[player]) acc[player] = [];
      const opponents = [...match.team1, ...match.team2].filter(p => p !== player);
      acc[player].push({
        court: match.courtId,
        teammates: match.team1.includes(player) ? match.team1.filter(p => p !== player) : match.team2.filter(p => p !== player),
        opponents: match.team1.includes(player) ? match.team2 : match.team1
      });
    });
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Match History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Match History</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(playerMatches).map(([player, matches]) => (
              <TableRow key={player}>
                <TableCell>{player}</TableCell>
                <TableCell>
                  {matches.map((match, index) => (
                    <div key={index}>
                      Played with {match.teammates.join(', ')} against {match.opponents.join(', ')} on Court {match.court}
                    </div>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdvancedHistory;