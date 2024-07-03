import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      login: string;
      role: string;
    };
  }

  interface User {
    id: string;
    login: string;
    role: string;
  }

  interface JWT {
    id: string;
    login: string;
    role: string;
  }
}
