import React from 'react';
import { format } from 'date-fns';
import { IOrder } from '@/types/order.interface';
import { cn } from '@/lib/utils';

export default function OrdersPDFTemplate({ orders }: { orders: IOrder[] }) {
    const orderChunks = [];
    for (let i = 0; i < orders.length; i += 15) {
        orderChunks.push(orders.slice(i, i + 15));
    }

    return (
        <div className="document-container">
            {orderChunks.map((chunk, pageIndex) => (
                <div key={pageIndex} className="page">
                    <header className="header">
                        <h1>Order Summary</h1>
                        <p className="report-date">
                            Generated on: {format(new Date(), 'PPP')}
                        </p>
                    </header>

                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Services</th>
                                <th>Images</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chunk.map((order) => {
                                const {
                                    orderID,
                                    paymentStatus,
                                    images,
                                    services,
                                    total,
                                    createdAt,
                                } = order || {};

                                return (
                                    <tr key={orderID}>
                                        <td className="order-id">{orderID}</td>
                                        <td className="order-date">
                                            {createdAt &&
                                                format(createdAt, 'PPP')}
                                        </td>
                                        <td className="order-images">
                                            {services
                                                .map((service) => service.name)
                                                .join(', ')}
                                        </td>
                                        <td className="order-images">
                                            {images}
                                        </td>
                                        <td
                                            className={cn(
                                                'order-total',
                                                total && total < 0
                                                    ? 'negative'
                                                    : ''
                                            )}
                                        >
                                            ${total && total.toFixed(2)}
                                        </td>
                                        <td className="order-status">
                                            <span
                                                className={cn(
                                                    'status-badge',
                                                    paymentStatus
                                                )}
                                            >
                                                {paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <footer className="footer">
                        <div className="page-number">
                            Page {pageIndex + 1} of {orderChunks.length}
                        </div>
                        <div className="company-info">
                            &copy; {new Date().getFullYear()} Client Portal by
                            Webbriks LLC. All rights reserved.
                        </div>
                    </footer>
                </div>
            ))}

            <style jsx>{`
                .document-container {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    color: #333;
                    line-height: 1.5;
                }

                .page {
                    width: 210mm;
                    min-height: 297mm;
                    padding: 15mm;
                    margin: 0 auto;
                    box-sizing: border-box;
                    background: white;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
                    position: relative;
                    page-break-after: always;
                }

                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #eee;
                    padding-bottom: 15px;
                }

                .header h1 {
                    color: #2c3e50;
                    margin: 0;
                    font-size: 24px;
                }

                .report-date {
                    color: #7f8c8d;
                    font-size: 14px;
                    margin: 5px 0 0;
                }

                .orders-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }

                .orders-table th {
                    background-color: #34495e;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-weight: 500;
                }

                .orders-table td {
                    padding: 12px;
                    border-bottom: 1px solid #eee;
                    vertical-align: middle;
                }

                .orders-table tr:nth-child(even) {
                    background-color: #f9f9f9;
                }

                .order-id {
                    font-weight: bold;
                    color: #3498db;
                }

                .order-date {
                    color: #7f8c8d;
                    white-space: nowrap;
                }

                .image-grid {
                    display: flex;
                    gap: 8px;
                }

                .image-container {
                    position: relative;
                    width: 50px;
                    height: 50px;
                }

                .product-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 4px;
                    border: 1px solid #eee;
                }

                .more-items {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    font-size: 12px;
                }

                .order-total {
                    font-weight: bold;
                    color: #27ae60;
                }

                .order-total.negative {
                    color: #e74c3c;
                }

                .status-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: capitalize;
                }

                .status-badge.completed {
                    background-color: #27ae60;
                    color: white;
                }

                .status-badge.pending {
                    background-color: #f39c12;
                    color: white;
                }

                .status-badge.cancelled {
                    background-color: #e74c3c;
                    color: white;
                }

                .status-badge.processing {
                    background-color: #3498db;
                    color: white;
                }

                .footer {
                    position: absolute;
                    bottom: 15mm;
                    left: 15mm;
                    right: 15mm;
                    padding-top: 10px;
                    border-top: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #7f8c8d;
                }

                @page {
                    size: A4;
                    margin: 0;
                }
            `}</style>
        </div>
    );
}
