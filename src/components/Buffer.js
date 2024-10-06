import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { UserPlus, PlayCircle, Trash2  } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Buffer = ({selectedPlayers,setSelectedPlayers,playerRanks }) => {
  const { toast } = useToast()
  const [bufferGroups, setBufferGroups] = useState([]);

  const addGroup = () => {
    setBufferGroups(prevGroups => [...prevGroups, []]);
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
  
    setSelectedPlayers([])
  };

  const removeBufferGroup = (indexToRemove) => {
    setBufferGroups(prevGroups => prevGroups.filter((_, index) => index !== indexToRemove));
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
              <CardHeader>
                <CardTitle>Group {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(group) ? (
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
                      onClick={() => {
                        addPlayerToGroup(index);
                      }}
                      className="w-full sm:w-auto mb-2 sm:mb-0"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Player from Queue
                    </Button>
                    <Select className="w-full sm:flex-1 mt-2 sm:mt-0">
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="action1">Action 1</SelectItem>
                        <SelectItem value="action2">Action 2</SelectItem>
                        <SelectItem value="action3">Action 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <Button
                      onClick={() => {
                        addPlayerToGroup(index);
                      }}
                      className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600"
                    >
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => removeBufferGroup(index)} variant="destructive" className="flex-1 sm:flex-none">
                      <Trash2 className="h-4 w-4" />
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
