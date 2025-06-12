import SocketHandler from '@/socketio/socket';
import { NextApiRequest } from 'next';
import type { NextApiResponseServerIO } from '@/socketio/socket';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextApiRequest, res: NextApiResponseServerIO) {
    try {
        SocketHandler(req, res);
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
