"use client";

import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

    socket = io(url, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }

  return socket;
};

export const connectSocket = () => {
  const instance = getSocket();

  if (!instance.connected) {
    instance.connect();
  }

  return instance;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};
