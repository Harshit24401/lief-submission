// @ts-nocheck

import type { GraphQLContext } from "./context";

async function getCurrentUser(ctx: GraphQLContext) {
  if (!ctx.user) return null;

  let user = await ctx.prisma.user.findUnique({
    where: { auth0Id: ctx.user.sub },
  });

  if (!user) {
    user = await ctx.prisma.user.create({
      data: {
        auth0Id: ctx.user.sub,
        email: ctx.user.email ?? "", // Auth0 provides this
        role: "CareWorker",    // default role
      },
    });
  }

  return user;
}

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, ctx: GraphQLContext) => {
      return getCurrentUser(ctx);
    },

    myShifts: async (_parent: any, _args: any, ctx: GraphQLContext) => {
      const currentUser = await getCurrentUser(ctx);
      if (!currentUser) throw new Error("Not authenticated");

      // CareWorker → only their shifts
      if (currentUser.role === "CareWorker") {
        return ctx.prisma.shift.findMany({
          where: { userId: currentUser.id },
include: { worksite: true }, 
        });
      }

      // Manager → all shifts
      if (currentUser.role === "Manager") {
        return ctx.prisma.shift.findMany({
include: { worksite: true }, 
        });
      }
    },

  

    users: async (_parent: any, _args: any, ctx: GraphQLContext) => {
      const currentUser = await getCurrentUser(ctx);
      if (!currentUser || currentUser.role !== "Manager") {
        throw new Error("Not authorized");
      }
      return ctx.prisma.user.findMany();
    },
  },

  
Mutation: {

createWorksite: async (
      _p: any,
      args: { name: string; latitude: number; longitude: number; radius: number },
      ctx: GraphQLContext
    ) => {
      const currentUser = await getCurrentUser(ctx);
      if (!currentUser || currentUser.role !== "Manager") {
        throw new Error("Only managers can create worksites");
      }

      return ctx.prisma.worksite.create({
        data: {
          name: args.name,
          latitude: args.latitude,
          longitude: args.longitude,
          radius: args.radius,
          managerId: currentUser.id,
        },
      });
    },


clockIn: async (
      _p: any,
      args: { latitude: number; longitude: number; worksiteId: number },
      ctx: GraphQLContext
    ) => {
      const currentUser = await getCurrentUser(ctx);
      if (!currentUser || currentUser.role !== "CareWorker") {
        throw new Error("Only care workers can clock in");
      }

      const worksite = await ctx.prisma.worksite.findUnique({
        where: { id: args.worksiteId },
      });

      if (!worksite) throw new Error("Worksite not found");

      const distance = getDistanceMeters(
        args.latitude,
        args.longitude,
        worksite.latitude,
        worksite.longitude
      );

      if (distance > worksite.radius) {
        throw new Error(`You are too far from the worksite to clock in. Distance: ${distance.toFixed(2)}m`);
      }

      return ctx.prisma.shift.create({
        data: {
          userId: currentUser.id,
          worksiteId: worksite.id,
          clockIn: new Date(),
          location: `${args.latitude},${args.longitude}`,
        },
      });
    },

    makeMeManager: async (_parent: any, _args: any, ctx: GraphQLContext) => {
  const currentUser = await getCurrentUser(ctx);
  if (!currentUser) throw new Error("Not authenticated");

  return ctx.prisma.user.update({
    where: { id: currentUser.id },
    data: { role: "Manager" },
  });
},


  clockOut: async (_parent, args: { shiftId: number }, ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== "CareWorker") {
      throw new Error("Only CareWorkers can clock out");
    }

    const shift = await ctx.prisma.shift.findUnique({
      where: { id: args.shiftId },
    });
    if (!shift || shift.userId !== currentUser.id) {
      throw new Error("Not authorized to update this shift");
    }
    if (shift.clockOut) {
      throw new Error("Shift already closed");
    }

    return ctx.prisma.shift.update({
      where: { id: args.shiftId },
      data: { clockOut: new Date(),
              note: args.note ?? null,
        },
    });
  },

},

  // Relation resolvers (optional if using Prisma's default field resolver)
  Shift: {
    user: (parent: any, _args: any, ctx: GraphQLContext) => {
      return ctx.prisma.user.findUnique({ where: { id: parent.userId } });
    },
  },
  User: {
    shifts: (parent: any, _args: any, ctx: GraphQLContext) => {
      return ctx.prisma.shift.findMany({ where: { userId: parent.id } });
    },
  },
};
