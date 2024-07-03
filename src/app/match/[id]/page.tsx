"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Layout, Button, Row, Col, Typography, Space, message } from "antd";
import { useSession } from "next-auth/react";
import styles from "./MatchPage.module.css";
import { SwapOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
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

      if (fetchedMatch.resultDetailed.sets.length > 0) {
        setCurrentSet(fetchedMatch.resultDetailed.sets.length - 1);
        setTeamAScore(
          fetchedMatch.resultDetailed.sets[
            fetchedMatch.resultDetailed.sets.length - 1
          ].teamA
        );
        setTeamBScore(
          fetchedMatch.resultDetailed.sets[
            fetchedMatch.resultDetailed.sets.length - 1
          ].teamB
        );
      }
    } catch (error) {
      console.error("Error fetching match:", error);
      message.error("Failed to fetch match");
    }
  };

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
      setTeamAScore((prev) => Math.max(prev + delta, 0));
    } else {
      setTeamBScore((prev) => Math.max(prev + delta, 0));
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

      console.log(newTeamASet);
      console.log(newTeamBSet);

      const updatedMatch: MatchWithTeams = {
        ...match,
        resultDetailed: {
          sets: updatedSets,
        },
        result: `${newTeamASet}:${newTeamBSet}`,
      };

      setMatch(updatedMatch);
      setCurrentSet(currentSet + 1);
      setTeamASet(newTeamASet);
      setTeamBSet(newTeamBSet);
      setTeamAScore(0);
      setTeamBScore(0);
    }
  };

  const handleEndMatch = () => {
    if (match) {
      const updatedMatch = { ...match, status: "FINISHED" as "FINISHED" };
      setMatch(updatedMatch);
      axios
        .put(`/api/matches/${match.id}`, updatedMatch)
        .then(() => {
          message.success("Match ended successfully");
        })
        .catch((error) => {
          console.error("Error ending match:", error);
          message.error("Failed to end match");
        });
    }
  };

  const handleRevert = () => {
    setReverted(!reverted);
    console.log(reverted);
  };

  const handleReturnToHome = () => {
    window.location.href = "/";
  };

  const isDisabled =
    match?.status === "FINISHED" || session?.user.role === "OBSERVATOR";

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
                <Button onClick={handleRevert}>
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
                <Title className={styles.score}>
                  {reverted ? teamBScore : teamAScore}
                </Title>
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
                  onClick={() => handleScoreChange(reverted ? "B" : "A", 1)}
                  disabled={isDisabled}
                >
                  +1
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
                <Title className={styles.score}>
                  {reverted ? teamAScore : teamBScore}
                </Title>
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
                  onClick={() => handleScoreChange(reverted ? "A" : "B", 1)}
                  disabled={isDisabled}
                >
                  +1
                </Button>
              </Col>
            </Row>
            <Row justify="center" className={styles.matchActions}>
              <Button
                onClick={handleEndSet}
                disabled={isDisabled || !(teamAScore >= 1 || teamBScore >= 1)}
              >
                End Set
              </Button>
              <Button onClick={handleEndMatch} disabled={isDisabled}>
                End Match
              </Button>
              <Button onClick={handleReturnToHome}>Return to Home</Button>
            </Row>
          </div>
        )}
      </Content>
      <Footer style={{ textAlign: "center" }}>Footer</Footer>
    </Layout>
  );
}
