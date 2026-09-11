const USER_KEY = "shared-grid-user";

export const saveUser = (user) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const loadUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearUser = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(USER_KEY);
};
