import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs/promises';

export async function extractTextFromPDF(filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text || '';
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

export async function extractTextFromImage(filePath) {
    try {
        const imageBuffer = await fs.readFile(filePath);
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

export async function extractTextFromFile(filePath) {
    try {
        const text = await fs.readFile(filePath, 'utf-8');
        return text;
    } catch (error) {
        console.error('Text file reading error:', error);
        throw new Error('Failed to read text file');
    }
}

export async function extractTextFromReport(
    filePath,
    fileType
) {
    switch (fileType.toLowerCase()) {
        case 'pdf':
            return await extractTextFromPDF(filePath);
        case 'image':
        case 'jpg':
        case 'jpeg':
        case 'png':
            return await extractTextFromImage(filePath);
        case 'text':
        case 'txt':
            return await extractTextFromFile(filePath);
        default:
            throw new Error(`Unsupported file type: ${fileType}`);
    }
}

export { extractTextFromReport as extractText };
