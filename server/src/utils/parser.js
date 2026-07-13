import { createRequire } from 'module';
import mammoth from 'mammoth';
import path from 'path';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Extracts plain text from a document buffer based on mimetype and extension.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - Mimetype of the file
 * @param {string} fileName - Original file name for fallback extension check
 * @returns {Promise<string>} Plain text content
 */
export const extractTextFromBuffer = async (buffer, mimetype, fileName = '') => {
  const ext = fileName ? path.extname(fileName).toLowerCase() : '';

  if (mimetype === 'application/pdf' || ext === '.pdf') {
    try {
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF document. Please ensure it is not corrupted or scanned image only.');
    }
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    ext === '.docx' ||
    ext === '.doc'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error('Failed to parse Word document. Please ensure it is not corrupted.');
    }
  } else if (mimetype === 'text/plain' || ext === '.txt') {
    return buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or Word (.docx, .doc) file.');
  }
};
