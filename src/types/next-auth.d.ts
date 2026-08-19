import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      plan: string;
      isAdmin: boolean;
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    username: string;
    plan: string;
    isAdmin: boolean;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    plan: string;
    isAdmin: boolean;
    role: string;
  }
}
