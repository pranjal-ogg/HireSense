'use strict';

/**
 * Suggestion Engine
 * Rule-based engine designed to evaluate parsed resume data and generate actionable
 * suggestions to improve the candidate's profile.
 * 
 * Designed to be easily extensible: just add a new private rule method and push it to `this.rules`.
 */
class SuggestionEngine {
  constructor() {
    // Array of rule functions. Each evaluates the resume and returns a string (or null if passed).
    this.rules = [
      this.#checkProjects,
      this.#checkTools,
      this.#checkExperience,
      this.#checkAchievements,
    ];
  }

  /**
   * Generates a list of improvement suggestions for a given resume.
   * @param {Object} resumeData - Structured JSON from ResumeParser
   * @returns {Array<String>} Array of actionable suggestions
   */
  generateSuggestions(resumeData) {
    const suggestions = [];
    
    for (const rule of this.rules) {
      const suggestion = rule.call(this, resumeData); // Preserve 'this' context if needed
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    if (suggestions.length === 0) {
      suggestions.push('Your resume looks excellent! No critical improvements needed.');
    }

    return suggestions;
  }

  // ─── Rule Definitions ───────────────────────────────────────────────────

  /**
   * Rule: If no projects → suggest adding projects
   */
  #checkProjects(resumeData) {
    const rawText = (resumeData.rawText || '').toLowerCase();
    const hasProjectsSection = rawText.includes('project') || rawText.includes('portfolio');
    
    // If we eventually add structured projects to the parser, we would check resumeData.projects.length too
    if (!hasProjectsSection) {
      return 'No projects detected. Adding personal, academic, or open-source projects significantly boosts your profile.';
    }
    return null;
  }

  /**
   * Rule: If no Git/tools → suggest adding tools
   */
  #checkTools(resumeData) {
    const coreTools = ['git', 'github', 'gitlab', 'docker', 'aws', 'linux', 'jira', 'ci/cd'];
    const candidateSkills = (resumeData.skills || []).map((s) => s.name.toLowerCase());
    
    const hasTools = coreTools.some((tool) => candidateSkills.includes(tool));

    if (!hasTools) {
      return 'Your resume is missing standard industry tools (e.g., Git, Docker, Cloud Platforms). Add them to your skills section if you know them.';
    }
    return null;
  }

  /**
   * Rule: If weak experience → suggest internships
   */
  #checkExperience(resumeData) {
    const exp = resumeData.experience || [];
    
    if (exp.length === 0) {
      return 'Your experience section is empty. Consider applying for internships or adding freelance/volunteer work to build history.';
    }

    // Check if the experience descriptions are too brief
    const isWeak = exp.every((job) => !job.description || job.description.length < 50);
    if (isWeak) {
      return 'Your experience descriptions are very brief. Expand on your responsibilities and daily tasks.';
    }

    return null;
  }

  /**
   * Rule: If no measurable achievements → suggest adding metrics
   */
  #checkAchievements(resumeData) {
    const exp = resumeData.experience || [];
    
    // Check if any experience description contains numbers/percentages
    const metricRegex = /\d+(%|k|m)?/i; 
    let hasMetrics = false;

    for (const job of exp) {
      if (job.description && metricRegex.test(job.description)) {
        hasMetrics = true;
        break;
      }
      // Fallback: check raw lines parsed from experience block
      if (job.rawLine && metricRegex.test(job.rawLine)) {
        hasMetrics = true;
        break;
      }
    }

    if (!hasMetrics && exp.length > 0) {
      return 'Your experience lacks measurable achievements. Use numbers to quantify your impact (e.g., "Increased performance by 20%", "Managed team of 5").';
    }

    return null;
  }
}

module.exports = new SuggestionEngine();
