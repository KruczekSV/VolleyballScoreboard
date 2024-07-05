"use client";
import { ReactNode } from "react";
import Layout from "antd/lib/layout";
import styles from "./login.module.css"; // Załóżmy, że masz osobny plik CSS dla tego layoutu

const { Content } = Layout;

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <Layout className={styles.layout}>
      <Content className={styles.content}>{children}</Content>
    </Layout>
  );
}
