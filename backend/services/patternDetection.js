import OpenAI from "openai";

/**
 * Pattern Detection and Insights Service
 * Detects design patterns, best practices, and refactoring opportunities
 */

// Initialize OpenAI client
let openai = null;

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * Detect design patterns in code
 * @param {Object} commitData - Commit data with file changes
 * @returns {Promise<Object>} Detected patterns
 */
export async function detectDesignPatterns(commitData) {
  const client = getOpenAIClient();
  
  if (!client) {
    return detectPatternsBasic(commitData);
  }

  try {
    const codeContext = prepareCodeForPatternAnalysis(commitData);
    
    const prompt = `Analyze the following code changes and identify any design patterns being used or implemented:

${codeContext}

Identify:
1. Design patterns (e.g., Singleton, Factory, Observer, MVC, Repository, etc.)
2. Architectural patterns (e.g., Microservices, Layered, Event-driven)
3. Code organization patterns (e.g., Dependency Injection, Separation of Concerns)

Respond with JSON:
{
  "patterns": [
    {
      "name": "Pattern Name",
      "confidence": "High|Medium|Low",
      "evidence": "Brief explanation of where/how it's used",
      "category": "Creational|Structural|Behavioral|Architectural"
    }
  ]
}`;

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert software architect specializing in design pattern recognition.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    const responseText = completion.choices[0].message.content;
    
    try {
      const result = JSON.parse(responseText);
      return {
        patterns: result.patterns || [],
        aiPowered: true,
      };
    } catch (parseError) {
      return detectPatternsBasic(commitData);
    }
  } catch (error) {
    console.error("Error in AI pattern detection:", error.message);
    return detectPatternsBasic(commitData);
  }
}

/**
 * Identify best practices in code
 * @param {Object} commitData - Commit data with file changes
 * @returns {Promise<Object>} Best practices identified
 */
export async function identifyBestPractices(commitData) {
  const client = getOpenAIClient();
  
  if (!client) {
    return identifyBestPracticesBasic(commitData);
  }

  try {
    const codeContext = prepareCodeForPatternAnalysis(commitData);
    
    const prompt = `Analyze the following code changes and identify best practices being followed:

${codeContext}

Identify best practices in:
1. Code organization and structure
2. Error handling
3. Testing
4. Documentation
5. Security
6. Performance
7. Maintainability

Respond with JSON:
{
  "bestPractices": [
    {
      "practice": "Practice name",
      "category": "Category",
      "description": "How it's implemented",
      "impact": "High|Medium|Low"
    }
  ]
}`;

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert code reviewer focusing on software engineering best practices.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    const responseText = completion.choices[0].message.content;
    
    try {
      const result = JSON.parse(responseText);
      return {
        bestPractices: result.bestPractices || [],
        aiPowered: true,
      };
    } catch (parseError) {
      return identifyBestPracticesBasic(commitData);
    }
  } catch (error) {
    console.error("Error in AI best practices identification:", error.message);
    return identifyBestPracticesBasic(commitData);
  }
}

/**
 * Generate refactoring opportunities
 * @param {Object} commitData - Commit data with file changes
 * @returns {Promise<Object>} Refactoring suggestions
 */
export async function generateRefactoringOpportunities(commitData) {
  const client = getOpenAIClient();
  
  if (!client) {
    return generateRefactoringBasic(commitData);
  }

  try {
    const codeContext = prepareCodeForPatternAnalysis(commitData);
    
    const prompt = `Analyze the following code changes and suggest refactoring opportunities:

${codeContext}

Suggest refactoring for:
1. Code duplication (DRY principle)
2. Long methods or functions
3. Complex conditionals
4. Poor naming
5. Tight coupling
6. Missing abstractions

Respond with JSON:
{
  "opportunities": [
    {
      "type": "Refactoring type",
      "priority": "High|Medium|Low",
      "description": "What to refactor",
      "benefit": "Expected improvement",
      "effort": "Low|Medium|High"
    }
  ]
}`;

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert in code refactoring and clean code principles.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    const responseText = completion.choices[0].message.content;
    
    try {
      const result = JSON.parse(responseText);
      return {
        opportunities: result.opportunities || [],
        aiPowered: true,
      };
    } catch (parseError) {
      return generateRefactoringBasic(commitData);
    }
  } catch (error) {
    console.error("Error in AI refactoring suggestions:", error.message);
    return generateRefactoringBasic(commitData);
  }
}

/**
 * Prepare code context for pattern analysis
 * @param {Object} commitData - Commit data
 * @returns {string} Formatted code context
 */
function prepareCodeForPatternAnalysis(commitData) {
  let context = `Commit: ${commitData.message}\n`;
  context += `Files changed: ${commitData.files.length}\n\n`;
  
  // Include file structure and key changes
  for (const file of commitData.files.slice(0, 5)) {
    context += `File: ${file.filename} (${file.status})\n`;
    context += `Changes: +${file.additions} -${file.deletions}\n`;
    
    if (file.patch) {
      // Extract key parts of the patch
      const patchLines = file.patch.split("\n").slice(0, 30);
      context += patchLines.join("\n") + "\n\n";
    }
  }
  
  return context.substring(0, 6000); // Limit size
}

/**
 * Basic pattern detection without AI
 * @param {Object} commitData - Commit data
 * @returns {Object} Detected patterns
 */
function detectPatternsBasic(commitData) {
  const patterns = [];
  const files = commitData.files || [];
  
  // Detect common patterns from file structure and names
  const fileNames = files.map((f) => f.filename.toLowerCase());
  const fileContent = files.map((f) => f.patch || "").join("\n").toLowerCase();
  
  // MVC Pattern
  if (
    fileNames.some((f) => f.includes("controller")) &&
    fileNames.some((f) => f.includes("model")) &&
    fileNames.some((f) => f.includes("view"))
  ) {
    patterns.push({
      name: "MVC (Model-View-Controller)",
      confidence: "High",
      evidence: "Separate controller, model, and view files detected",
      category: "Architectural",
    });
  }
  
  // Repository Pattern
  if (fileNames.some((f) => f.includes("repository") || f.includes("repo"))) {
    patterns.push({
      name: "Repository Pattern",
      confidence: "Medium",
      evidence: "Repository files detected for data access abstraction",
      category: "Structural",
    });
  }
  
  // Service Layer Pattern
  if (fileNames.some((f) => f.includes("service"))) {
    patterns.push({
      name: "Service Layer Pattern",
      confidence: "Medium",
      evidence: "Service files detected for business logic separation",
      category: "Architectural",
    });
  }
  
  // Factory Pattern
  if (fileContent.includes("factory") || fileContent.includes("create")) {
    patterns.push({
      name: "Factory Pattern",
      confidence: "Low",
      evidence: "Factory-related code detected",
      category: "Creational",
    });
  }
  
  // Singleton Pattern
  if (fileContent.includes("singleton") || fileContent.includes("getinstance")) {
    patterns.push({
      name: "Singleton Pattern",
      confidence: "Low",
      evidence: "Singleton-related code detected",
      category: "Creational",
    });
  }
  
  // Middleware Pattern
  if (fileNames.some((f) => f.includes("middleware")) || fileContent.includes("middleware")) {
    patterns.push({
      name: "Middleware Pattern",
      confidence: "Medium",
      evidence: "Middleware implementation detected",
      category: "Behavioral",
    });
  }
  
  // Dependency Injection
  if (fileContent.includes("inject") || fileContent.includes("dependency")) {
    patterns.push({
      name: "Dependency Injection",
      confidence: "Low",
      evidence: "Dependency injection indicators found",
      category: "Structural",
    });
  }
  
  return {
    patterns,
    aiPowered: false,
  };
}

/**
 * Basic best practices identification without AI
 * @param {Object} commitData - Commit data
 * @returns {Object} Best practices
 */
function identifyBestPracticesBasic(commitData) {
  const bestPractices = [];
  const files = commitData.files || [];
  const fileNames = files.map((f) => f.filename.toLowerCase());
  const fileContent = files.map((f) => f.patch || "").join("\n").toLowerCase();
  
  // Test files
  if (
    fileNames.some(
      (f) => f.includes("test") || f.includes("spec") || f.includes("__tests__")
    )
  ) {
    bestPractices.push({
      practice: "Test Coverage",
      category: "Testing",
      description: "Includes test files for code validation",
      impact: "High",
    });
  }
  
  // Error handling
  if (fileContent.includes("try") && fileContent.includes("catch")) {
    bestPractices.push({
      practice: "Error Handling",
      category: "Reliability",
      description: "Implements try-catch blocks for error management",
      impact: "High",
    });
  }
  
  // Documentation
  if (fileContent.includes("/**") || fileContent.includes("///")) {
    bestPractices.push({
      practice: "Code Documentation",
      category: "Maintainability",
      description: "Includes JSDoc or similar documentation comments",
      impact: "Medium",
    });
  }
  
  // Type safety
  if (
    fileNames.some((f) => f.endsWith(".ts") || f.endsWith(".tsx")) ||
    fileContent.includes("interface") ||
    fileContent.includes("type ")
  ) {
    bestPractices.push({
      practice: "Type Safety",
      category: "Code Quality",
      description: "Uses TypeScript or type definitions",
      impact: "High",
    });
  }
  
  // Modular structure
  if (files.length <= 5 && files.length > 0) {
    bestPractices.push({
      practice: "Focused Commits",
      category: "Version Control",
      description: "Commit affects a reasonable number of files",
      impact: "Medium",
    });
  }
  
  // Validation
  if (fileContent.includes("validate") || fileContent.includes("validation")) {
    bestPractices.push({
      practice: "Input Validation",
      category: "Security",
      description: "Implements input validation logic",
      impact: "High",
    });
  }
  
  // Async/await
  if (fileContent.includes("async") && fileContent.includes("await")) {
    bestPractices.push({
      practice: "Modern Async Patterns",
      category: "Code Quality",
      description: "Uses async/await for asynchronous operations",
      impact: "Medium",
    });
  }
  
  return {
    bestPractices,
    aiPowered: false,
  };
}

/**
 * Basic refactoring suggestions without AI
 * @param {Object} commitData - Commit data
 * @returns {Object} Refactoring opportunities
 */
function generateRefactoringBasic(commitData) {
  const opportunities = [];
  const files = commitData.files || [];
  const stats = commitData.stats || {};
  
  // Large commit
  if (stats.additions + stats.deletions > 500) {
    opportunities.push({
      type: "Commit Size",
      priority: "Medium",
      description: "Consider breaking large commits into smaller, focused changes",
      benefit: "Easier code review and better version control",
      effort: "Low",
    });
  }
  
  // Many files changed
  if (files.length > 10) {
    opportunities.push({
      type: "Scope Reduction",
      priority: "Medium",
      description: "Commit affects many files - consider splitting by feature or module",
      benefit: "Improved traceability and easier rollback",
      effort: "Low",
    });
  }
  
  // Check for test files
  const hasTests = files.some(
    (f) =>
      f.filename.includes("test") ||
      f.filename.includes("spec") ||
      f.filename.includes("__tests__")
  );
  
  if (!hasTests && files.length > 0) {
    opportunities.push({
      type: "Test Coverage",
      priority: "High",
      description: "Add unit tests for the implemented functionality",
      benefit: "Improved code reliability and easier refactoring",
      effort: "Medium",
    });
  }
  
  // Check for documentation
  const fileContent = files.map((f) => f.patch || "").join("\n");
  const hasDocumentation = fileContent.includes("/**") || fileContent.includes("///");
  
  if (!hasDocumentation) {
    opportunities.push({
      type: "Documentation",
      priority: "Medium",
      description: "Add JSDoc or inline comments for complex logic",
      benefit: "Better code understanding and maintainability",
      effort: "Low",
    });
  }
  
  // Check for code duplication indicators
  const additions = stats.additions || 0;
  if (additions > 200) {
    opportunities.push({
      type: "Code Duplication",
      priority: "Low",
      description: "Review for potential code duplication and extract common patterns",
      benefit: "Reduced maintenance burden and improved consistency",
      effort: "Medium",
    });
  }
  
  return {
    opportunities,
    aiPowered: false,
  };
}

/**
 * Generate comprehensive insights combining all analyses
 * @param {Object} commitData - Commit data with analysis
 * @returns {Promise<Object>} Comprehensive insights
 */
export async function generateComprehensiveInsights(commitData) {
  try {
    const [patterns, bestPractices, refactoring] = await Promise.all([
      detectDesignPatterns(commitData),
      identifyBestPractices(commitData),
      generateRefactoringOpportunities(commitData),
    ]);

    return {
      patterns: patterns.patterns || [],
      bestPractices: bestPractices.bestPractices || [],
      refactoringOpportunities: refactoring.opportunities || [],
      aiPowered: patterns.aiPowered || bestPractices.aiPowered || refactoring.aiPowered,
      summary: generateInsightsSummary(patterns, bestPractices, refactoring),
    };
  } catch (error) {
    console.error("Error generating comprehensive insights:", error.message);
    throw error;
  }
}

/**
 * Generate summary of insights
 * @param {Object} patterns - Pattern detection results
 * @param {Object} bestPractices - Best practices results
 * @param {Object} refactoring - Refactoring opportunities
 * @returns {string} Summary text
 */
function generateInsightsSummary(patterns, bestPractices, refactoring) {
  const patternCount = patterns.patterns?.length || 0;
  const practiceCount = bestPractices.bestPractices?.length || 0;
  const refactoringCount = refactoring.opportunities?.length || 0;
  
  let summary = "";
  
  if (patternCount > 0) {
    summary += `Detected ${patternCount} design pattern(s). `;
  }
  
  if (practiceCount > 0) {
    summary += `Following ${practiceCount} best practice(s). `;
  }
  
  if (refactoringCount > 0) {
    summary += `${refactoringCount} refactoring opportunity(ies) identified.`;
  }
  
  if (!summary) {
    summary = "Basic code structure detected. Consider adding tests and documentation.";
  }
  
  return summary.trim();
}
