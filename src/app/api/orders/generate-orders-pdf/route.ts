import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import OrdersPDFTemplate from '@/components/templates/OrdersPDFTemplate';
import { generatePdfFromReact } from '@/actions/generatePdf';
import { IOrder } from '@/types/order.interface';

export async function POST(req: NextRequest) {
    try {
        const { orders }: { orders: IOrder[] } = await req.json();

        if (!orders || !Array.isArray(orders)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No valid orders array provided.',
                },
                {
                    status: 400,
                }
            );
        }

        const component = React.createElement(OrdersPDFTemplate, { orders });

        const pdfBuffer = await generatePdfFromReact(component);

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition':
                    'attachment; filename=orders-summary.pdf',
            },
        });
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong while generating the PDF.',
                errorMessage:
                    error instanceof Error ? error.message : 'Unknown error',
            },
            {
                status: 500,
            }
        );
    }
}
