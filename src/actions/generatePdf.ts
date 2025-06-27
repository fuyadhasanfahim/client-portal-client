'use server';

import { ReactElement } from 'react';
import puppeteer from 'puppeteer';

export const generatePdfFromReact = async (component: ReactElement) => {
    const { renderToString } = await import('react-dom/server');

    const html = renderToString(component);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setContent(html, {
        waitUntil: 'networkidle0',
    });

    const pdfOptions = {
        format: 'A4' as import('puppeteer').PaperFormat,
        printBackground: true,
        margin: {
            top: '15mm',
            right: '15mm',
            bottom: '15mm',
            left: '15mm',
        },
    };

    const pdfBuffer = await page.pdf(pdfOptions);
    await browser.close();

    return pdfBuffer;
};
