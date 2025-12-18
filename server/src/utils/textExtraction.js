import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs/promises';

/**
 * Text extraction utilities for medical reports
 * Supports PDF, images (with OCR), and plain text
 */

/**
 * Extract text from PDF file
 * @param filePath - Path to PDF file
 * @returns Extracted text
 */
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

/**
 * Extract text from image using OCR (Tesseract.js)
 * @param filePath - Path to image file
 * @returns Extracted text
 */
export async function extractTextFromImage(filePath) {
    try {
        // Preprocess image for better OCR results
        const imageBuffer = await fs.readFile(filePath);
        const processedImage = await sharp(imageBuffer)
            .greyscale()
            .normalize()
            .sharpen()
            .toBuffer();

        // Perform OCR
        const { data } = await Tesseract.recognize(processedImage, 'eng', {
            logger: (m) => {
                // Optional: log OCR progress
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

/**
 * Extract text from plain text file
 * @param filePath - Path to text file
 * @returns Extracted text
 */
export async function extractTextFromFile(filePath) {
    try {
        const text = await fs.readFile(filePath, 'utf-8');
        return text;
    } catch (error) {
        console.error('Text file reading error:', error);
        throw new Error('Failed to read text file');
    }
}

/**
 * Main extraction function that routes based on file type
 * @param filePath - Path to file
 * @param fileType - Type of file (pdf, image, text)
 * @returns Extracted text
 */
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

// Export as default for backward compatibility
export { extractTextFromReport as extractText };
