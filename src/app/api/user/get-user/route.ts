import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.nextUrl);
        const userID = searchParams.get('user_id');

        if (!userID) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User ID is required.',
                },
                {
                    status: 400,
                }
            );
        }

        await dbConfig();

        const user = await UserModel.findOne({ userID });

        return NextResponse.json(
            {
                success: true,
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
