import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs/promises';
import https from 'https';
import http from 'http';

/**
 * Fetch a file from a URL and return it as a Buffer
 * Used for Cloudinary-hosted files
 */
async function fetchBufferFromUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

/**
 * Read file bytes — supports both local path and remote URL
 */
async function readFileBytes(fileSource) {
    if (fileSource.startsWith('http://') || fileSource.startsWith('https://')) {
        return fetchBufferFromUrl(fileSource);
    }
    return fs.readFile(fileSource);
}

export async function extractTextFromPDF(fileSource) {
    try {
        const dataBuffer = await readFileBytes(fileSource);
        const data = await pdfParse(dataBuffer);
        return data.text || '';
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

export async function extractTextFromImage(fileSource) {
    try {
        const imageBuffer = await readFileBytes(fileSource);
        const processedImage = await sharp(imageBuffer)
            .greyscale()
            .normalize()
            .sharpen()
            .toBuffer();

        const { data } = await Tesseract.recognize(processedImage, 'eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
            },
        });

        return data.text || '';
    } catch (error) {
        console.error('OCR extraction error:', error);
        throw new Error('Failed to extract text from image');
    }
}

export async function extractTextFromFile(fileSource) {
    try {
        if (fileSource.startsWith('http://') || fileSource.startsWith('https://')) {
            const buffer = await fetchBufferFromUrl(fileSource);
            return buffer.toString('utf-8');
        }
        const text = await fs.readFile(fileSource, 'utf-8');
        return text;
    } catch (error) {
        console.error('Text file reading error:', error);
        throw new Error('Failed to read text file');
    }
}

export async function extractTextFromReport(fileSource, fileType) {
    switch (fileType.toLowerCase()) {
        case 'pdf':
            return await extractTextFromPDF(fileSource);
        case 'image':
        case 'jpg':
        case 'jpeg':
        case 'png':
            return await extractTextFromImage(fileSource);
        case 'text':
        case 'txt':
            return await extractTextFromFile(fileSource);
        default:
            throw new Error(`Unsupported file type: ${fileType}`);
    }
}

export { extractTextFromReport as extractText };
