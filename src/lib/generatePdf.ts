import puppeteer, { PaperFormat } from 'puppeteer';
import path from 'path';

export const generatePdf = async (
    htmlContent: string,
    filename: string,
    isDownload: boolean
): Promise<string | Buffer> => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    const styledHtmlContent = `
        <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                body {
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>`;

    await page.setContent(styledHtmlContent, {
        waitUntil: 'networkidle0' as any,
    });

    const pdfOptions = {
        format: 'A4' as PaperFormat,
        printBackground: true,
        margin: {
            top: '15mm',
            right: '15mm',
            bottom: '15mm',
            left: '15mm',
        },
    };

    if (!isDownload) {
        const outputPath = path.join(
            process.cwd(),
            'public/documents',
            `${filename}.pdf`
        );
        await page.pdf({
            ...pdfOptions,
            path: outputPath,
        });
        await browser.close();
        return outputPath;
    }

    const pdfBuffer = await page.pdf(pdfOptions);
    await browser.close();

    return Buffer.from(pdfBuffer);
};
