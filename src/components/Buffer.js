import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { UserPlus, PlayCircle, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Buffer = ({ selectedPlayers, setSelectedPlayers, playerRanks, onAssignToBuffer, courts }) => {
  const { toast } = useToast()
  const [bufferGroups, setBufferGroups] = useState([]);
  const [selectedCourts, setSelectedCourts] = useState({});

  const addGroup = () => {
    setBufferGroups(prevGroups => {
      const newGroups = [...prevGroups, []];
      setSelectedCourts(prev => ({ ...prev, [newGroups.length - 1]: '' }));
      return newGroups;
    });
  };

  const addPlayerToGroup = (index) => {
    if (selectedPlayers.length !== 4) {
      toast({
        title: "Invalid Group",
        description: "Group must contain exactly 4 selected players",
        variant: "destructive",
      });
      return;
    }
  
    const newPlayers = selectedPlayers.map((name, idx) => ({
      id: Date.now() + idx,
      name: name,
      rank: playerRanks[name] || 'BG' 
    }));
  
    setBufferGroups(prevGroups => {
      const newGroups = [...prevGroups];
      newGroups[index] = newPlayers;
      return newGroups;
    });
  
    setSelectedPlayers([]);
  };

  const removeBufferGroup = (indexToRemove) => {
    setBufferGroups(prevGroups => prevGroups.filter((_, index) => index !== indexToRemove));
    setSelectedCourts(prev => {
      const newSelectedCourts = { ...prev };
      delete newSelectedCourts[indexToRemove];
      return newSelectedCourts;
    });
  };

  const handleAssignToBuffer = (index) => {
    const selectedCourt = selectedCourts[index];
    if (selectedCourt && bufferGroups[index].length === 4) {
      onAssignToBuffer(bufferGroups[index].map(player => player.name), selectedCourt);
      removeBufferGroup(index);
    } else {
      toast({
        title: "Invalid Assignment",
        description: "Please select a court and ensure the group has 4 players",
        variant: "destructive",
      });
    }
  };

  const getRankColor = (rank) => {
    const baseRank = rank.charAt(0);
    switch(baseRank) {
      case 'A': return 'bg-red-500';
      case 'B': return 'bg-orange-500';
      case 'C': return 'bg-yellow-500';
      case 'P': return 'bg-green-500';
      case 'S': return 'bg-blue-500';
      case 'N': return 'bg-indigo-500';
      case 'G': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="mt-6 sm:mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Groups</CardTitle>
        <Button variant="outline" size="sm" onClick={addGroup}>+ Add Group</Button>
      </CardHeader>
      <CardContent>
        <div className="mt-4 flex space-x-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:gap-4">
          {bufferGroups.map((group, index) => (
            <Card key={index} className="mb-4 flex-shrink-0 w-64 sm:w-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Group {index + 1}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select
                    value={selectedCourts[index]}
                    onValueChange={(value) => setSelectedCourts(prev => ({ ...prev, [index]: value }))}
                    className="w-32"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select court" />
                    </SelectTrigger>
                    <SelectContent>
                      {courts.map((court) => (
                        <SelectItem key={court.id} value={court.id.toString()}>
                          Court {court.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => handleAssignToBuffer(index)}
                    className="bg-green-500 hover:bg-green-600 rounded-full p-2 w-8 h-8 flex items-center justify-center"
                  >
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => removeBufferGroup(index)} 
                    variant="destructive" 
                    className="rounded-full p-2 w-8 h-8 flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {Array.isArray(group) && group.length > 0 ? (
                  <div className="space-y-2">
                    {group.reduce((acc, player, idx) => {
                      if (idx % 2 === 0) {
                        acc.push(
                          <div key={idx} className="bg-gray-100 rounded-md p-2">
                            {[player, group[idx + 1]].map((p, i) => p && (
                              <div key={p.id} className="flex justify-between items-center mb-2 last:mb-0">
                                <div className="flex items-center space-x-2">
                                  <span>{p.name}</span>
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold text-white ${getRankColor(p.rank)}`}>
                                    {p.rank}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return acc;
                    }, [])}
                  </div>
                ) : <p>No players in this group</p>}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-x-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 w-full">
                    <Button
                      onClick={() => addPlayerToGroup(index)}
                      className="w-full sm:w-auto mb-2 sm:mb-0"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Player from Queue
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Buffer;