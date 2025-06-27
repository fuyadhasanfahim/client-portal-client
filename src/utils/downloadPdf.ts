import { IOrder } from '@/types/order.interface';
import axios from 'axios';
import toast from 'react-hot-toast';

export const downloadOrdersPdf = async (orders: IOrder[]) => {
    try {
        const pdfPromise = axios.post(
            '/api/orders/generate-orders-pdf',
            { orders },
            {
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        toast.promise(pdfPromise, {
            loading: 'Generating PDF...',
            success: 'PDF downloaded successfully!',
            error: 'Failed to generate PDF',
        });

        const response = await axios.post(
            '/api/orders/generate-orders-pdf',
            { orders },
            {
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        toast.dismiss('pdf-generation');

        if (response.status === 200) {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `orders-summary-${new Date()
                .toISOString()
                .slice(0, 10)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('PDF downloaded successfully!');
        }
    } catch (error) {
        toast.dismiss('pdf-generation');
        toast.error('Failed to generate PDF');
        console.error('Download error:', error);
    }
};
