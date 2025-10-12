import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
    res.status(200).json({ status: 'health check : ok' });
};

// Export package controllers
export * from './package';