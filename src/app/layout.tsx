import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "antd/lib/layout";
import { Footer } from "antd/lib/layout/layout";
import Sider from "antd/lib/layout/Sider";
import { Content } from "antd/lib/layout/layout";
import { Menu } from "antd";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import React from "react";
import Link from "next/link";
import ClientSessionProvider from "../components/ClientSessionProvider";
import HeaderWithSession from "@/components/HeaderWithSession";

export const items1 = ["1", "2", "3"].map((key) => ({
  key,
  label: `nav ${key}`,
}));

const items2 = [
  {
    key: "1",
    label: <Link href="/">Home</Link>,
    icon: React.createElement(LaptopOutlined),
  },
  {
    key: "2",
    label: <Link href="/create/match">Create match</Link>,
    icon: React.createElement(LaptopOutlined),
  },
  {
    key: "3",
    label: <Link href="/create/team">Create team</Link>,
    icon: React.createElement(UserOutlined),
  },
  {
    key: "4",
    label: <Link href="/create/rules">Create rules</Link>,
    icon: React.createElement(NotificationOutlined),
  },
];

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientSessionProvider>
          <Layout style={{ minHeight: "100vh" }}>
            <HeaderWithSession />
            <Layout>
              <Sider width={200}>
                <Menu
                  mode="inline"
                  defaultSelectedKeys={["1"]}
                  style={{
                    height: "100%",
                    borderRight: 0,
                  }}
                  items={items2}
                />
              </Sider>
              <Layout
                style={{
                  padding: "24px 24px 24px",
                }}
              >
                <Content
                  style={{
                    padding: 24,
                    margin: 0,
                    minHeight: 280,
                    background: "white",
                    borderRadius: 30,
                  }}
                >
                  {children}
                </Content>
              </Layout>
            </Layout>
          </Layout>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
