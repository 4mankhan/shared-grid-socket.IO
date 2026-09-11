const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const fetchGrid = async () => {
  const response = await fetch(`${API_URL}/api/grid`, {
    cache: "no-store",
  });

  return handleResponse(response);
};

export const fetchLeaderboard = async () => {
  const response = await fetch(`${API_URL}/api/grid/leaderboard`, {
    cache: "no-store",
  });

  return handleResponse(response);
};

export const createUser = async (username, color) => {
  const response = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, color }),
  });

  return handleResponse(response);
};

export const claimCell = async ({ row, column, userId, color }) => {
  const response = await fetch(`${API_URL}/api/grid/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ row, column, userId, color }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to claim cell");
  }

  return data;
};

export const fetchUserStats = async (userId) => {
  const response = await fetch(`${API_URL}/api/users/${userId}/stats`, {
    cache: "no-store",
  });

  return handleResponse(response);
};
