"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Layout, Form, Input, Button, message, Typography } from "antd";
import styles from "./login.module.css"; // Importuj niestandardowe style

const { Title } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: any) => {
    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      login: values.login,
      password: values.password,
    });

    setLoading(false);

    if (result?.error) {
      message.error(result.error);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginForm}>
        <div className={styles.header}>
          <Title level={3}>Login</Title>
        </div>
        <Form layout="vertical" onFinish={handleLogin}>
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
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
        <div className={styles.footer}>
          <Typography.Text>Volleyball Scoreboard</Typography.Text>
        </div>
      </div>
    </div>
  );
}
