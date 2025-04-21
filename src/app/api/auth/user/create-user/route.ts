import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
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

        if (
            !name ||
            !email ||
            !phone ||
            !country ||
            !password ||
            !provider ||
            !username
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Please fill all the required fields.',
                },
                { status: 400 }
            );
        }

        const userData = await UserModel.findOne({ email });

        if (userData) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User already exists.',
                },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await UserModel.create({
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
                message: 'An error occurred while creating the user.',
                error,
            },
            { status: 500 }
        );
    }
}
