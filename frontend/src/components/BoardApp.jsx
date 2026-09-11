"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  claimCell as claimCellApi,
  createUser,
  fetchGrid,
  fetchLeaderboard,
} from "@/lib/api";
import { connectSocket, getSocket } from "@/lib/socket";
import { loadUser, saveUser } from "@/lib/storage";
import ActivityFeed from "./ActivityFeed";
import Grid from "./Grid";
import GridSkeleton from "./GridSkeleton";
import Leaderboard from "./Leaderboard";
import LoginModal from "./LoginModal";
import Navbar from "./Navbar";
import StatsBar from "./StatsBar";
import UserPanel from "./UserPanel";

const COOLDOWN_MS = 5000;
const ACTIVITY_LIMIT = 20;

const buildCellKey = (row, column) => `${row}-${column}`;

export default function BoardApp() {
  const [user, setUser] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#8b5cf6");
  const [cells, setCells] = useState([]);
  const [rows, setRows] = useState(50);
  const [columns, setColumns] = useState(50);
  const [stats, setStats] = useState({
    totalCells: 2500,
    claimedCells: 0,
    availableCells: 2500,
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [activities, setActivities] = useState([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);

  const lastClaimAtRef = useRef(0);
  const animationTimeoutsRef = useRef(new Map());

  const claimedCount = useMemo(() => {
    if (!user) {
      return 0;
    }

    return cells.filter((cell) => cell.owner === user.username).length;
  }, [cells, user]);

  const refreshLeaderboard = useCallback(async () => {
    try {
      const response = await fetchLeaderboard();
      setLeaderboard(response.data.leaderboard);
    } catch {
      // Leaderboard refresh failures are non-blocking.
    }
  }, []);

  const applyCellUpdate = useCallback((updatedCell) => {
    const key = buildCellKey(updatedCell.row, updatedCell.column);

    setCells((previous) => {
      const index = previous.findIndex(
        (cell) => cell.row === updatedCell.row && cell.column === updatedCell.column
      );
      const wasClaimed = index !== -1 && previous[index]?.owner;

      if (!wasClaimed && updatedCell.owner) {
        setStats((statsPrevious) => ({
          ...statsPrevious,
          claimedCells: statsPrevious.claimedCells + 1,
          availableCells: Math.max(statsPrevious.availableCells - 1, 0),
        }));
      }

      if (index === -1) {
        return [...previous, updatedCell];
      }

      const next = [...previous];
      next[index] = { ...next[index], ...updatedCell };
      return next;
    });

    setRecentlyUpdated((previous) => new Set(previous).add(key));

    const existingTimeout = animationTimeoutsRef.current.get(key);

    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeoutId = setTimeout(() => {
      setRecentlyUpdated((previous) => {
        const next = new Set(previous);
        next.delete(key);
        return next;
      });

      animationTimeoutsRef.current.delete(key);
    }, 600);

    animationTimeoutsRef.current.set(key, timeoutId);
  }, []);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [gridResponse, leaderboardResponse] = await Promise.all([
        fetchGrid(),
        fetchLeaderboard(),
      ]);

      setCells(gridResponse.data.cells);
      setRows(gridResponse.data.rows);
      setColumns(gridResponse.data.columns);
      setStats({
        totalCells: gridResponse.data.totalCells,
        claimedCells: gridResponse.data.claimedCells,
        availableCells: gridResponse.data.availableCells,
      });
      setLeaderboard(leaderboardResponse.data.leaderboard);
    } catch (error) {
      setLoadError(error.message || "Failed to load grid data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const storedUser = loadUser();

    if (storedUser) {
      setUser(storedUser);
      setSelectedColor(storedUser.color || "#8b5cf6");
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const socket = connectSocket();

    const handleConnect = () => {
      socket.emit("user_join", {
        userId: user.id,
        username: user.username,
        color: selectedColor,
      });
    };

    const handleCellUpdated = (updatedCell) => {
      applyCellUpdate(updatedCell);
      refreshLeaderboard();
    };

    const handleActivity = (activity) => {
      setActivities((previous) =>
        [{ ...activity, id: `${activity.timestamp}-${activity.row}-${activity.column}` }, ...previous].slice(
          0,
          ACTIVITY_LIMIT
        )
      );
    };

    const handleOnlineUsers = ({ count, users }) => {
      setOnlineCount(count);
      setOnlineUsers(users || []);
    };

    const handleUserEvent = (event) => {
      if (event.type === "USER_JOINED") {
        toast.success(`${event.username} joined the grid`);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("cell_updated", handleCellUpdated);
    socket.on("activity", handleActivity);
    socket.on("online_users", handleOnlineUsers);
    socket.on("user_event", handleUserEvent);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("cell_updated", handleCellUpdated);
      socket.off("activity", handleActivity);
      socket.off("online_users", handleOnlineUsers);
      socket.off("user_event", handleUserEvent);
    };
  }, [user, selectedColor, applyCellUpdate, refreshLeaderboard]);

  useEffect(() => {
    if (cooldownRemaining <= 0) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - lastClaimAtRef.current;
      const remaining = Math.max(Math.ceil((COOLDOWN_MS - elapsed) / 1000), 0);
      setCooldownRemaining(remaining);
    }, 250);

    return () => clearInterval(intervalId);
  }, [cooldownRemaining]);

  useEffect(() => {
    return () => {
      animationTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      animationTimeoutsRef.current.clear();
    };
  }, []);

  const handleJoin = async (username) => {
    setIsJoining(true);
    setLoginError("");

    try {
      const response = await createUser(username);
      const newUser = response.data.user;

      saveUser(newUser);
      setUser(newUser);
      setSelectedColor(newUser.color);
      toast.success(`Welcome, ${newUser.username}!`);
    } catch (error) {
      setLoginError(error.message || "Unable to create user");
    } finally {
      setIsJoining(false);
    }
  };

  const handleClaim = async (row, column) => {
    if (!user || isClaiming || cooldownRemaining > 0) {
      return;
    }

    const targetCell = cells.find(
      (cell) => cell.row === row && cell.column === column
    );

    if (targetCell?.owner) {
      toast.error("Cell already claimed");
      return;
    }

    setIsClaiming(true);

    try {
      const socket = getSocket();

      if (socket.connected) {
        await new Promise((resolve, reject) => {
          socket.emit(
            "claim_cell",
            {
              row,
              column,
              userId: user.id,
              color: selectedColor,
            },
            (response) => {
              if (response?.success) {
                resolve(response);
              } else {
                reject(new Error(response?.message || "Failed to claim cell"));
              }
            }
          );
        });
      } else {
        await claimCellApi({
          row,
          column,
          userId: user.id,
          color: selectedColor,
        });
      }

      lastClaimAtRef.current = Date.now();
      setCooldownRemaining(Math.ceil(COOLDOWN_MS / 1000));
      toast.success(`Claimed cell (${row}, ${column})`);
    } catch (error) {
      toast.error(error.message || "Unable to claim cell");
    } finally {
      setIsClaiming(false);
    }
  };

  const claimDisabled =
    !user || isClaiming || cooldownRemaining > 0 || Boolean(loadError);

  return (
    <div className="min-h-screen bg-app-gradient">
      <Navbar onlineCount={onlineCount} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {loadError ? (
          <div className="glass-card mb-6 border border-red-400/20 p-5 text-red-300">
            <p className="font-medium">Failed to load grid</p>
            <p className="mt-1 text-sm text-red-200/80">{loadError}</p>
            <button
              type="button"
              onClick={loadInitialData}
              className="mt-4 rounded-lg border border-red-300/30 px-4 py-2 text-sm hover:bg-red-500/10"
            >
              Retry
            </button>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-6">
            {isLoading ? (
              <GridSkeleton />
            ) : (
              <Grid
                rows={rows}
                columns={columns}
                cells={cells}
                recentlyUpdated={recentlyUpdated}
                currentUsername={user?.username}
                onClaim={handleClaim}
                claimDisabled={claimDisabled}
              />
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <StatsBar
                totalCells={stats.totalCells}
                claimedCells={stats.claimedCells}
                availableCells={stats.availableCells}
              />
              <ActivityFeed activities={activities} />
            </div>
          </section>

          <aside className="space-y-6">
            <UserPanel
              user={user}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              onlineUsers={onlineUsers}
              claimedCount={claimedCount}
              cooldownRemaining={cooldownRemaining}
            />
            <Leaderboard
              entries={leaderboard}
              currentUsername={user?.username}
            />
          </aside>
        </div>
      </main>

      {!user ? (
        <LoginModal
          onSubmit={handleJoin}
          isLoading={isJoining}
          error={loginError}
        />
      ) : null}
    </div>
  );
}
