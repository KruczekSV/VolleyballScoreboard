"use client";

import { signOut, useSession } from "next-auth/react";
import { Header } from "antd/lib/layout/layout";
import Link from "next/link";

export default function HeaderWithSession() {
  const { data: session } = useSession();

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <h1 style={{ color: "white", fontWeight: "bolder", fontSize: "20px" }}>
        Volleyball Scoreboard
      </h1>
      {session ? (
        <>
          <p style={{ color: "white" }}>
            Zalogowany jako: {session.user?.login}
          </p>
          <button onClick={() => signOut()} style={{ color: "white" }}>
            Wyloguj się
          </button>
        </>
      ) : (
        <>
          <p style={{ color: "white" }}>Nie zalogowany</p>
          <Link href="/login">
            <p style={{ color: "white" }}>Zaloguj się</p>
          </Link>
        </>
      )}
    </Header>
  );
}
