'use client';

import QuoteDetailsStatus from './QuoteDetailsStatus';
import QuoteDetailsSummary from './QuoteDetailsSummary';
import QuoteDetailsServiceList from './QuoteDetailsServiceList';
import QuoteDetailsPaymentAndDetails from './QuoteDetailsPaymentAndDetails';
import QuoteDetailsInvoice from './QuoteDetailsInvoice';
import getLoggedInUser from '@/utils/getLoggedInUser';
import React from 'react';
import { IQuote } from '@/types/quote.interface';

export default function QuoteDetailsCard({
    quote,
    setIsSubmitting,
}: {
    quote: IQuote;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const { user } = getLoggedInUser();
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-6">
            <div className="col-span-2 space-y-6">
                <QuoteDetailsStatus status={quote.status} role={user.role} />
                <QuoteDetailsSummary quote={quote} />
                <QuoteDetailsServiceList
                    backgroundOption={quote.details?.backgroundOption}
                    height={quote.details?.height}
                    imageResizing={
                        quote.details?.imageResizing === true ? 'yes' : 'no'
                    }
                    images={quote.details?.images}
                    instructions={quote.details?.instructions}
                    backgroundColor={quote.details?.backgroundColor}
                    returnFileFormat={quote.details?.returnFileFormat}
                    services={quote.services}
                    width={quote.details?.width}
                    downloadLink={quote.details?.downloadLink}
                />
            </div>

            <div className="space-y-6">
                {((user.role === 'user' && quote.status === 'delivered') ||
                    (user.role === 'admin' &&
                        quote.status !== 'delivered')) && (
                    <QuoteDetailsPaymentAndDetails
                        role={user.role}
                        quoteID={quote.quoteID}
                        status={quote.status}
                        setIsSubmitting={setIsSubmitting}
                    />
                )}

                <QuoteDetailsInvoice quote={quote} user={user} />
            </div>
        </div>
    );
}
