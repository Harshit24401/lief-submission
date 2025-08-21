import { createSchema } from "graphql-yoga";
import type { GraphQLContext } from "./context";
import { resolvers } from "./resolvers";
export const typeDefinitions = /* GraphQL */ `

    enum Role {
      Manager
      CareWorker
    }

    type User {
      id: ID!
      auth0Id: String!
      email: String!
      role: Role!
      shifts: [Shift!]!
    }

    type Shift {
      id: ID!
      user: User!
      worksite: Worksite!
      clockIn: String!
      clockOut: String
      location: String
      note: String
    }

    type Worksite {
      id: ID!
      name: String!
      latitude: Float!
      longitude: Float!
      radius: Float!
      createdAt: String!
      updatedAt: String!
      manager: User!
      shifts: [Shift!]!
    }

    type Query {
      me: User
      myShifts: [Shift!]!
      myWorksites: [Worksite!]!
      users: [User!]!
    }

    type Mutation {
      createWorksite(
        name: String!
        latitude: Float!
        longitude: Float!
        radius: Float!
      ): Worksite!

      clockIn(
        latitude: Float!
        longitude: Float!
        worksiteId: Int!
      ): Shift!

      clockOut(
        shiftId: Int!, note: String
      ): Shift!

      makeMeManager: User!
    }
  `

export const schema = createSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions],
});
