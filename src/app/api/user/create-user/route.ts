import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import UserIdModel from '@/models/userid.model';
import SignupSchema from '@/validations/sign-up.schema';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        await dbConfig();

        const body = await req.json();
        if (!body) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No data provided.',
                },
                { status: 400 }
            );
        }

        const parsedData = SignupSchema.parse(body);
        const {
            name,
            email,
            phone,
            company,
            country,
            password,
            provider,
            username,
        } = parsedData;

        const userData = await UserModel.findOne({ email });

        const existingUsername = await UserModel.findOne({ username });
        if (existingUsername) {
            return NextResponse.json(
                { success: false, message: 'Username already taken.' },
                { status: 400 }
            );
        }

        if (userData) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User already exists.',
                },
                { status: 400 }
            );
        }

        const userId = await UserIdModel.findOneAndUpdate(
            { id: 'userId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await UserModel.create({
            userId: userId.seq,
            name,
            email,
            phone,
            company,
            country,
            provider,
            username,
            password: hashedPassword,
        });

        if (!newUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to create user.',
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'User created successfully.',
            },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong! Try again later.',
                errorMessage: (error as Error).message,
            },
            {
                status: 500,
            }
        );
    }
}
