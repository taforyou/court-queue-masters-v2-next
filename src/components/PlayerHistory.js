import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, Save, X } from "lucide-react";

const PlayerHistory = ({ playerHistory, updatePlayerHistory }) => {
  const [editingPlayer, setEditingPlayer] = useState(null);

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
          <Button onClick={clearHistory} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!playerHistory || playerHistory.length === 0 ? (
          <p>No player history available.</p>
        ) : (
          <ul>
            {playerHistory.map((player, index) => (
              <li key={index} className="flex justify-between items-center mb-2">
                {editingPlayer && editingPlayer.name === player.name ? (
                  <>
                    <div className="flex-grow mr-2">
                      <Input 
                        value={editingPlayer.name}
                        onChange={(e) => handleEditChange(e, 'name')}
                        className="mb-1"
                      />
                      <Input 
                        value={editingPlayer.rank}
                        onChange={(e) => handleEditChange(e, 'rank')}
                        className="mb-1"
                      />
                      <Input 
                        value={editingPlayer.gamesPlayed}
                        onChange={(e) => handleEditChange(e, 'gamesPlayed')}
                        className="mb-1"
                      />
                      <Input 
                        value={editingPlayer.featherCount}
                        onChange={(e) => handleEditChange(e, 'featherCount')}
                      />
                    </div>
                    <div>
                      <Button onClick={saveEdit} variant="ghost" size="sm" className="mr-1">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button onClick={cancelEditing} variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>
                      {player.name} - Rank: {player.rank}, 
                      Games: {player.gamesPlayed}, 
                      Feathers: {player.featherCount.toFixed(2)}
                    </span>
                    <div>
                      <Button onClick={() => startEditing(player)} variant="ghost" size="sm" className="mr-1">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => removePlayer(player.name)} variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerHistory;
