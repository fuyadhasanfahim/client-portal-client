import dbConfig from '@/lib/dbConfig';
import ServiceModel from '@/models/service.model';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.nextUrl);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const quantity = parseInt(searchParams.get('quantity') || '10', 10);
        const searchQuery = searchParams.get('searchQuery') || '';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = {};

        if (searchQuery) {
            filter.name = { $regex: searchQuery, $options: 'i' };
        }

        const skip = (page - 1) * quantity;

        await dbConfig();

        const servicesData = await ServiceModel.find(filter)
            .skip(skip)
            .limit(quantity)
            .sort({
                createdAt: -1,
            });

        if (!servicesData) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No service data found!',
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: servicesData,
                pagination: {
                    totalItems: servicesData.length,
                    page,
                    quantity,
                    totalPages: Math.ceil(servicesData.length / quantity),
                },
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
            { status: 500 }
        );
    }
}
