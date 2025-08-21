
import { PrismaClient } from "@prisma/client";
import {auth0} from "../../lib/auth0";

const prisma = new PrismaClient();

export type GraphQLContext = {
  prisma: PrismaClient;
  user: { sub: string } | null;
};

export async function createContext(request: Request): Promise<GraphQLContext> {
  // Use Auth0 session to get logged-in user
  const session = await auth0.getSession();
  return {
    prisma,
    user: session?.user || null,
  };
}
