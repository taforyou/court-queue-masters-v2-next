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
    let value;
    if (field === 'gamesPlayed') {
      value = parseInt(e.target.value, 10) || 0;
    } else if (field === 'featherCount') {
      value = parseFloat(e.target.value) || 0;
    } else {
      value = e.target.value;
    }
    setEditingPlayer({ ...editingPlayer, [field]: value });
  };

  const saveEdit = () => {
    const newHistory = playerHistory.map(player => 
      player.name === editingPlayer.name ? editingPlayer : player
    );
    localStorage.setItem('playerHistory', JSON.stringify(newHistory));
    updatePlayerHistory(newHistory);
    setEditingPlayer(null);
  };

  const updatePrices = () => {
    if (priceMode === 'regular' && regularMode) {
      const courtFee = parseFloat(regularMode.courtFee) || 0;
      const shuttlecockFee = parseFloat(regularMode.shuttlecockFee) || 0;
      const newHistory = playerHistory.map(player => ({
        ...player,
        price: (courtFee + (player.featherCount * 4 * shuttlecockFee)).toFixed(2)
      }));
      localStorage.setItem('playerHistory', JSON.stringify(newHistory));
      updatePlayerHistory(newHistory);
      toast({
        title: "Prices Updated",
        description: "All player prices have been updated and saved.",
      });
    }
  };

  const updateAmericanSharePrices = () => {
    if (priceMode === 'american' && americanMode) {
      const combinedFee = parseFloat(americanMode.combinedFee) || 0;
      const playerCount = playerHistory.length;
      if (playerCount > 0) {
        const pricePerPlayer = (combinedFee / playerCount).toFixed(2);
        const newHistory = playerHistory.map(player => ({
          ...player,
          price: pricePerPlayer
        }));
        localStorage.setItem('playerHistory', JSON.stringify(newHistory));
        updatePlayerHistory(newHistory);
        toast({
          title: "Prices Updated",
          description: `All player prices have been updated to ฿${pricePerPlayer} each.`,
        });
      } else {
        toast({
          title: "No Players",
          description: "There are no players to update prices for.",
          variant: "destructive",
        });
      }
    }
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
                    onClick={updateAmericanSharePrices}
                  >
                    ฿{americanMode?.combinedFee || '0.00'}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-500 text-white hover:bg-green-600"
                    onClick={() => {
                      updatePrices();
                      toast({
                        title: "Regular Fees",
                        description: `Court: ฿${regularMode?.courtFee || '0.00'}, Shuttlecock: ฿${regularMode?.shuttlecockFee || '0.00'}`,
                      });
                    }}
                  >
                    Court Fee : {regularMode?.courtFee || '0.00'} ฿ | Shuttlecock Fee : {regularMode?.shuttlecockFee || '0.00'} ฿
                  </Button>
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
                <TableHead>Shuttlecocks</TableHead>
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
                      <TableCell><Input type="number" value={editingPlayer.gamesPlayed} onChange={(e) => handleEditChange(e, 'gamesPlayed')} /></TableCell>
                      <TableCell><Input type="number" step="0.01" value={editingPlayer.featherCount} onChange={(e) => handleEditChange(e, 'featherCount')} /></TableCell>
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
                      <TableCell>{parseFloat(player.featherCount).toFixed(2)}</TableCell>
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
