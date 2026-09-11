export const isValidCoordinate = (value, max) => {
  return Number.isInteger(value) && value >= 0 && value < max;
};

export const isValidHexColor = (color) => {
  return typeof color === "string" && /^#[0-9A-Fa-f]{6}$/.test(color);
};

export const sanitizeUsername = (username) => {
  if (typeof username !== "string") {
    return null;
  }

  const trimmed = username.trim();

  if (trimmed.length < 2 || trimmed.length > 24) {
    return null;
  }

  return trimmed;
};
