import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit2, Save, X } from "lucide-react";
import { useSettings } from '../context/SettingsContext';
import { useToast } from "@/hooks/use-toast";

const PlayerHistory = ({ playerHistory, updatePlayerHistory }) => {
  const [editingPlayer, setEditingPlayer] = useState(null);
  const { priceMode, americanMode, regularMode } = useSettings();
  const { toast } = useToast();

  useEffect(() => {
    const storedHistory = localStorage.getItem('playerHistory');
    if (storedHistory) {
      updatePlayerHistory(JSON.parse(storedHistory));
    }
  }, [updatePlayerHistory]);

  const clearHistory = () => {
    localStorage.removeItem('playerHistory');
    updatePlayerHistory([]);
  };

  const removePlayer = (playerName) => {
    const newHistory = (playerHistory || []).filter(player => player.name !== playerName);
    localStorage.setItem('playerHistory', JSON.stringify(newHistory));
    updatePlayerHistory(newHistory);
  };

  const startEditing = (player) => {
    setEditingPlayer({ ...player });
  };

  const cancelEditing = () => {
    setEditingPlayer(null);
  };

  const handleEditChange = (e, field) => {
    setEditingPlayer({ ...editingPlayer, [field]: e.target.value });
  };

  const saveEdit = () => {
    const newHistory = playerHistory.map(player => 
      player.name === editingPlayer.name ? editingPlayer : player
    );
    localStorage.setItem('playerHistory', JSON.stringify(newHistory));
    updatePlayerHistory(newHistory);
    setEditingPlayer(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Player History
          <div className="flex items-center space-x-4">
            {priceMode && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {priceMode === 'american' ? 'American Share:' : 'Regular:'}
                </span>
                {priceMode === 'american' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-500 text-white hover:bg-green-600"
                    onClick={() => {
                      toast({
                        title: "American Share",
                        description: `Combined Fee: $${americanMode?.combinedFee || '0.00'}`,
                      });
                    }}
                  >
                    ${americanMode?.combinedFee || '0.00'}
                  </Button>
                ) : (
                  <span className="text-sm">
                    Court: ${regularMode?.courtFee || '0.00'}, 
                    Shuttlecock: ${regularMode?.shuttlecockFee || '0.00'}
                  </span>
                )}
              </div>
            )}
            <Button onClick={clearHistory} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {!playerHistory || playerHistory.length === 0 ? (
          <p>No player history available.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>Games</TableHead>
                <TableHead>Feathers</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="sticky right-0 bg-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerHistory.map((player, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  {editingPlayer && editingPlayer.name === player.name ? (
                    <>
                      <TableCell><Input value={editingPlayer.name} onChange={(e) => handleEditChange(e, 'name')} /></TableCell>
                      <TableCell><Input value={editingPlayer.rank} onChange={(e) => handleEditChange(e, 'rank')} /></TableCell>
                      <TableCell><Input value={editingPlayer.gamesPlayed} onChange={(e) => handleEditChange(e, 'gamesPlayed')} /></TableCell>
                      <TableCell><Input value={editingPlayer.featherCount} onChange={(e) => handleEditChange(e, 'featherCount')} /></TableCell>
                      <TableCell><Input value={editingPlayer.price || ''} onChange={(e) => handleEditChange(e, 'price')} /></TableCell>
                      <TableCell className="sticky right-0 bg-white">
                        <Button onClick={saveEdit} variant="ghost" size="sm" className="mr-1">
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button onClick={cancelEditing} variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>{player.rank}</TableCell>
                      <TableCell>{player.gamesPlayed}</TableCell>
                      <TableCell>{player.featherCount.toFixed(2)}</TableCell>
                      <TableCell>{player.price || '-'}</TableCell>
                      <TableCell className="sticky right-0 bg-white">
                        <Button onClick={() => startEditing(player)} variant="ghost" size="sm" className="mr-1">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => removePlayer(player.name)} variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerHistory;
