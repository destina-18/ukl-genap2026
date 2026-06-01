import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || "";
  }
  return "";
}

function getToken() {
  if (typeof window === "undefined") return "";
  return (
    getCookie("accessToken") ||
    getCookie("token") ||
    getCookie("accesstoken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.warn("[WebSocket] No token found, skipping connection");
      return;
    }

    console.log("[WebSocket] Connecting to", BASE_API_URL);
    
    // Inisialisasi Socket.io connection dengan query token
    const socketInstance = io(BASE_API_URL, {
      query: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("[WebSocket] Connected successfully! ID:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[WebSocket] Disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("[WebSocket] Connection error:", error.message);
      setIsConnected(false);
    });

    return () => {
      if (socketInstance) {
        console.log("[WebSocket] Cleaning up connection");
        socketInstance.disconnect();
      }
    };
  }, []);

  return { socket, isConnected };
}
