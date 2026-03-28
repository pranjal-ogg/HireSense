'use strict';

const pdfParse = require('pdf-parse');

/**
 * ResumeParser — abstracts text extraction and NLP-based structured parsing.
 * Follows the Single Responsibility Principle: this class only parses, never stores.
 */
class ResumeParser {
  // ─── Keyword Dictionaries ─────────────────────────────────────────────────
  static #SKILL_KEYWORDS = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby',
    'react', 'vue', 'angular', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'dynamodb',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'github actions',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
    'html', 'css', 'sass', 'tailwindcss', 'graphql', 'rest api', 'grpc',
    'git', 'linux', 'bash', 'sql', 'nosql', 'microservices', 'ci/cd',
  ];

  static #EDUCATION_DEGREES = ['b.tech', 'b.e', 'm.tech', 'm.e', 'bca', 'mca', 'bsc', 'msc', 'phd', 'mba', 'bachelor', 'master', 'doctorate'];

  /**
   * Extracts raw text from a PDF buffer.
   * @param {Buffer} fileBuffer
   * @returns {Promise<string>}
   */
  static async extractTextFromPDF(fileBuffer) {
    const data = await pdfParse(fileBuffer);
    return data.text;
  }

  /**
   * Full parse pipeline: extract → structure → return.
   * @param {Buffer} fileBuffer
   * @returns {Promise<object>}
   */
  static async parse(fileBuffer) {
    const rawText = await ResumeParser.extractTextFromPDF(fileBuffer);
    const normalised = rawText.toLowerCase();

    return {
      rawText,
      skills: ResumeParser.#extractSkills(normalised),
      summary: ResumeParser.#extractSummary(rawText),
      contactInfo: ResumeParser.#extractContactInfo(rawText),
      experience: ResumeParser.#extractExperienceHints(rawText),
      education: ResumeParser.#extractEducationHints(normalised),
    };
  }

  // ─── Private Parsers ──────────────────────────────────────────────────────

  static #extractSkills(normalisedText) {
    return ResumeParser.#SKILL_KEYWORDS
      .filter((skill) => normalisedText.includes(skill))
      .map((name) => ({ name, level: 'intermediate', yearsOfExperience: 0 }));
  }

  static #extractSummary(rawText) {
    const summaryRegex = /(?:summary|profile|objective|about me)[:\s\n]+([^\n]{50,400})/i;
    const match = rawText.match(summaryRegex);
    return match ? match[1].trim() : null;
  }

  static #extractContactInfo(rawText) {
    const emailMatch = rawText.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
    const phoneMatch = rawText.match(/(?:\+91[\s-]?)?[6-9]\d{9}/);
    const linkedinMatch = rawText.match(/linkedin\.com\/in\/[\w-]+/i);
    const githubMatch = rawText.match(/github\.com\/[\w-]+/i);

    return {
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null,
      linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : null,
      github: githubMatch ? `https://${githubMatch[0]}` : null,
    };
  }

  static #extractExperienceHints(rawText) {
    // Lightweight heuristic: find company + duration patterns
    const lines = rawText.split('\n');
    const expLines = lines.filter((l) =>
      /\d{4}\s*[-–]\s*(\d{4}|present)/i.test(l)
    );
    return expLines.map((l) => ({ rawLine: l.trim() }));
  }

  static #extractEducationHints(normalisedText) {
    return ResumeParser.#EDUCATION_DEGREES
      .filter((deg) => normalisedText.includes(deg))
      .map((degree) => ({ degree }));
  }
}

module.exports = ResumeParser;
