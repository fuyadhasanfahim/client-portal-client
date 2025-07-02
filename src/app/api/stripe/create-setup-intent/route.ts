import dbConfig from '@/lib/dbConfig';
import { stripe } from '@/lib/stripe';
import UserModel from '@/models/user.model';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { userID, orderID } = await req.json();

        if (!userID || !orderID) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Order ID and User ID required.',
                },
                {
                    status: 400,
                }
            );
        }

        await dbConfig();

        const user = await UserModel.findOne({ userID });

        let customerId = user?.stripeCustomerId;
        let customer;

        if (customerId) {
            customer = await stripe.customers.retrieve(customerId);
        } else {
            customer = await stripe.customers.create({
                metadata: { userID, orderID },
            });

            customerId = customer.id;

            if (user) {
                user.stripeCustomerId = customerId;
                await user.save();
            }
        }

        const setupIntent = await stripe.setupIntents.create({
            customer: customerId,
            usage: 'off_session',
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    client_secret: setupIntent.client_secret,
                    customer_id: customerId,
                },
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log((error as Error).message);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error.',
                errorMessage: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
