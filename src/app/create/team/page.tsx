"use client";
import { useState } from "react";
import axios from "axios";
import { Layout, Form, Input, Button, List, message } from "antd";

const { Header, Content, Footer } = Layout;

interface Player {
  name: string;
}

const CreateTeam = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddPlayer = (player: Player) => {
    setPlayers([...players, player]);
  };

  const handleCreateTeam = async (values: any) => {
    setLoading(true);

    const teamData = {
      name: values.name,
      players: JSON.stringify(players),
    };

    try {
      await axios.post("/api/teams", teamData);
      message.success("Team created successfully");
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error creating team:", error);
      message.error("Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{ color: "white", textAlign: "center", padding: "0 24px" }}
      >
        <h1>Create New Team</h1>
      </Header>
      <Content style={{ padding: "24px" }}>
        <Form layout="vertical" onFinish={handleCreateTeam}>
          <Form.Item
            label="Team Name"
            name="name"
            rules={[{ required: true, message: "Please enter team name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Add Player"
            name="player"
            rules={[{ required: true, message: "Please enter player name" }]}
          >
            <Input.Search
              enterButton="Add"
              onSearch={(value) => {
                if (value) {
                  handleAddPlayer({ name: value });
                }
              }}
            />
          </Form.Item>
          <List
            header={<div>Players</div>}
            bordered
            dataSource={players}
            renderItem={(player) => <List.Item>{player.name}</List.Item>}
          />
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Team
            </Button>
          </Form.Item>
        </Form>
      </Content>
      <Footer style={{ textAlign: "center" }}>Volleyball Scoreboard</Footer>
    </Layout>
  );
};

export default CreateTeam;
