import ServiceModel from '@/models/service.model';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
    try {
        const { id, data } = await req.json();

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'The id for the service is required for deleting it.',
                },
                {
                    status: 400,
                }
            );
        }

        await ServiceModel.findByIdAndUpdate({ _id: id }, data);

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully updated the service.',
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
