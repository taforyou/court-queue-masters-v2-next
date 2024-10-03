'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast"
import { Trash2, Feather, PlusCircle, Plus, Minus, Edit2, Check, ChevronLeft, ChevronRight,UserPlus,UserMinus } from "lucide-react";



const Home = () => {
  const { toast } = useToast()

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

  const [courts, setCourts] = useState([
    { id: 1, players: [], checkedPlayers: {} },
  ]);
  const [queue, setQueue] = useState([]);
  const [playerRanks, setPlayerRanks] = useState({});
  const [selectedRank, setSelectedRank] = useState('BG');
  const [playerStats, setPlayerStats] = useState({});
  const [shuttlecockCount, setShuttlecockCount] = useState({});
  const [playerName, setPlayerName] = useState('');
  const [playerTimestamps, setPlayerTimestamps] = useState({});
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [editingCourtId, setEditingCourtId] = useState(null);
  const [editCourtIdValue, setEditCourtIdValue] = useState('');
  const [currentCourtIndex, setCurrentCourtIndex] = useState(0);
  const courtsContainerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setCurrentCourtIndex(0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const slideCourts = (direction) => {
    if (direction === 'left') {
      setCurrentCourtIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else {
      setCurrentCourtIndex((prevIndex) => Math.min(prevIndex + 1, courts.length - 1));
    }
  };

  useEffect(() => {
    if (courtsContainerRef.current) {
      courtsContainerRef.current.scrollTo({
        left: currentCourtIndex * courtsContainerRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  }, [currentCourtIndex]);

  const addCourt = () => {
    const newId = courts.length > 0 ? Math.max(...courts.map(court => court.id)) + 1 : 1;
    setCourts([...courts, { id: newId, players: [], checkedPlayers: {} }]);
    setCurrentCourtIndex(courts.length);
  };

  const removeCourt = (id) => {
    setCourts(courts.filter(court => court.id !== id));
  };

  const navigateCourts = (direction) => {
    if (direction === 'left') {
      setCurrentCourtIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else {
      setCurrentCourtIndex((prevIndex) => Math.min(prevIndex + 1, courts.length - 1));
    }
  };

  const incrementShuttlecockCount = (courtId) => {
    setCourts(prevCourts => {
      const updatedCourts = prevCourts.map(court => {
        if (court.id === courtId) {
          const playerCount = court.players.length;
          if (playerCount === 2 || playerCount === 4) {
            const increment = playerCount === 2 ? 0.5 : 0.25;
            court.players.forEach(player => {
              setShuttlecockCount(prevCount => ({
                ...prevCount,
                [player]: (prevCount[player] || 0) + increment
              }));
            });
          }
        }
        return court;
      });
      return updatedCourts;
    });
  };

  const handleCheckboxChange = (courtId, playerIndex) => {
    setCourts(courts.map(court => {
      if (court.id === courtId) {
        const newCheckedPlayers = { ...court.checkedPlayers };
        newCheckedPlayers[playerIndex] = !newCheckedPlayers[playerIndex];
        return { ...court, checkedPlayers: newCheckedPlayers };
      }
      return court;
    }));
  };

  const getCheckedPlayersCount = (court) => {
    return Object.values(court.checkedPlayers).filter(Boolean).length;
  };

  const sortQueue = (updatedQueue, currentPlayerStats, currentPlayerTimestamps) => {
    return updatedQueue.sort((a, b) => {
      const statsA = currentPlayerStats[a]?.completed || 0;
      const statsB = currentPlayerStats[b]?.completed || 0;
      if (statsA === 0 && statsB === 0) {
        return currentPlayerTimestamps[a] - currentPlayerTimestamps[b];
      }
      if (statsA === 0) return -1;
      if (statsB === 0) return 1;
      if (statsA !== statsB) {
        return statsA - statsB;
      }
      return currentPlayerTimestamps[a] - currentPlayerTimestamps[b];
    });
  };

  const updateQueueAndSort = (updatedQueue, currentPlayerStats, currentPlayerTimestamps) => {
    const sortedQueue = sortQueue(updatedQueue, currentPlayerStats, currentPlayerTimestamps);
    setQueue(sortedQueue);
  };

  const addPlayerToQueue = () => {
    if (playerName.trim().length >= 2) {
      const timestamp = Date.now();
      setPlayerTimestamps(prev => {
        const updatedTimestamps = {...prev, [playerName]: timestamp};
        setPlayerStats(prevStats => {
          const updatedStats = {...prevStats, [playerName]: { completed: 0, current: 0 }};
          setShuttlecockCount(prevCount => ({...prevCount, [playerName]: 0}));
          setPlayerRanks(prevRanks => ({...prevRanks, [playerName]: selectedRank}));
          setQueue(prevQueue => {
            const updatedQueue = [...prevQueue, playerName];
            updateQueueAndSort(updatedQueue, updatedStats, updatedTimestamps);
            return updatedQueue;
          });
          return updatedStats;
        });
        return updatedTimestamps;
      });
      setPlayerName('');
      setSelectedRank('BG'); // Reset rank to default after adding player
    } else {
      toast({
        title: "Invalid Name",
        description: "Name must be at least 2 characters long.",
        variant: "destructive",
      });
    }
  };  

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addPlayerToQueue();
    }
  };

  const removePlayersFromCourt = (courtId, count) => {
    setCourts(prevCourts => {
      const updatedCourts = prevCourts.map(court => {
        if (court.id === courtId) {
          let removedPlayers;
          let remainingPlayers;
          if (count === 2) {
            const checkedIndices = Object.entries(court.checkedPlayers)
              .filter(([_, isChecked]) => isChecked)
              .map(([index]) => parseInt(index));
            removedPlayers = checkedIndices.map(index => court.players[index]);
            remainingPlayers = court.players.filter((_, index) => !checkedIndices.includes(index));
          } else {
            removedPlayers = court.players.slice(0, count);
            remainingPlayers = court.players.slice(count);
          }

          const currentTime = Date.now();

          setPlayerStats(prev => {
            const newStats = {...prev};
            court.players.forEach(player => {
              newStats[player] = {
                completed: (newStats[player]?.completed || 0) + 1,
                current: 0
              };
            });
            remainingPlayers.forEach(player => {
              newStats[player].current = 1;
            });
            return newStats;
          });

          setPlayerTimestamps(prev => {
            const newTimestamps = {...prev};
            removedPlayers.forEach((player, index) => {
              newTimestamps[player] = currentTime + index;
            });
            return newTimestamps;
          });

          setQueue(prevQueue => {
            const updatedQueue = [...prevQueue, ...removedPlayers];
            setPlayerStats(latestPlayerStats => {
              setPlayerTimestamps(latestPlayerTimestamps => {
                updateQueueAndSort(updatedQueue, latestPlayerStats, latestPlayerTimestamps);
                return latestPlayerTimestamps;
              });
              return latestPlayerStats;
            });
            return updatedQueue;
          });

          return { ...court, players: remainingPlayers, checkedPlayers: {} };
        }
        return court;
      });

      return updatedCourts;
    });
  };

  const addPlayersToCourt = (courtId) => {
    const court = courts.find(c => c.id === courtId);
    const availableSlots = 4 - court.players.length;
    let playersToAdd = [];

    if (selectedPlayers.length === 0) {
      playersToAdd = queue.slice(0, availableSlots);
    } else {
      playersToAdd = selectedPlayers.slice(0, availableSlots);
    }

    if (playersToAdd.length > 0) {
      setCourts(prevCourts => prevCourts.map(c => {
        if (c.id === courtId) {
          return { ...c, players: [...c.players, ...playersToAdd] };
        }
        return c;
      }));

      setPlayerStats(prevStats => {
        const newStats = {...prevStats};
        playersToAdd.forEach(player => {
          newStats[player] = {
            ...newStats[player],
            current: 1
          };
        });
        return newStats;
      });

      setQueue(prevQueue => {
        const updatedQueue = prevQueue.filter(player => !playersToAdd.includes(player));
        setPlayerStats(latestPlayerStats => {
          setPlayerTimestamps(latestPlayerTimestamps => {
            updateQueueAndSort(updatedQueue, latestPlayerStats, latestPlayerTimestamps);
            return latestPlayerTimestamps;
          });
          return latestPlayerStats;
        });
        return updatedQueue;
      });
      setSelectedPlayers([]);
    }
  };

  const handlePlayerSelection = (player) => {
    setSelectedPlayers(prev => 
      prev.includes(player) 
        ? prev.filter(p => p !== player)
        : [...prev, player]
    );
  };

  const removePlayerFromQueue = (playerToRemove) => {
    setQueue(prevQueue => {
      const updatedQueue = prevQueue.filter(player => player !== playerToRemove);
      setPlayerStats(prevStats => {
        const newStats = {...prevStats};
        delete newStats[playerToRemove];
        setPlayerTimestamps(prevTimestamps => {
          const newTimestamps = {...prevTimestamps};
          delete newTimestamps[playerToRemove];
          setPlayerRanks(prevRanks => {
            const newRanks = {...prevRanks};
            delete newRanks[playerToRemove];
            updateQueueAndSort(updatedQueue, newStats, newTimestamps);
            return newRanks;
          });
          return newTimestamps;
        });
        return newStats;
      });
      return updatedQueue;
    });
    setSelectedPlayers(prevSelected => prevSelected.filter(player => player !== playerToRemove));
  };  

  const startEditingCourtId = (courtId) => {
    setEditingCourtId(courtId);
    setEditCourtIdValue(courtId.toString());
  };

  const saveCourtId = () => {
    const newId = parseInt(editCourtIdValue);
    if (!isNaN(newId) && newId > 0) {
      setCourts(prevCourts => prevCourts.map(court => 
        court.id === editingCourtId ? { ...court, id: newId } : court
      ));
      setEditingCourtId(null);
    } else {
      console.log("Invalid court ID");
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-100">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">Badminton Match Manager</h1>
  
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Join Queue</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your name (min 2 characters)"
            className="flex-grow"
          />
          <select
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          >
            {['BG-', 'BG', 'BG+', 'N-', 'N', 'N+', 'S-', 'S', 'S+', 'P-', 'P', 'P+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'].map(rank => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
          </select>
          <Button onClick={addPlayerToQueue} disabled={playerName.trim().length < 2} className="w-full sm:w-auto">Join Queue</Button>
        </div>
      </div>
  
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-semibold">Courts</h2>
        <Button onClick={addCourt} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Add Court
        </Button>
      </div>
  
      <div className="relative">
        <div 
          ref={courtsContainerRef}
          className="flex overflow-x-auto gap-6 sm:gap-8 no-scrollbar"
          style={{
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
          }}
        >
          {courts.map((court, index) => (
            <div 
              key={court.id}
              className="w-full flex-shrink-0 md:w-[calc(33.333%-1rem)]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  {editingCourtId === court.id ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={editCourtIdValue}
                        onChange={(e) => setEditCourtIdValue(e.target.value)}
                        className="w-20"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={saveCourtId}
                        className="h-8 w-8 rounded-full"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-2xl font-semibold">Court {court.id}</CardTitle>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => startEditingCourtId(court.id)}
                        className="h-8 w-8 rounded-full"
                      >
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Feather className="h-4 w-4 text-gray-500" />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => incrementShuttlecockCount(court.id)}
                      disabled={court.players.length !== 2 && court.players.length !== 4}
                    >
                      <PlusCircle className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => removeCourt(court.id)}
                    >
                      <Minus className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="font-semibold">Current Players:</h3>
                    <ul>
                      {court.players.map((player, index) => (
                        <li key={index} className="flex items-center justify-between space-x-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`player-${court.id}-${index}`}
                              checked={court.checkedPlayers[index] || false}
                              onCheckedChange={() => handleCheckboxChange(court.id, index)}
                            />
                            <label htmlFor={`player-${court.id}-${index}`}>{player}</label>
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold text-white ${getRankColor(playerRanks[player])}`}>
                              {playerRanks[player]}
                            </span>
                            </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-col items-center">
                              <Feather className="h-4 w-4 text-gray-500" />
                              <span className="text-xs text-gray-500">{shuttlecockCount[player]?.toFixed(2) || '0.00'}</span>
                            </div>
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                              playerStats[player]?.current === 2
                                ? 'bg-yellow-500 text-white'
                                : 'bg-blue-500 text-white'
                            }`}>
                              {(playerStats[player]?.completed || 0) + (playerStats[player]?.current || 0)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => removePlayersFromCourt(court.id, 2)}
                        disabled={getCheckedPlayersCount(court) !== 2}
                        className="flex-1 flex items-center justify-center"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        2 Players
                      </Button>
                      <Button 
                        onClick={() => removePlayersFromCourt(court.id, 4)} 
                        className="flex-1 flex items-center justify-center"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        All Players
                      </Button>
                    </div>
                    <Button 
                      onClick={() => addPlayersToCourt(court.id)} 
                      className="w-full flex items-center justify-center"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Players from Queue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        {courts.length > 3 && (
          <div className="hidden md:flex justify-between mt-4">
            <Button
              onClick={() => navigateCourts('left')}
              disabled={currentCourtIndex === 0}
              className="p-2"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              onClick={() => navigateCourts('right')}
              disabled={currentCourtIndex === Math.max(0, courts.length - 3)}
              className="p-2"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
  
      <Card className="mt-6 sm:mt-8">
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {queue.map((player, index) => (
              <li key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`queue-player-${index}`}
                  checked={selectedPlayers.includes(player)}
                  onCheckedChange={() => handlePlayerSelection(player)}
                />
                <label htmlFor={`queue-player-${index}`} className="flex-grow flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>{player}</span>
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold text-white ${getRankColor(playerRanks[player])}`}>
                      {playerRanks[player]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col items-center">
                      <Feather className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-500">{shuttlecockCount[player]?.toFixed(2) || '0.00'}</span>
                    </div>
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                      playerStats[player]?.current > 0
                        ? 'bg-blue-500 text-white'
                        : playerStats[player]?.completed > 0
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {playerStats[player]?.completed || 0}
                    </span>
                  </div>
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePlayerFromQueue(player)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );  
  
  };
  
  export default Home;
  
  