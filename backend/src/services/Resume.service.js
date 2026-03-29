'use strict';

const resumeRepository = require('../repositories/Resume.repository');
const ResumeParser = require('../utils/parser.utils');
const ApiError = require('../utils/ApiError');
const fs = require('fs');

/**
 * Resume Service
 * Handles uploading, parsing, and retrieving resumes.
 */
class ResumeService {
  async uploadAndParse(userId, file) {
    if (!file) {
      throw ApiError.badRequest('No file uploaded.');
    }

    // Create initial resume record
    const resumeData = {
      userId,
      originalFileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      parseStatus: 'processing',
    };

    let resume = await resumeRepository.create(resumeData);

    try {
      // Read file buffer for parser
      const fileBuffer = fs.readFileSync(file.path);

      // Parse the PDF
      const parsedContent = await ResumeParser.parse(fileBuffer);

      // Update resume with parsed data
      resume = await resumeRepository.updateById(resume._id, {
        rawText: parsedContent.rawText,
        parsedData: {
          skills: parsedContent.skills,
          experience: parsedContent.experience,
          education: parsedContent.education,
          summary: parsedContent.summary,
          contactInfo: parsedContent.contactInfo,
        },
        parseStatus: 'completed',
      });

      return resume;
    } catch (error) {
      // Update status to failed
      await resumeRepository.updateById(resume._id, { parseStatus: 'failed' });
      throw ApiError.internal(`Failed to parse resume: ${error.message}`);
    }
  }

  async getMyResumes(userId) {
    return await resumeRepository.findByUserId(userId);
  }
}

module.exports = new ResumeService();
