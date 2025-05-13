import dbConfig from '@/lib/dbConfig';
import ServiceModel from '@/models/service.model';
import UserModel from '@/models/user.model';
import IService from '@/types/service.interface';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User id is required for the services.',
                },
                {
                    status: 404,
                }
            );
        }

        await dbConfig();

        const user = await UserModel.findOne({ userId });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User id not found.',
                },
                {
                    status: 404,
                }
            );
        }

        const services = (await ServiceModel.find().sort({
            createdAt: -1,
        })) as IService[];

        if (!services || services.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No services are available now.',
                },
                {
                    status: 404,
                }
            );
        }

        const filteredServices = services.filter((service: IService) => {
            if (service.status !== 'Active') {
                return false;
            }
            if (service.accessibleTo === 'All') {
                return true;
            }
            return service.accessList?.some((list: string) => list === userId);
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Services fetched successfully.',
                data: filteredServices,
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
