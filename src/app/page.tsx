"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Layout, Table, Button, Select, Space, message } from "antd";
import { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useSession } from "next-auth/react"; // Importowanie useSession

const { Header, Content, Footer } = Layout;
const { Option } = Select;

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

const Home = () => {
  const { data: session } = useSession(); // Użycie useSession
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "PLANNED" | "IN_PROGRESS" | "FINISHED"
  >("all");

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get("/api/matches");
      setMatches(response.data);
    } catch (error) {
      console.error("Error fetching matches:", error);
      message.error("Failed to fetch matches");
    }
  };

  const handleStatusChangeDb = async (record: MatchWithTeams) => {
    try {
      const updatedMatch = {
        ...record,
        status: "IN_PROGRESS" as "IN_PROGRESS",
      };
      await axios.put(`/api/matches/${record.id}`, updatedMatch);
      message.success(`Match ${record.id} status updated to IN_PROGRESS`);
      fetchMatches(); // Odświeżenie listy meczów
    } catch (error) {
      console.error("Error updating match status:", error);
      message.error("Failed to update match status");
    }
  };

  const handleStatusChange = (
    value: "all" | "PLANNED" | "IN_PROGRESS" | "FINISHED"
  ) => {
    setStatusFilter(value);
  };

  const handleCopy = (record: MatchWithTeams) => {
    if (!record.resultDetailed || !record.resultDetailed.sets) {
      message.error("No match details to copy");
      return;
    }

    console.log(record);

    const date = new Date(record.data);
    const formattedDate = `${date.getFullYear()}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")} ${(
      date.getHours() - 2
    )
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

    const teamAResults = record.resultDetailed.sets.map((set) => set.teamA);
    const teamBResults = record.resultDetailed.sets.map((set) => set.teamB);

    const teamATotal = teamAResults.filter(
      (score, index) => score > teamBResults[index]
    ).length;
    const teamBTotal = teamBResults.filter(
      (score, index) => score > teamAResults[index]
    ).length;

    const teamAResultsText = teamAResults.join(" | ");
    const teamBResultsText = teamBResults.join(" | ");

    const textToCopy = `S1 | S2 | S3 | S4 | Total\n${record.teamA.name} ${teamAResultsText} | ${teamATotal}\n${record.teamB.name} ${teamBResultsText} | ${teamBTotal}\n${formattedDate}`;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        message.success(`Copied match data: ${record.id}`);
      })
      .catch((error) => {
        message.error("Failed to copy match data");
        console.error("Copy failed", error);
      });
  };

  const handleDelete = async (record: MatchWithTeams) => {
    try {
      await axios.delete(`/api/matches`, { params: { id: record.id } });
      message.success(`Deleted match: ${record.id}`);
      setMatches(matches.filter((match) => match.id !== record.id));
    } catch (error) {
      console.error("Error deleting match:", error);
      message.error("Failed to delete match");
    }
  };

  const columns: ColumnsType<MatchWithTeams> = [
    {
      title: "Date",
      dataIndex: "data",
      key: "data",
      render: (data: string) => new Date(data).toLocaleDateString(),
    },
    {
      title: "Teams",
      key: "teams",
      render: (_: any, record: MatchWithTeams) =>
        `${record.teamA.name} vs ${record.teamB.name}`,
    },
    {
      title: "Score",
      dataIndex: "result",
      key: "result",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: MatchWithTeams) => (
        <Space>
          {record.status === "PLANNED" && session?.user.role === "REFEREE" ? (
            <Button type="primary" onClick={() => handleStatusChangeDb(record)}>
              Start Match
            </Button>
          ) : (
            (record.status === "PLANNED" ||
              record.status === "IN_PROGRESS") && (
              <Button type="primary">
                <Link href={`/match/${record.id}`}>View</Link>
              </Button>
            )
          )}
          {record.status === "FINISHED" && (
            <Button onClick={() => handleCopy(record)}>Copy Data</Button>
          )}
          <Button danger onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const filteredMatches =
    statusFilter === "all"
      ? matches
      : matches.filter((match) => match.status === statusFilter);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{ color: "white", textAlign: "center", padding: "0 24px" }}
      >
        <h1>Volleyball Scoreboard</h1>
      </Header>
      <Content style={{ padding: "24px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={handleStatusChange}
          >
            <Option value="all">All</Option>
            <Option value="PLANNED">Planned</Option>
            <Option value="IN_PROGRESS">In Progress</Option>
            <Option value="FINISHED">Finished</Option>
          </Select>
          <Table columns={columns} dataSource={filteredMatches} rowKey="id" />
        </Space>
      </Content>
    </Layout>
  );
};

export default Home;
