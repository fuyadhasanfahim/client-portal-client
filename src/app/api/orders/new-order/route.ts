import dbConfig from '@/lib/dbConfig';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
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

        await dbConfig();
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong! Try again later.',
                errorMessage: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
