const { Server } = require("socket.io");

const io = new Server(3001, {
  cors: {
    origin: "*",
  },
});

// Przechowywanie danych meczów
const matchesData = {};

io.on("connection", (socket) => {
  console.log("New client connected");

  // Oczekiwanie na przesłanie ID meczu przez klienta
  socket.on("joinMatch", (matchId) => {
    console.log(`Client joined match: ${matchId}`);
    socket.join(matchId);

    console.log("albo chuj");
    // Wysyłanie aktualnych danych meczu do klienta
    if (matchesData[matchId]) {
      console.log(matchesData[matchId]);
      console.log("no powinno działać");
      socket.emit("matchData", matchesData[matchId]);
    }
  });

  socket.on("updateMatch", (data) => {
    const { matchId, ...matchData } = data;
    console.log("Match update received:", data);

    // Aktualizacja danych meczu
    matchesData[matchId] = {
      ...matchesData[matchId],
      ...matchData,
    };
    io.to(matchId).emit("matchUpdated", matchData);
  });

  socket.on("updateTeamAScore", (data) => {
    const { matchId, score } = data;
    if (!matchesData[matchId]) matchesData[matchId] = {};
    matchesData[matchId].teamAScore = score;
    console.log("server A " + matchId);
    io.to(matchId).emit("teamAScoreUpdated", data);
  });

  socket.on("updateTeamBScore", (data) => {
    const { matchId, score } = data;
    if (!matchesData[matchId]) matchesData[matchId] = {};
    matchesData[matchId].teamBScore = score;
    console.log("server B " + score);
    io.to(matchId).emit("teamBScoreUpdated", data);
  });

  socket.on("updateTeamASet", (data) => {
    const { matchId, set } = data;
    if (!matchesData[matchId]) matchesData[matchId] = {};
    matchesData[matchId].teamASet = set;
    io.to(matchId).emit("teamASetUpdated", data);
  });

  socket.on("updateTeamBSet", (data) => {
    const { matchId, set } = data;
    if (!matchesData[matchId]) matchesData[matchId] = {};
    matchesData[matchId].teamBSet = set;
    io.to(matchId).emit("teamBSetUpdated", data);
  });

  socket.on("updateRevert", (data) => {
    const { matchId, reverted } = data;
    if (!matchesData[matchId]) matchesData[matchId] = {};
    matchesData[matchId].reverted = reverted;
    io.to(matchId).emit("revertUpdated", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on port 3001");
