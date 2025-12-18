import { z } from "zod";

export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const AuthLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const AuthSignupSchema = z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email"),
    password: z
      .string()
      .regex(
        STRONG_PASSWORD_REGEX,
        "Password must be at least 8 characters, include uppercase, lowercase, number and special character",
      ),
  });


  export const AccountSecuritySchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email"),

    prevPassword: z
      .string()
      .min(1, "Current password is required"),

    newPassword: z
      .string()
      .regex(
        STRONG_PASSWORD_REGEX,
        "New password must be at least 8 characters, include uppercase, lowercase, number and special character",
      ),
  })
  .refine(
    (data) => data.previousPassword !== data.newPassword,
    {
      message: "New password must be different from current password",
      path: ["newPassword"],
    },
  );