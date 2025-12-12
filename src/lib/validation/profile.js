import { z } from "zod";

const usernamePattern = /^[a-z0-9_]{3,20}$/;

export const OnboardingSchema = z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
  
    username: z
      .string()
      .trim()
      .transform((val) => (val.startsWith("@") ? val.slice(1) : val)) // drop @
      .transform((val) => val.toLowerCase())
      .refine(
        (val) => usernamePattern.test(val),
        {
          message:
            "Username must be 3 to 20 characters, lowercase letters, numbers or underscores",
        },
      ),
  
    location: z
      .string()
      .trim()
      .max(80, "Location must be at most 80 characters")
      .optional()
      .nullable(),
  
    bio: z
      .string()
      .trim()
      .max(280, "Bio must be at most 280 characters")
      .optional()
      .nullable(),
  
    avatar: z
      .string()
      .trim()
      .url("Avatar must be a valid URL")
      .optional()
      .nullable(),
  });

  export const ProfileUpdateSchema = z.object({
    displayName: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .optional(),
  
    username: z
      .string()
      .trim()
      .transform((val) => (val.startsWith("@") ? val.slice(1) : val))
      .transform((val) => val.toLowerCase())
      .refine(
        (val) => usernamePattern.test(val),
        {
          message:
            "Username must be 3 to 20 characters, lowercase letters, numbers or underscores",
        },
      )
      .optional(),
  
    bio: z
      .string()
      .trim()
      .max(280, "Bio must be at most 280 characters")
      .optional()
      .nullable(),
  
    location: z
      .string()
      .trim()
      .max(80, "Location must be at most 80 characters")
      .optional()
      .nullable(),
  
    avatarUrl: z
      .string()
      .trim()
      .url("Avatar must be a valid URL")
      .optional()
      .nullable(),
  
    website: z
      .string()
      .trim()
      .url("Website must be a valid URL")
      .optional()
      .nullable(),
  
    // adjust shape if you have something more structured
    socials: z
      .record(z.string().min(1), z.string().trim().max(200))
      .optional()
      .nullable(),
  });