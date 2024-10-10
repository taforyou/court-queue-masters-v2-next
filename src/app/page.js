'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast"
import { Trash2, Feather, PlusCircle, Plus, Check, MinusCircle, Edit2, ChevronLeft, ChevronRight,UserPlus, ArrowUpDown, Undo2, Settings } from "lucide-react";
import PlayerHistory from '../components/PlayerHistory';
import Buffer from '../components/Buffer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Setting from '../components/Setting';
import { useSettings } from '../context/SettingsContext';
import { cn } from "@/lib/utils"; // Make sure you have this utility function
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).replace(',', '').replace(/,([^\s])/, ', $1');
};

const CustomCheckbox = React.forwardRef(({ className, ...props }, ref) => {
  const isChecked = props.checked;
  const index = props['data-index'];

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary",
        isChecked && index < 2 ? "data-[state=checked]:bg-red-500" : "",
        isChecked && index >= 2 ? "data-[state=checked]:bg-blue-500" : "",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-white")}>
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
CustomCheckbox.displayName = "CustomCheckbox"

const Home = () => {
  const { toast } = useToast()
  const { priceMode, americanMode, regularMode } = useSettings();

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
  const [playerName, setPlayerName] = useState('');
  const [playerStats, setPlayerStats] = useState({});
  const [playerHistory, setPlayerHistory] = useState([]);
  const [shuttlecockCount, setShuttlecockCount] = useState({});
  const [playerTimestamps, setPlayerTimestamps] = useState({});
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [editingCourtId, setEditingCourtId] = useState(null);
  const [editCourtIdValue, setEditCourtIdValue] = useState('');
  const [currentCourtIndex, setCurrentCourtIndex] = useState(0);
  const courtsContainerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [queueSortField, setQueueSortField] = useState(null);
  const [queueSortDirection, setQueueSortDirection] = useState('asc');
  const [playerGroups, setPlayerGroups] = useState({});
  const [bufferGroups, setBufferGroups] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setCurrentCourtIndex(0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (courtsContainerRef.current) {
      courtsContainerRef.current.scrollTo({
        left: currentCourtIndex * courtsContainerRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  }, [currentCourtIndex]);

  const updatePlayerHistory = useCallback((player, featherCount, rank, gamesPlayed) => {
    setPlayerHistory(prevHistory => {
      const existingPlayerIndex = prevHistory.findIndex(p => p.name === player);
      if (existingPlayerIndex !== -1) {
        const updatedHistory = [...prevHistory];
        const existingPlayer = updatedHistory[existingPlayerIndex];
        
        const featherCountDiff = featherCount - (existingPlayer.featherCount || 0);
        const gamesPlayedDiff = gamesPlayed - (existingPlayer.gamesPlayed || 0);
        
        updatedHistory[existingPlayerIndex] = {
          ...existingPlayer,
          featherCount: (existingPlayer.featherCount || 0) + featherCountDiff,
          gamesPlayed: (existingPlayer.gamesPlayed || 0) + gamesPlayedDiff,
          rank: rank
        };
        localStorage.setItem('playerHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      } else {
        const newHistory = [...prevHistory, { name: player, featherCount, rank, gamesPlayed }];
        localStorage.setItem('playerHistory', JSON.stringify(newHistory));
        return newHistory;
      }
    });
  }, []);

  const addCourt = () => {
    const newId = courts.length > 0 ? Math.max(...courts.map(court => court.id)) + 1 : 1;
    setCourts([...courts, { id: newId, players: [], checkedPlayers: {} }]);
    setCurrentCourtIndex(courts.length);
  };

  const removeCourt = (id) => {
    if (courts.length <= 1) {
      toast({
        title: "Cannot Remove Court",
        description: "At least one court must remain.",
        variant: "destructive",
      });
      return;
    }
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

  const decrementShuttlecockCount = (courtId) => {
    setCourts(prevCourts => {
      const updatedCourts = prevCourts.map(court => {
        if (court.id === courtId) {
          const playerCount = court.players.length;
          if (playerCount === 2 || playerCount === 4) {
            const decrement = playerCount === 2 ? 0.5 : 0.25;
            court.players.forEach(player => {
              setShuttlecockCount(prevCount => ({
                ...prevCount,
                [player]: Math.max((prevCount[player] || 0) - decrement, 0)
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

  const updateQueueAndSort = (queue, playerStats, playerTimestamps) => {
    return queue.sort((a, b) => {
      // First, sort by the number of games played (ascending order)
      if (playerStats[a].games !== playerStats[b].games) {
        return playerStats[a].games - playerStats[b].games;
      }
      
      // If games are equal, prioritize players not currently on a court
      if (playerStats[a].current === 0 && playerStats[b].current > 0) return -1;
      if (playerStats[a].current > 0 && playerStats[b].current === 0) return 1;

      // If both players have the same number of games and court status, 
      // sort by timestamp (earlier timestamp first)
      return playerTimestamps[a] - playerTimestamps[b];
    });
  };

  const addPlayerToQueue = () => {
    if (playerName.trim().length >= 2) {
      // Check if the player name already exists in the queue or on any court
      const playerExists = queue.includes(playerName) || 
                           courts.some(court => court.players.includes(playerName));
  
      if (playerExists) {
        toast({
          title: "Duplicate Name",
          description: "This player name already exists. Please use a unique name.",
          variant: "destructive",
        });
        return; // Exit the function early
      }
  
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
            const currentTime = Date.now();

            // Handle removed players
            removedPlayers.forEach(player => {
              newStats[player] = {
                completed: (newStats[player]?.completed || 0) + 1,
                current: 0,
                currentCourt: null
              };
              const featherCount = shuttlecockCount[player] || 0;
              const rank = playerRanks[player];
              updatePlayerHistory(player, featherCount, rank, newStats[player].completed);
            });

            // Handle remaining players
            remainingPlayers.forEach(player => {
              newStats[player] = {
                ...newStats[player],
                completed: (newStats[player]?.completed || 0) + 1,
                current: (newStats[player]?.current || 0) + 1,
                currentCourt: courtId
              };
              const featherCount = shuttlecockCount[player] || 0;
              const rank = playerRanks[player];
              updatePlayerHistory(player, featherCount, rank, newStats[player].completed);
            });

            // Update timestamps
            setPlayerTimestamps(prevTimestamps => {
              const newTimestamps = {...prevTimestamps};
              removedPlayers.forEach((player, index) => {
                newTimestamps[player] = currentTime + index;
              });
              return newTimestamps;
            });

            return newStats;
          });

          setQueue(prevQueue => {
            const updatedQueue = [...new Set([...prevQueue, ...removedPlayers])];
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

  const assignPlayersToCourt = (playersToAssign, courtId) => {
    // Determine which players we're trying to assign
    const court = courts.find(c => c.id.toString() === courtId.toString());
    
    // Check if court exists and initialize players array if it doesn't exist
    if (!court) {
      console.error(`Court with id ${courtId} not found`);
      return;
    }
    
    if (!court.players) {
      court.players = [];
    }
    
    const availableSlots = 4 - court.players.length;
    const playersToCheck = playersToAssign.length > 0
      ? playersToAssign.slice(0, availableSlots)
      : queue.filter(player => !playerStats[player]?.current).slice(0, availableSlots);

    // Check if there are no available players
    if (playersToCheck.length === 0) {
      toast({
        title: "No Available Players",
        description: "There are no available players in the queue to assign to the court.",
        variant: "destructive",
      });
      return; // Exit the function early
    }

    // Check if any of the players are already on a court
    const playersOnCourts = playersToCheck.filter(player => 
      playerStats[player]?.current > 0 && playerStats[player]?.currentCourt !== courtId
    );

    if (playersOnCourts.length > 0) {
      toast({
        title: "Players Already Assigned",
        description: `${playersOnCourts.join(', ')} ${playersOnCourts.length > 1 ? 'are' : 'is'} already on another court. Cannot assign to Court ${courtId}.`,
        variant: "destructive",
      });
      return; // Exit the function early
    }

    // If we've reached here, it's safe to assign the players and remove them from the buffer if possible
    setCourts(prevCourts => prevCourts.map(court => {
      if (court.id.toString() === courtId.toString()) {
        return { ...court, players: [...court.players, ...playersToCheck] };
      }
      return court;
    }));

    // Update player stats
    setPlayerStats(prevStats => {
      const newStats = {...prevStats};
      playersToCheck.forEach(player => {
        newStats[player] = {
          ...newStats[player],
          current: 1,
          currentCourt: courtId
        };
      });
      return newStats;
    });

    // Update timestamps for assigned players
    const currentTime = Date.now();
    setPlayerTimestamps(prevTimestamps => {
      const newTimestamps = {...prevTimestamps};
      playersToCheck.forEach((player, index) => {
        newTimestamps[player] = currentTime + index;
      });
      return newTimestamps;
    });

    // Keep the assigned players in the queue, but move them to the end
    setQueue(prevQueue => {
      const remainingPlayers = prevQueue.filter(player => !playersToCheck.includes(player));
      return [...remainingPlayers, ...playersToCheck];
    });

    setSelectedPlayers([]);
    // Add this line to remove the assigned players from the buffer
    removePlayersFromBuffer(playersToCheck);
  };

  // Add this new function to remove players from the buffer
  const removePlayersFromBuffer = (playersToRemove) => {
    setBufferGroups(prevGroups => {
      // Find the group that contains all players to remove
      const groupIndex = prevGroups.findIndex(group => 
        playersToRemove.every(player => group.some(p => p.name === player))
      );

      // If we found the group, remove it
      if (groupIndex !== -1) {
        const newGroups = prevGroups.filter((_, index) => index !== groupIndex);
        
        // Notify parent of group change
        handleGroupChange(newGroups);

        return newGroups;
      }

      // If we didn't find the group, don't remove any
      return prevGroups;
    });
  };

  // Update the addPlayersToCourt function to prioritize selected players
  const addPlayersToCourt = (courtId) => {
    const court = courts.find(c => c.id.toString() === courtId.toString());
    const availableSlots = 4 - court.players.length;

    // First, prioritize selected players who are not currently on a court
    const selectedAvailablePlayers = selectedPlayers
      .filter(player => !playerStats[player]?.current)
      .slice(0, availableSlots);

    // If there are still slots available, fill them with players from the queue
    const remainingSlots = availableSlots - selectedAvailablePlayers.length;
    const queuePlayers = queue
      .filter(player => !selectedPlayers.includes(player) && !playerStats[player]?.current)
      .slice(0, remainingSlots);

    const playersToAssign = [...selectedAvailablePlayers, ...queuePlayers];

    assignPlayersToCourt(playersToAssign, courtId);
  };

  const handlePlayerSelection = (player) => {
    setSelectedPlayers(prev => {
      if (prev.includes(player)) {
        // If the player is already selected, remove them
        return prev.filter(p => p !== player);
      } else if (prev.length < 4) {
        // If less than 4 players are selected, add the new player
        return [...prev, player];
      } else {
        // If 4 players are already selected, show a toast and don't add the new player
        toast({
          title: "Maximum Selection Reached",
          description: "You can only select up to 4 players at a time.",
          variant: "warning",
        });
        return prev;
      }
    });
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
      // Check if the new ID already exists in other courts
      const idExists = courts.some(court => court.id === newId && court.id !== editingCourtId);
      
      if (idExists) {
        toast({
          title: "Duplicate Court ID",
          description: "Court ID already exists. Please choose a different ID.",
          variant: "destructive",
        });
      } else {
        setCourts(prevCourts => prevCourts.map(court => 
          court.id === editingCourtId ? { ...court, id: newId } : court
        ));
        setEditingCourtId(null);
      }
    } else {
      toast({
        title: "Invalid court ID",
        description: "Please enter a positive court ID number.",
        variant: "destructive",
      });
    }
  };

  const sortQueue = useCallback((field) => {
    setQueue(prevQueue => {
      const newDirection = field === queueSortField && queueSortDirection === 'asc' ? 'desc' : 'asc';
      setQueueSortDirection(newDirection);
      setQueueSortField(field);

      return [...prevQueue].sort((a, b) => {
        let aValue, bValue;
        if (field === 'games') {
          aValue = playerStats[a]?.completed || 0;
          bValue = playerStats[b]?.completed || 0;
        } else if (field === 'timestamp') {
          aValue = playerTimestamps[a] || 0;
          bValue = playerTimestamps[b] || 0;
        }

        if (aValue < bValue) return newDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return newDirection === 'asc' ? 1 : -1;
        return 0;
      });
    });
  }, [playerStats, playerTimestamps, queueSortField, queueSortDirection]);

  const handleGroupChange = (newGroups) => {
    const updatedPlayerGroups = {};
    newGroups.forEach((group, index) => {
      group.forEach(player => {
        if (!updatedPlayerGroups[player.name]) {
          updatedPlayerGroups[player.name] = [];
        }
        updatedPlayerGroups[player.name].push(index + 1);
      });
    });

    setPlayerGroups(updatedPlayerGroups);
    setBufferGroups(newGroups);
  };

  // Update the queue display to show current groups
  const renderCurrentGroups = (player) => {
    const groups = playerGroups[player] || [];
    return groups.length > 0 ? groups.join('/') : '-';
  };

  const undoPlayerAssignment = (courtId, player) => {
    setCourts(prevCourts => prevCourts.map(court => {
      if (court.id === courtId) {
        return { ...court, players: court.players.filter(p => p !== player) };
      }
      return court;
    }));

    setPlayerStats(prevStats => ({
      ...prevStats,
      [player]: {
        ...prevStats[player],
        current: 0,
        currentCourt: null
      }
    }));

    // Move the player back to the front of the queue
    setQueue(prevQueue => [player, ...prevQueue.filter(p => p !== player)]);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-100 relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
          className="h-10 w-10 rounded-full"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </div>

      {isSettingsOpen && (
        <Setting onClose={() => setIsSettingsOpen(false)} />
      )}

      <div className={isSettingsOpen ? 'filter blur-sm pointer-events-none' : ''}>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">Badminton Match Manager</h1>
    
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Join Queue</h2>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name (min 2 characters)"
              className="flex-grow"
            />
            <div className="flex space-x-2">
              <Select value={selectedRank} onValueChange={setSelectedRank}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  {['BG-', 'BG', 'BG+', 'N-', 'N', 'N+', 'S-', 'S', 'S+', 'P-', 'P', 'P+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'].map(rank => (
                    <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isClient && (
                <Button 
                  onClick={addPlayerToQueue} 
                  disabled={playerName.trim().length < 2} 
                  className="w-full sm:w-auto"
                >
                  Join Queue
                </Button>
              )}
            </div>
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
                        onClick={() => decrementShuttlecockCount(court.id)}
                        disabled={court.players.length !== 2 && court.players.length !== 4}
                      >
                        <MinusCircle className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600"
                        onClick={() => removeCourt(court.id)}
                        disabled={court.players.length > 0}
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm text-gray-500">Current players:</h3>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">Games count:</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {court.players.reduce((acc, player, idx) => {
                          if (idx % 2 === 0) {
                            acc.push(
                              <div key={idx} className="bg-gray-100 rounded-md p-2">
                                {[player, court.players[idx + 1]].map((p, i) => p && (
                                  <div key={`${court.id}-${idx + i}`} className="flex justify-between items-center mb-2 last:mb-0">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`player-${court.id}-${idx + i}`}
                                        checked={court.checkedPlayers[idx + i] || false}
                                        onCheckedChange={() => handleCheckboxChange(court.id, idx + i)}
                                      />
                                      <label htmlFor={`player-${court.id}-${idx + i}`}>{p}</label>
                                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold text-white ${getRankColor(playerRanks[p])}`}>
                                        {playerRanks[p]}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 p-0"
                                        onClick={() => undoPlayerAssignment(court.id, p)}
                                      >
                                        <Undo2 className="h-4 w-4 text-blue-500" />
                                      </Button>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      <span className="text-sm text-gray-500">{shuttlecockCount[p]?.toFixed(2) || '0.00'}</span>
                                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold bg-yellow-400 text-white`}>
                                        {(playerStats[p]?.current || 0)}
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
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => removePlayersFromCourt(court.id, 2)}
                          disabled={getCheckedPlayersCount(court) !== 2}
                          className="flex-1 flex items-center justify-center"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Done 2 players
                        </Button>
                        <Button 
                          onClick={() => removePlayersFromCourt(court.id, 4)} 
                          className="flex-1 flex items-center justify-center"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Done 4 players
                        </Button>
                      </div>
                      <Button 
                        onClick={() => addPlayersToCourt(court.id)} 
                        className="w-full flex items-center justify-center"
                        disabled={court.players.length >= 4}
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
    
        <Buffer 
          selectedPlayers={selectedPlayers}
          setSelectedPlayers={setSelectedPlayers}
          playerRanks={playerRanks} 
          onAssignToCourt={assignPlayersToCourt}
          courts={courts}
          onGroupChange={handleGroupChange}
          bufferGroups={bufferGroups}
          setBufferGroups={setBufferGroups}
        />

        <Card className="mt-6 sm:mt-8">
          <CardHeader>
            <CardTitle>Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-500 border-b">
                    <th className="pb-2 pr-4">Select</th>
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Rank</th>
                    <th className="pb-2 pr-4">Shuttlecocks</th>
                    <th className="pb-2 pr-4">
                      Games
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={() => sortQueue('games')}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </th>
                    <th className="pb-2 pr-4">Current Court</th>
                    <th className="pb-2 pr-4">Current Group</th>
                    <th className="pb-2 pr-4">
                      Timestamp
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={() => sortQueue('timestamp')}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((player, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="py-2 pr-4">
                        <CustomCheckbox
                          id={`queue-player-${index}`}
                          checked={selectedPlayers.includes(player)}
                          onCheckedChange={() => handlePlayerSelection(player)}
                          data-index={selectedPlayers.indexOf(player)}
                        />
                      </td>
                      <td className="py-2 pr-4">{player}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold text-white ${getRankColor(playerRanks[player])}`}>
                          {playerRanks[player]}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center space-x-1">
                          <Feather className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">{shuttlecockCount[player]?.toFixed(2) || '0.00'}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                          playerStats[player]?.current > 0
                            ? 'bg-blue-500 text-white'
                            : playerStats[player]?.completed > 0
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {playerStats[player]?.completed || 0}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {playerStats[player]?.currentCourt ? playerStats[player].currentCourt : '-'}
                      </td>
                      <td className="py-2 pr-4">
                        {renderCurrentGroups(player)}
                      </td>
                      <td className="py-2 pr-4">
                        {playerTimestamps[player] ? formatTimestamp(playerTimestamps[player]) : '-'}
                      </td>
                      <td className="py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePlayerFromQueue(player)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card className="mt-6 sm:mt-8">
          <PlayerHistory 
            playerHistory={playerHistory}
            updatePlayerHistory={setPlayerHistory}
          />
        </Card>
      </div>
    </div>
  );  
  };
  
  export default Home;
  
  