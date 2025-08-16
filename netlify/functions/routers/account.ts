// netlify/functions/routers/account.ts
import { t, protectedProcedure } from "../auth"; // Import protectedProcedure and t
import { z } from "zod";
import { prisma } from "../config";
import { hash } from "bcrypt"; // Assuming bcrypt for password hashing

export const accountRouter = t.router({
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.weightMeasurement.deleteMany({
      where: { userId: ctx.user!.id },
    });
    await prisma.user.delete({ where: { id: ctx.user!.id } });
    return { message: "Account deleted successfully" };
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
      await prisma.user.update({
        where: { id: ctx.user!.id },
        data: { email: input.newEmail },
      });
      return { message: "Email updated successfully" };
    }),
});
