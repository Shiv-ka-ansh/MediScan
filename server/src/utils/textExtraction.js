import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
/**
 * Extract text from a PDF buffer.
 * @param {Buffer} buffer - The raw PDF file bytes
 */
export async function extractTextFromPDF(buffer) {
    try {
        if (!buffer || buffer.length === 0) {
            throw new Error('PDF buffer is empty.');
        }

        // Quick sanity check: a PDF should start with %PDF
        const header = buffer.slice(0, 5).toString('ascii');
        if (!header.startsWith('%PDF')) {
            console.warn(
                `[extractTextFromPDF] Buffer does not start with %PDF. ` +
                `First 50 bytes: ${buffer.slice(0, 50).toString('utf-8')}`
            );
        }

        console.log(`[extractTextFromPDF] Parsing ${buffer.length} bytes...`);
        const data = await pdfParse(buffer);
        return data.text || '';
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF: ' + error.message);
    }
}

/**
 * Extract text from an image buffer using OCR.
 * @param {Buffer} buffer - The raw image file bytes
 */
export async function extractTextFromImage(buffer) {
    try {
        if (!buffer || buffer.length === 0) {
            throw new Error('Image buffer is empty.');
        }

        const processedImage = await sharp(buffer)
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

/**
 * Extract text from a plain-text file buffer.
 * @param {Buffer} buffer - The raw text file bytes
 */
export async function extractTextFromFile(buffer) {
    try {
        if (!buffer || buffer.length === 0) {
            throw new Error('Text file buffer is empty.');
        }
        return buffer.toString('utf-8');
    } catch (error) {
        console.error('Text file reading error:', error);
        throw new Error('Failed to read text file');
    }
}

/**
 * Route to the correct extractor based on file type.
 * @param {Buffer} buffer   - The raw file bytes (from multer memoryStorage)
 * @param {string} fileType - One of: pdf, image, jpg, jpeg, png, text, txt
 */
export async function extractTextFromReport(buffer, fileType) {
    switch (fileType.toLowerCase()) {
        case 'pdf':
            return await extractTextFromPDF(buffer);
        case 'image':
        case 'jpg':
        case 'jpeg':
        case 'png':
            return await extractTextFromImage(buffer);
        case 'text':
        case 'txt':
            return await extractTextFromFile(buffer);
        default:
            throw new Error(`Unsupported file type: ${fileType}`);
    }
}

export { extractTextFromReport as extractText };
