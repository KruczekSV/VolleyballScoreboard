import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function register(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { login, password, role } = req.body;

  if (!login || !password || !role) {
    return res.status(400).json({ message: 'Missing login, password or role' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        login,
        password: hashedPassword,
        role,
      },
    });

    return res.status(201).json({ message: 'User created', user: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
