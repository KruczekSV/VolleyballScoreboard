import NextAuth, { NextAuthOptions } from 'next-auth';
import { authConfig } from './auth.config';

const authOptions: NextAuthOptions = {
  ...authConfig
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
