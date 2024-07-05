"use client";

import { useSession } from "next-auth/react";
import { Header } from "antd/lib/layout/layout";
import { Menu } from "antd";

const items1 = ["1", "2", "3"].map((key) => ({
  key,
  label: `nav ${key}`,
}));

export default function HeaderWithSession() {
  const { data: session } = useSession();

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="demo-logo" />
      <Menu
        theme="dark"
        color="white"
        mode="horizontal"
        defaultSelectedKeys={["2"]}
        items={items1}
        style={{
          flex: 1,
          minWidth: 0,
        }}
      />
      <h1 style={{ color: "white" }}>Volleyball Scoreboard</h1>
      {session ? (
        <p style={{ color: "white" }}>{session.user?.login}</p>
      ) : (
        <p style={{ color: "white" }}>Not logged in</p>
      )}
    </Header>
  );
}
