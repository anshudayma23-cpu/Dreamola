import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        });
        
        if (!user) return null;
        
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
        
        if (!isPasswordValid) return null;
        
        const u = user as any;
        const isAdmin = u.isAdmin ?? (user.email.toLowerCase() === 'anshudayma23@gmail.com');
        const role = u.role ?? (user.email.toLowerCase() === 'anshudayma23@gmail.com' ? 'admin' : 'user');

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          plan: user.plan,
          isAdmin,
          role,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const email = user.email?.toLowerCase();
        if (!email) return false;
        
        let dbUser = await prisma.user.findUnique({
          where: { email }
        });
        
        if (!dbUser) {
          // Auto-create user for Google OAuth
          // Ensure username is unique by appending a random 4-character suffix
          const baseUsername = (user.name || email.split('@')[0]).replace(/[^a-zA-Z0-9]/g, '');
          const uniqueSuffix = Math.random().toString(36).substring(2, 6);
          const finalUsername = `${baseUsername}_${uniqueSuffix}`;

          const newUserData: any = {
            email,
            username: finalUsername,
            passwordHash: '', // No password for OAuth users
            plan: 'free',
            isAdmin: email === 'anshudayma23@gmail.com',
            role: email === 'anshudayma23@gmail.com' ? 'admin' : 'user',
          };

          dbUser = await prisma.user.create({
            data: newUserData
          });
        }
        
        // Populate user object for the jwt callback
        const dbu = dbUser as any;
        user.id = dbUser.id;
        (user as any).username = dbUser.username;
        (user as any).plan = dbUser.plan;
        (user as any).isAdmin = dbu.isAdmin ?? (email === 'anshudayma23@gmail.com');
        (user as any).role = dbu.role ?? (email === 'anshudayma23@gmail.com' ? 'admin' : 'user');
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.plan = user.plan;
        token.isAdmin = (user as any).isAdmin ?? false;
        token.role = (user as any).role ?? 'user';
      }
      
      // Automatically keep plan, isAdmin, and role in sync with database and record active presence
      if (token.id) {
        const freshUser = await prisma.user.update({
          where: { id: token.id as string },
          data: { updatedAt: new Date() }
        }).catch(() => null);

        if (freshUser) {
          const fu = freshUser as any;
          token.plan = freshUser.plan;
          token.isAdmin = fu.isAdmin ?? (freshUser.email?.toLowerCase() === 'anshudayma23@gmail.com');
          token.role = fu.role ?? (freshUser.email?.toLowerCase() === 'anshudayma23@gmail.com' ? 'admin' : 'user');
          token.username = freshUser.username;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.plan = token.plan as string;
        session.user.isAdmin = (token.isAdmin as boolean) ?? false;
        session.user.role = (token.role as string) ?? 'user';
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
  }
};
