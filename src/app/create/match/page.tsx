"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Layout, Form, Button, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Header, Content, Footer } = Layout;
const { Option } = Select;

interface Team {
  id: number;
  name: string;
}

const CreateMatch = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      console.log("Fetching teams...");
      const response = await axios.get("/api/teams");
      console.log("Teams fetched:", response.data);
      setTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
      message.error("Failed to fetch teams");
    }
  };

  const handleCreateMatch = async (values: any) => {
    setLoading(true);

    const matchData = {
      data: values.date.add(2, "hour").format(),
      teamAId: values.teamA,
      teamBId: values.teamB,
      result: "",
      resultDetailed: JSON.stringify({ sets: [] }),
      status: "PLANNED",
    };

    try {
      await axios.post("/api/matches", matchData);
      message.success("Match created successfully");
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error creating match:", error);
      message.error("Failed to create match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{ color: "white", textAlign: "center", padding: "0 24px" }}
      >
        <h1>Create New Match</h1>
      </Header>
      <Content style={{ padding: "24px" }}>
        <Form layout="vertical" onFinish={handleCreateMatch}>
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item
            label="Team A"
            name="teamA"
            rules={[{ required: true, message: "Please select Team A" }]}
          >
            <Select placeholder="Select Team A">
              {teams.map((team) => (
                <Option key={team.id} value={team.id}>
                  {team.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Team B"
            name="teamB"
            rules={[{ required: true, message: "Please select Team B" }]}
          >
            <Select placeholder="Select Team B">
              {teams.map((team) => (
                <Option key={team.id} value={team.id}>
                  {team.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Match
            </Button>
          </Form.Item>
        </Form>
      </Content>
      <Footer style={{ textAlign: "center" }}>Volleyball Scoreboard</Footer>
    </Layout>
  );
};

export default CreateMatch;
