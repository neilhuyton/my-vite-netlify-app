// netlify/functions/routers/auth.ts
import { t, protectedProcedure } from "../auth";
import { z } from "zod";
import { prisma, config } from "../config";
import { sendEmail } from "../email";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

export type TRPCContext = {
  event: any; // You might want to use a more specific type like HandlerEvent
  context: any; // You might want to use a more specific type like HandlerContext
  prisma: any; // Replace with actual Prisma client type
  user?: UserContext;
};


export type UserContext = { id: string; email: string };

export const authRouter = t.router({
  signup: t.procedure
    .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
    .mutation(async ({ input, ctx }) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const verificationToken = randomUUID();
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          verificationToken,
        },
      });

      await sendEmail({
        to: input.email,
        subject: "Verify Your Email",
        html: `
          <p>Please verify your email by clicking the link below:</p>
          <a href="${config.APP_URL}/verify-email?token=${verificationToken}">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        `,
      });

      return { message: "Signup successful. Please verify your email." };
    }),

  login: t.procedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (
        !user ||
        !user.isEmailVerified ||
        !(await bcrypt.compare(input.password, user.password))
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: user?.isEmailVerified
            ? "Invalid credentials"
            : "Email not verified",
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return { token, user: { id: user.id, email: user.email } };
    }),

  verifyEmail: t.procedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { verificationToken: input.token },
      });
      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired token",
        });
      }

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true, verificationToken: null },
      });

      return { message: "Email verified successfully" };
    }),

  requestPasswordReset: t.procedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!user || !user.isEmailVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: user ? "Email not verified" : "Email not found",
        });
      }

      const resetPasswordToken = randomUUID();
      const resetPasswordTokenExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );
      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken, resetPasswordTokenExpiresAt },
      });

      await sendEmail({
        to: input.email,
        subject: "Reset Your Password",
        html: `
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${config.APP_URL}/reset-password?token=${resetPasswordToken}">Reset Password</a>
          <p>This link will expire in 24 hours.</p>
        `,
      });

      return { message: "Password reset email sent" };
    }),

  resetPassword: t.procedure
    .input(z.object({ token: z.string(), newPassword: z.string().min(6) }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          resetPasswordToken: input.token,
          resetPasswordTokenExpiresAt: { gt: new Date() },
        },
      });
      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired token",
        });
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 10);
      await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordTokenExpiresAt: null,
        },
      });

      return { message: "Password reset successfully" };
    }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.delete({ where: { id: ctx.user!.id } });
    return { message: "Account deleted successfully" };
  }),
});