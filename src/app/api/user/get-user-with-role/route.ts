import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        if (!role) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'The role is required for retrieving the data.',
                },
                {
                    status: 404,
                }
            );
        }

        await dbConfig();

        const user = await UserModel.find({ role }).sort({
            createdAt: -1,
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No user data found by this role.',
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Users are retrieved successfully.',
                data: user,
            },
            {
                status: 200,
            }
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
