/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import styles from "@/styles/Home.module.css";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/types/socketCustomTypes";
import { Button } from "@mui/material";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

function RoomPage(): JSX.Element {
  const router = useRouter();
  const { id } = router.query;
  const [message, setMessage] = useState("Hello World");

  useEffect(() => {
    if (!socket) {
      void fetch("/api/socket");
      socket = io();

      socket.on("connect", () => {
        console.log("connected");
      });

      socket.on("sendNotif", (msg) => {
        console.log(msg);
      });
      socket.on("userServerConnection", () => {
        console.log("a user connected (client)");
      });

      socket.on("userServerDisconnection", (socketid: string) => {
        console.log(socketid);
      });
    }
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  useEffect(() => {
    if (socket && id) {
      socket.emit("joinRoom", String(id));
    }
  }, [id]);

  function leaveRoom(
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
    id: string
  ): void {
    if (socket) {
      socket.emit("leaveRoom", id);
      // void router.push("/room");
    }
  }

  return (
    <main className={styles.main}>
      <p>You are in room {id}</p>
      <input
        value={message}
        type="text"
        onChange={(e) => {
          setMessage(e.target.value);
        }}
      />
      <Button onClick={() => socket?.emit("sendMsg", message, String(id))}>
        Send message
      </Button>
      <Button
        onClick={() => {
          leaveRoom(socket, String(id));
        }}
      >
        Leave
      </Button>
    </main>
  );
}

export default RoomPage;
