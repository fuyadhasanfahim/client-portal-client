// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import { format } from 'date-fns';
// import {
//     IOrder,
// } from '@/types/order.interface';

// interface GeneratePDFOptions {
//     orders: IOrder[];
//     fileName: string;
//     type: 'single' | 'multiple';
// }

// export async function generatePDF(options: GeneratePDFOptions): Promise<void> {
//     return new Promise((resolve, reject) => {
//         try {
//             const doc = new jsPDF({
//                 orientation: 'portrait',
//                 unit: 'mm',
//                 format: 'a4',
//             });

//             doc.setProperties({
//                 title: options.fileName.replace('.pdf', ''),
//                 subject:
//                     options.type === 'single'
//                         ? 'Order Invoice'
//                         : 'Orders Summary',
//                 author: 'WebBriks LLC',
//                 creator: 'Webbriks Client Portal',
//             });

//             if (options.type === 'single' && options.orders.length > 0) {
//                 generateSingleInvoice(doc, options.orders[0]);
//             } else {
//                 generateMultipleInvoices(doc, options.orders);
//             }

//             doc.save(options.fileName);
//             resolve();
//         } catch (error) {
//             reject(error);
//         }
//     });
// }

// function addModernHeader(doc: jsPDF, title: string, subtitle?: string) {
//     const pageWidth = doc.internal.pageSize.getWidth();

//     doc.setFillColor('#00c950');
//     doc.rect(0, 0, pageWidth, 50, 'F');

//     doc.setFillColor('#15803d');
//     doc.rect(0, 45, pageWidth, 5, 'F');

//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor('#FFFFFF');
//     doc.setFontSize(28);
//     doc.text('Client Portal', 20, 30);

//     doc.setFontSize(16);
//     doc.setFont('helvetica', 'normal');
//     doc.text('by Webbriks LLC', 20, 38);

//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(20);
//     doc.text(title, pageWidth - 20, 28, { align: 'right' });

//     if (subtitle) {
//         doc.setFontSize(12);
//         doc.setFont('helvetica', 'normal');
//         doc.text(subtitle, pageWidth - 20, 36, { align: 'right' });
//     }
// }

// function addModernFooter(doc: jsPDF) {
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const footerY = pageHeight - 20;

//     doc.setFillColor("#bbf7d0");
//     doc.rect(0, footerY - 10, pageWidth, 30, 'F');

//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(9);
//     doc.setTextColor("#15803d");

//     doc.text('Thank you for choosing Webbriks LLC!', 20, footerY - 2);
//     doc.setFontSize(8);
//     doc.setTextColor('#15803d');
//     doc.text(
//         'Your trusted partner for Photo Editing services',
//         20,
//         footerY + 4
//     );

//     doc.setFontSize(8);
//     doc.text(
//         `Generated on ${format(new Date(), 'PPpp')}`,
//         pageWidth - 20,
//         footerY + 4,
//         { align: 'right' }
//     );
// }

// function generateSingleInvoice(doc: jsPDF, order: IOrder) {
//     addModernHeader(doc, `Order #${order.orderID}`, 'Invoice Details');

//     let yPos = 65;
//     const pageWidth = doc.internal.pageSize.getWidth();

//     doc.setFillColor('#bbf7d0');
//     doc.roundedRect(20, yPos, pageWidth - 40, 35, 3, 3, 'F');

//     doc.setDrawColor('#00c950');
//     doc.setLineWidth(0.5);
//     doc.roundedRect(20, yPos, pageWidth - 40, 35, 3, 3, 'S');

//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(14);
//     doc.setTextColor('#00c950');
//     doc.text('ORDER INFORMATION', 25, yPos + 8);

//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(10);
//     doc.setTextColor('#15803d');

//     const leftDetails = [
//         `Order ID: ${order.orderID}`,
//         `Created: ${order.createdAt && format(order.createdAt, 'PPpp')}`,
//         order.deliveryDate
//             ? `Delivery: ${
//                   order.deliveryDate && format(order.deliveryDate, 'PPpp')
//               }`
//             : '',
//     ];

//     const rightDetails = [
//         `Status: ${order.status}`,
//         `Payment: ${order.paymentStatus}`,
//         `Method: ${order.paymentMethod || 'N/A'}`,
//     ];

//     leftDetails.forEach((detail, index) => {
//         if (detail) doc.text(detail, 25, yPos + 16 + index * 5);
//     });

//     rightDetails.forEach((detail, index) => {
//         if (detail) doc.text(detail, pageWidth / 2 + 10, yPos + 16 + index * 5);
//     });

//     yPos += 50;

//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(16);
//     doc.setTextColor('#00c950');
//     doc.text('SERVICES & PRICING', 20, yPos);

//     yPos += 10;

//     const serviceRows: string[][] = [];
//     let serviceIndex = 1;

//     order.services.forEach((service) => {
//         const basePrice = service.price || 0;
//         const images = order.images || 0;
//         const subtotal = basePrice * images;

//         serviceRows.push([
//             `${serviceIndex}. ${service.name}`,
//             `$${basePrice.toFixed(2)}`,
//             images.toString(),
//             `$${subtotal.toFixed(2)}`,
//         ]);

//         if (service.types && service.types.length > 0) {
//             service.types.forEach((type) => {
//                 const typePrice = type.price || 0;
//                 const typeSubtotal = typePrice * images;

//                 serviceRows.push([
//                     `   ↳ ${type.name}`,
//                     `$${typePrice.toFixed(2)}`,
//                     images.toString(),
//                     `$${typeSubtotal.toFixed(2)}`,
//                 ]);

//                 if (type.complexity) {
//                     serviceRows.push([
//                         `     • Complexity: ${type.complexity.name}`,
//                         `$${type.complexity.price.toFixed(2)}`,
//                         '',
//                         `$${type.complexity.price.toFixed(2)}`,
//                     ]);
//                 }
//             });
//         }

//         if (
//             service.complexity &&
//             (!service.types || service.types.length === 0)
//         ) {
//             serviceRows.push([
//                 `   • Complexity: ${service.complexity.name}`,
//                 `$${service.complexity.price.toFixed(2)}`,
//                 '',
//                 `$${service.complexity.price.toFixed(2)}`,
//             ]);
//         }

//         serviceIndex++;
//     });

//     autoTable(doc, {
//         startY: yPos,
//         head: [['Service', 'Price/Image', 'Images', 'Subtotal']],
//         body: serviceRows,
//         theme: 'grid',
//         headStyles: {
//             fillColor: '#00c950',
//             textColor: '#FFFFFF',
//             fontStyle: 'bold',
//             fontSize: 11,
//         },
//         bodyStyles: {
//             textColor: '#15803d',
//             fontSize: 10,
//         },
//         alternateRowStyles: {
//             fillColor: "#bbf7d0",
//         },
//         columnStyles: {
//             0: { cellWidth: 80, fontStyle: 'normal' },
//             1: { cellWidth: 30, halign: 'right' },
//             2: { cellWidth: 20, halign: 'center' },
//             3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
//         },
//         margin: { left: 20, right: 20 },
//         styles: {
//             cellPadding: 4,
//             lineColor: '#000000',
//             lineWidth: 0.3,
//         },
//     });

//     yPos = (doc as any).lastAutoTable.finalY + 15;

//     let hasAdditionalInfo = false;
//     order.services.forEach((service) => {
//         if (service.options?.length || service.colorCodes?.length) {
//             if (!hasAdditionalInfo) {
//                 doc.setFont('helvetica', 'bold');
//                 doc.setFontSize(14);
//                 doc.setTextColor('#00c950');
//                 doc.text('SERVICE OPTIONS & DETAILS', 20, yPos);
//                 yPos += 8;
//                 hasAdditionalInfo = true;
//             }

//             doc.setFillColor("#bbf7d0");
//             doc.roundedRect(20, yPos, pageWidth - 40, 20, 2, 2, 'F');

//             doc.setFont('helvetica', 'bold');
//             doc.setFontSize(11);
//             doc.setTextColor('#15803d');
//             doc.text(`${service.name}:`, 25, yPos + 8);

//             doc.setFont('helvetica', 'normal');
//             doc.setFontSize(9);

//             let detailY = yPos + 8;
//             if (service.options?.length) {
//                 doc.text(
//                     `Options: ${service.options.join(', ')}`,
//                     25,
//                     detailY + 6
//                 );
//                 detailY += 6;
//             }

//             if (service.colorCodes?.length) {
//                 doc.text(
//                     `Colors: ${service.colorCodes.join(', ')}`,
//                     25,
//                     detailY + 6
//                 );
//             }

//             yPos += 25;
//         }
//     });

//     if (order.instructions) {
//         doc.setFont('helvetica', 'bold');
//         doc.setFontSize(14);
//         doc.setTextColor('#00c950');
//         doc.text('SPECIAL INSTRUCTIONS', 20, yPos);
//         yPos += 8;

//         doc.setFillColor("#bbf7d0");
//         const instructionsHeight = 25;
//         doc.roundedRect(
//             20,
//             yPos,
//             pageWidth - 40,
//             instructionsHeight,
//             2,
//             2,
//             'F'
//         );

//         doc.setFont('helvetica', 'normal');
//         doc.setFontSize(10);
//         doc.setTextColor('#15803d');
//         const splitInstructions = doc.splitTextToSize(
//             order.instructions,
//             pageWidth - 50
//         );
//         doc.text(splitInstructions, 25, yPos + 8);
//         yPos += instructionsHeight + 10;
//     }

//     const totalCardY = yPos + 10;
//     doc.setFillColor('#00c950');
//     doc.roundedRect(pageWidth - 120, totalCardY, 100, 30, 5, 5, 'F');

//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(12);
//     doc.setTextColor('#FFFFFF');
//     doc.text('TOTAL AMOUNT', pageWidth - 70, totalCardY + 12, {
//         align: 'center',
//     });

//     doc.setFontSize(20);
//     doc.text(
//         `$${order.total?.toFixed(2) || '0.00'}`,
//         pageWidth - 70,
//         totalCardY + 24,
//         { align: 'center' }
//     );

//     addModernFooter(doc);
// }

// function generateMultipleInvoices(doc: jsPDF, orders: IOrder[]) {
//     const pageWidth = doc.internal.pageSize.getWidth();

//     addModernHeader(doc, 'Orders Summary', `${orders.length} Orders`);

//     let yPos = 65;
//     const totalAmount = orders.reduce(
//         (sum, order) => sum + (order.total || 0),
//         0
//     );
//     const totalImages = orders.reduce(
//         (sum, order) => sum + (order.images || 0),
//         0
//     );

//     doc.setFillColor("#bbf7d0");
//     doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, 'F');

//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(12);
//     doc.setTextColor('#00c950');
//     doc.text('SUMMARY OVERVIEW', 25, yPos + 8);

//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(10);
//     doc.setTextColor('#15803d');
//     doc.text(`Total Orders: ${orders.length}`, 25, yPos + 16);
//     doc.text(`Total Images: ${totalImages}`, 80, yPos + 16);
//     doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 140, yPos + 16);

//     yPos += 35;

//     const tableData = orders.map((order) => {
//         const servicesSummary = order.services.map((s) => s.name).join(', ');
//         const imagesCount = order.images || 0;

//         return [
//             format(new Date(order.createdAt || new Date()), 'MMM dd, yyyy'),
//             order.orderID,
//             servicesSummary.substring(0, 30) +
//                 (servicesSummary.length > 30 ? '...' : ''),
//             imagesCount.toString(),
//             `$${order.total?.toFixed(2) || '0.00'}`,
//             getStatusDisplay(order.paymentStatus),
//             getStatusDisplay(order.status),
//         ];
//     });

//     autoTable(doc, {
//         startY: yPos,
//         head: [
//             [
//                 'Date',
//                 'Order ID',
//                 'Services',
//                 'Images',
//                 'Total',
//                 'Payment',
//                 'Status',
//             ],
//         ],
//         body: tableData,
//         theme: 'striped',
//         headStyles: {
//             fillColor: '#00c950',
//             textColor: '#FFFFFF',
//             fontStyle: 'bold',
//             fontSize: 10,
//         },
//         bodyStyles: {
//             textColor: '#000000',
//             fontSize: 9,
//         },
//         alternateRowStyles: {
//             fillColor: "#bbf7d0",
//         },
//         columnStyles: {
//             0: { cellWidth: 25, halign: 'center' },
//             1: { cellWidth: 40, halign: 'center' },
//             2: { cellWidth: 33, halign: 'left' },
//             3: { cellWidth: 18, halign: 'center' },
//             4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
//             5: { cellWidth: 21, halign: 'center' },
//             6: { cellWidth: 23, halign: 'center' },
//         },
//         margin: {
//             left: 15,
//             right: 10,
//         },
//         styles: {
//             cellPadding: 3,
//             overflow: 'linebreak',
//             lineColor: '#000000',
//             lineWidth: 0.2,
//         },
//         didDrawPage: () => {
//             addModernFooter(doc);
//         },
//     });

//     addModernFooter(doc);
// }

// function getStatusDisplay(status: string): string {
//     return status || 'N/A';
// }

