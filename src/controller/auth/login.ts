import { Request, Response } from 'express';
import { auth } from '../../lib/auth';
import { z } from 'zod';
import { validate } from '../../lib/validator';
import { fromNodeHeaders } from "better-auth/node";
import { APIError } from 'better-auth';

export const login = async (req: Request, res: Response) => {
  const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const validation = validate(loginSchema, req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.errors });
  }

  const { email, password } = validation.data!;

  try {
    const response = await auth.api.signInEmail({
      headers: fromNodeHeaders(req.headers),
      asResponse: true,
      returnHeaders: true,
      body: {
        email,
        password,
      },
    });

    const session = await response.json();
    res.setHeaders(response.headers);
    res.status(response.status).json(session.user);
  } catch (error) {
    if (error instanceof APIError) {
      console.error("Sign-in error:", error.body);
      res.status(error.statusCode).json({ message: error.body?.message || "An error occurred during sign-in." });
      return;
    }
    console.error("Unexpected sign-in error:", error);
    res.status(500).json({ message: "An internal server error occurred." });
  }
};
