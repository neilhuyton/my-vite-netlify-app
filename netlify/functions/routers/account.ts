// netlify/functions/routers/account.ts
import { t, protectedProcedure } from "../auth";
import { z } from "zod";
import { prisma } from "../config";
import { hash } from "bcrypt";
import { TRPCError } from "@trpc/server";

export const accountRouter = t.router({
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.weightMeasurement.deleteMany({ where: { userId: ctx.user!.id } });
    await prisma.goal.deleteMany({ where: { userId: ctx.user!.id } });
    await prisma.user.delete({ where: { id: ctx.user!.id } });
    return { message: "Account deleted successfully", userId: ctx.user!.id };
  }),
  updatePassword: protectedProcedure
    .input(z.object({ newPassword: z.string().min(6) }))
    .mutation(async ({ input, ctx }) => {
      const hashedPassword = await hash(input.newPassword, 10);
      await prisma.user.update({
        where: { id: ctx.user!.id },
        data: { password: hashedPassword },
      });
      return { message: "Password updated successfully" };
    }),
  updateEmail: protectedProcedure
    .input(z.object({ newEmail: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: input.newEmail },
      });
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email already in use",
        });
      }
      await prisma.user.update({
        where: { id: ctx.user!.id },
        data: { email: input.newEmail, isEmailVerified: false },
      });
      return { message: "Email updated successfully" };
    }),
});