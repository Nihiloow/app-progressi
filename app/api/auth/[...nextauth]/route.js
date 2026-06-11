// Destination : app/api/auth/[...nextauth]/route.js
// La configuration vit dans lib/auth.js : cette route ne fait que la brancher.

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
