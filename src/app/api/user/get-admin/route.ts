import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConfig();

        const admin = await UserModel.findOne({ role: 'SuperAdmin' });

        return NextResponse.json(
            {
                success: true,
                data: admin,
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
