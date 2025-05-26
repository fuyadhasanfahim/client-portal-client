import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.nextUrl);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const quantity = parseInt(searchParams.get('quantity') || '10', 10);
        const searchQuery = searchParams.get('searchQuery')?.trim() || '';

        await dbConfig();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};
        if (searchQuery) {
            query.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { status: { $regex: searchQuery, $options: 'i' } },
                { paymentStatus: { $regex: searchQuery, $options: 'i' } },
            ];
        }

        const totalOrders = await OrderModel.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / quantity);
        const skip = (page - 1) * quantity;

        const orders = await OrderModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(quantity);

        return NextResponse.json(
            {
                success: true,
                message: 'Orders fetched successfully',
                data: orders,
                pagination: {
                    total: totalOrders,
                    page,
                    quantity,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            },
            { status: 200 }
        );
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
