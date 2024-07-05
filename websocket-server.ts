import { WebSocketServer, WebSocket } from "ws";

// Typ klienta WebSocket
interface Client {
  socket: WebSocket;
  isAlive: boolean;
}

const clients: Client[] = [];

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  const client: Client = {
    socket: socket,
    isAlive: true,
  };

  clients.push(client);

  socket.on("pong", () => {
    client.isAlive = true;
  });

  socket.on("message", (message) => {
    console.log("Received:", message);
    // Prześlij wiadomość do wszystkich klientów
    clients.forEach((c) => {
      c.socket.send(message.toString());
    });
  });

  socket.on("close", () => {
    clients.splice(clients.indexOf(client), 1);
  });
});

setInterval(() => {
  clients.forEach((client) => {
    if (!client.isAlive) {
      client.socket.terminate();
      clients.splice(clients.indexOf(client), 1);
      return;
    }
    client.isAlive = false;
    client.socket.ping();
  });
}, 10000);

console.log("WebSocket server started on ws://localhost:8080");
