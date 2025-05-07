import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        
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
