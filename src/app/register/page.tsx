"use client";
import { useState } from "react";
import axios from "axios";
import { Form, Input, Button, message, Layout } from "antd";

const { Header, Content, Footer } = Layout;

const Register = () => {
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values: any) => {
    setLoading(true);

    try {
      await axios.post("/api/register", values);
      message.success("Registration successful! You can now log in.");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error registering:", error);
      message.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{ color: "white", textAlign: "center", padding: "0 24px" }}
      >
        <h1>Register</h1>
      </Header>
      <Content style={{ padding: "24px" }}>
        <Form layout="vertical" onFinish={handleRegister}>
          <Form.Item
            label="Login"
            name="login"
            rules={[{ required: true, message: "Please enter your login" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Register
            </Button>
          </Form.Item>
        </Form>
      </Content>
      <Footer style={{ textAlign: "center" }}>Volleyball Scoreboard</Footer>
    </Layout>
  );
};

export default Register;
