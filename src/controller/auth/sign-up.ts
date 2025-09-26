import { Request, Response } from 'express';
import { auth } from '../../lib/auth';
import { z } from 'zod';
import { validate } from '../../lib/validator';

export const signUp = async (req: Request, res: Response) => {
    const signUpSchema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    });

    const validation = validate(signUpSchema, req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.errors });
    }

    const userData = validation.data;

    if (!userData) {
        return res.status(400).json({ errors: validation.errors });
    }

    const newUser = await auth.api.createUser({
        body: {
            email: userData.email,
            password: userData.password,
            name: userData.name,
            role: 'user', 
        },
    });


    res.status(200).json({ message: "User data is valid", user: newUser });
};