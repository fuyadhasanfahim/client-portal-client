import dbConfig from '@/lib/dbConfig';
import ServiceModel from '@/models/service.model';
import { IComplexity } from '@/types/service.interface';
import { addServiceSchema } from '@/validations/add-service.schema';
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

        const result = addServiceSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed.',
                    errors: result.error.format(),
                },
                { status: 422 }
            );
        }

        await dbConfig();

        const { name, complexities } = result.data;

        const existingService = await ServiceModel.findOne({ name });

        if (complexities) {
            if (existingService) {
                const existingLabels = new Set(
                    existingService.complexities.map((c: IComplexity) =>
                        c.label.toLowerCase()
                    )
                );

                const newComplexities = complexities.filter(
                    (c) => !existingLabels.has(c.label.toLowerCase())
                );

                if (newComplexities.length === 0) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                'No new complexities to add. All already exist by label.',
                        },
                        { status: 409 }
                    );
                } else {
                    existingService.complexities.push(...newComplexities);
                    await existingService.save();

                    return NextResponse.json(
                        {
                            success: true,
                            message: `New complexities added to service "${existingService.name}".`,
                        },
                        { status: 201 }
                    );
                }
            }
        }

        await ServiceModel.create(result.data);

        return NextResponse.json(
            {
                success: true,
                message: 'Service created successfully.',
            },
            { status: 201 }
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
