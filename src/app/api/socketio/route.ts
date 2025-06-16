import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiResponseServerIO } from '@/lib/socket';
import SocketHandler from '@/lib/socket';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    return SocketHandler(req, res as NextApiResponseServerIO);
}
