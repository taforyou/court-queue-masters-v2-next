'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdvancedHistory = ({ matchHistory }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Match History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Court</TableHead>
              <TableHead>Team 1</TableHead>
              <TableHead>Team 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matchHistory.map((match, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(match.timestamp).toLocaleString()}</TableCell>
                <TableCell>Court {match.courtId}</TableCell>
                <TableCell>{match.team1.join(', ')}</TableCell>
                <TableCell>{match.team2.join(', ')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdvancedHistory;