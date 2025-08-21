// @ts-nocheck
import { createYoga } from "graphql-yoga";
import { schema } from "../../../lib/graphql/schema.ts";
import { createContext } from "../../../lib/graphql/context.ts";

const yoga = createYoga({
  schema,
  context: ({ request }: {request: Request}) => createContext(request),
  graphqlEndpoint: "/api/graphql",
});

export const GET = yoga as unknown as (req: Request) => Response | Promise<Response>;
export const POST = yoga as unknown as (req: Request) => Response | Promise<Response>;

