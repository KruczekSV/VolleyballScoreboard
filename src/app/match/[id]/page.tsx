"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Layout, Button, Row, Col, Typography, Space, message } from "antd";
import { useSession } from "next-auth/react";
import styles from "./MatchPage.module.css";
import { SwapOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface Team {
  id: number;
  name: string;
}

interface SetResult {
  teamA: number;
  teamB: number;
}

interface MatchWithTeams {
  id: number;
  data: string;
  teamA: Team;
  teamB: Team;
  result: string;
  resultDetailed: {
    sets: SetResult[];
  };
  status: "PLANNED" | "IN_PROGRESS" | "FINISHED";
}

const socket = io("http://localhost:3001");

export default function MatchPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [match, setMatch] = useState<MatchWithTeams | null>(null);
  const [currentSet, setCurrentSet] = useState(0);
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [matchTime, setMatchTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [teamASet, setTeamASet] = useState(0);
  const [teamBSet, setTeamBSet] = useState(0);
  const [reverted, setReverted] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchMatch(params.id);
    }
  }, [params.id]);

  const fetchMatch = async (matchId: string) => {
    try {
      const response = await axios.get(`/api/matches/${matchId}`);
      const fetchedMatch: MatchWithTeams = {
        ...response.data,
        resultDetailed: {
          sets: response.data.resultDetailed.sets.map((set: string) => {
            const [teamA, teamB] = set.split(":").map(Number);
            return { teamA, teamB };
          }),
        },
      };

      setMatch(fetchedMatch);
      setCurrentSet(0);
      // setTeamAScore(0);
      // setTeamBScore(0);
    } catch (error) {
      console.error("Error fetching match:", error);
      message.error("Failed to fetch match");
    }
  };

  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      socket.emit("joinMatch", params.id);
    });

    socket.on("matchUpdated", (data: MatchWithTeams) => {
      console.log("Match updated:", data);
      setMatch((prevMatch) => ({
        ...prevMatch!,
        ...data,
      }));
    });

    socket.on(
      "matchData",
      (data: {
        teamAScore: number;
        teamBScore: number;
        teamASet: number;
        teamBSet: number;
        reverted: boolean;
      }) => {
        console.log("Current match data:", data);
        const { teamAScore, teamASet, teamBScore, teamBSet, reverted } = data;
        setReverted(reverted);
        console.log("Score A", teamAScore);
        console.log("Score B", teamBScore);
        setTeamAScore(teamAScore);
        setTeamBScore(teamBScore);
        setTeamASet(teamASet);
        setTeamBSet(teamBSet);
      }
    );

    socket.on(
      "teamAScoreUpdated",
      (data: { matchId: string; score: number }) => {
        if (data.matchId === params.id) {
          setTeamAScore(data.score);
        }
      }
    );

    socket.on(
      "teamBScoreUpdated",
      (data: { matchId: string; score: number }) => {
        if (data.matchId === params.id) {
          setTeamBScore(data.score);
        }
      }
    );

    socket.on("teamASetUpdated", (data: { matchId: string; set: number }) => {
      if (data.matchId === params.id) {
        setTeamASet(data.set);
      }
    });

    socket.on("teamBSetUpdated", (data: { matchId: string; set: number }) => {
      if (data.matchId === params.id) {
        setTeamBSet(data.set);
      }
    });

    socket.on(
      "revertUpdated",
      (data: { matchId: string; reverted: boolean }) => {
        if (data.matchId === params.id) {
          setReverted(data.reverted);
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [params.id]);

  useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    const id = setInterval(() => {
      setMatchTime((prev) => prev + 1);
    }, 1000);
    setIntervalId(id);
    return () => clearInterval(id);
  }, []);

  const handleScoreChange = (team: "A" | "B", delta: number) => {
    if (team === "A") {
      const newScore = Math.max(teamAScore + delta, 0);
      setTeamAScore(newScore);

      socket.emit("updateTeamAScore", { matchId: params.id, score: newScore });
    } else {
      const newScore = Math.max(teamBScore + delta, 0);
      setTeamBScore(newScore);
      socket.emit("updateTeamBScore", { matchId: params.id, score: newScore });
    }
  };

  const handleEndSet = () => {
    let newTeamASet = teamASet;
    let newTeamBSet = teamBSet;

    if (teamAScore > teamBScore) {
      newTeamASet += 1;
    } else {
      newTeamBSet += 1;
    }
    if (match) {
      const updatedSets = [...match.resultDetailed.sets];
      updatedSets[currentSet] = { teamA: teamAScore, teamB: teamBScore };

      const updatedMatch: MatchWithTeams = {
        ...match,
        resultDetailed: {
          sets: updatedSets,
        },
        result: `${newTeamASet}:${newTeamBSet}`,
      };

      setMatch(updatedMatch);

      socket.emit("updateTeamAScore", { matchId: params.id, score: 0 });
      socket.emit("updateTeamBScore", { matchId: params.id, score: 0 });
      socket.emit("updateTeamASet", { matchId: params.id, set: newTeamASet });
      socket.emit("updateTeamBSet", { matchId: params.id, set: newTeamBSet });
    }
  };

  const handleEndMatch = () => {
    if (match) {
      const updatedMatch = { ...match, status: "FINISHED" as "FINISHED" };
      setMatch(updatedMatch);
      console.log(updatedMatch);
      axios
        .put(`/api/matches/${match.id}`, updatedMatch)
        .then(() => {
          message.success("Match ended successfully");

          socket.emit("updateMatch", updatedMatch);
        })
        .catch((error) => {
          console.error("Error ending match:", error);
          message.error("Failed to end match");
        });
    }
  };

  const handleRevert = () => {
    const newReverted = !reverted;
    setReverted(newReverted);
    socket.emit("updateRevert", { matchId: params.id, reverted: newReverted });
  };

  const handleReturnToHome = () => {
    window.location.href = "/";
  };

  const isDisabled =
    match?.status === "FINISHED" ||
    session?.user.role === "OBSERVATOR" ||
    session === null;

  if (!match || !match.teamA || !match.teamB) {
    return <div>Loading...</div>;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{ color: "white", textAlign: "center", padding: "0 24px" }}
      >
        <h1>Match Details</h1>
      </Header>
      <Content style={{ padding: "24px" }}>
        {match && (
          <div className={styles.matchContainer}>
            <Row
              justify="space-between"
              align="middle"
              className={styles.matchHeader}
            >
              <Col>
                <Title level={2}>
                  {reverted ? match.teamB.name : match.teamA.name}
                </Title>
              </Col>
              <Col>
                <Text className={styles.sets}>
                  {reverted
                    ? `${teamBSet} - ${teamASet}`
                    : `${teamASet} - ${teamBSet}`}
                </Text>
                <br></br>
                <Button onClick={handleRevert} disabled={isDisabled}>
                  <SwapOutlined />
                </Button>
              </Col>
              <Col>
                <Title level={2}>
                  {reverted ? match.teamA.name : match.teamB.name}
                </Title>
              </Col>
            </Row>
            <Row
              justify="space-between"
              align="middle"
              className={styles.scoreBoard}
            >
              <Col span={8} className={styles.teamScore}>
                <Button
                  style={{
                    background: "none",
                    border: "none",
                    boxShadow: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleScoreChange(reverted ? "B" : "A", -1)}
                  disabled={isDisabled}
                >
                  -1
                </Button>
                <Button
                  className={styles.score}
                  onClick={() => handleScoreChange(reverted ? "B" : "A", 1)}
                  disabled={isDisabled}
                >
                  {reverted ? teamBScore : teamAScore}
                </Button>
              </Col>
              <Col span={8} className={styles.matchInfo}>
                <Text>{`${Math.floor(matchTime / 60)
                  .toString()
                  .padStart(2, "0")}:${(matchTime % 60)
                  .toString()
                  .padStart(2, "0")}`}</Text>
              </Col>
              <Col span={8} className={styles.teamScore}>
                <Button
                  style={{
                    background: "none",
                    border: "none",
                    boxShadow: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleScoreChange(reverted ? "A" : "B", -1)}
                  disabled={isDisabled}
                >
                  -1
                </Button>

                <Button
                  className={styles.score}
                  onClick={() => handleScoreChange(reverted ? "A" : "B", 1)}
                  disabled={isDisabled}
                >
                  {reverted ? teamAScore : teamBScore}
                </Button>
              </Col>
            </Row>
            <Row justify="center" className={styles.matchActions}>
              <Button
                onClick={handleEndSet}
                disabled={
                  isDisabled ||
                  !(
                    (teamAScore > 25 || teamBScore > 25) &&
                    Math.abs(teamAScore - teamBScore) >= 2
                  )
                }
              >
                End Set
              </Button>
              <Button
                onClick={handleEndMatch}
                disabled={isDisabled || !(teamASet >= 3 || teamBSet >= 3)}
              >
                End Match
              </Button>
              <Button onClick={handleReturnToHome}>Return to Home</Button>
            </Row>
          </div>
        )}
      </Content>
    </Layout>
  );
}
