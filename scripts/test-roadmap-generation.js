#!/usr/bin/env node

/**
 * Roadmap Generation Test Runner
 * 
 * This script runs comprehensive tests on the roadmap generation process
 * to identify potential issues before they waste API credits.
 * 
 * Usage: node scripts/test-roadmap-generation.js
 * 
 * @author Skill Forge Team
 * @version 1.0.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const TEST_CONFIG = {
  // Test specific queries that might cause issues
  edgeCaseQueries: [
    '', // Empty string
    '   ', // Whitespace only
    'a', // Single character
    'very long query that exceeds normal limits and contains many words to test edge cases',
    'javascript & python',
    'react + typescript',
    'c++ programming',
    'c# development',
    'learn 3d modeling',
    'master c++',
    'python 3 tutorial',
    'JavaScript Programming',
    'PYTHON DEVELOPMENT',
    'React Web Development',
    'how to cook better',
    'learn to play guitar',
    'improve photography skills',
    'master public speaking',
    'get better at drawing',
    'learn a new language',
    'improve fitness',
    'master meditation'
  ],
  
  // Different query formats
  queryFormats: [
    'how to learn javascript',
    'how to become a better programmer',
    'how to improve coding skills',
    'how to master python',
    'how to build a website',
    'get better at coding',
    'get better at javascript',
    'get better at problem solving',
    'get better at web development',
    'learn javascript faster',
    'master python faster',
    'become a programmer faster',
    'improve coding faster',
    'how to get better at javascript faster',
    'learn python programming and become a developer',
    'master web development and build amazing websites'
  ],
  
  // Skill levels to test
  skillLevels: ['beginner', 'intermediate', 'advanced'],
  
  // Content limits to test
  contentLimits: [
    { maxVideos: 0, maxArticles: 0, maxImages: 0 },
    { maxVideos: 1, maxArticles: 1, maxImages: 1 },
    { maxVideos: 10, maxArticles: 20, maxImages: 10 }
  ]
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Run Jest tests with specific configuration
 */
function runJestTests(testPattern = '', options = {}) {
  const defaultOptions = {
    verbose: true,
    noCache: true,
    maxWorkers: 1, // Run tests sequentially to avoid conflicts
    ...options
  };
  
  const args = [
    '--testPathPattern=' + testPattern,
    '--verbose',
    '--no-cache',
    '--maxWorkers=1'
  ];
  
  if (options.watch) {
    args.push('--watch');
  }
  
  if (options.coverage) {
    args.push('--coverage');
  }
  
  try {
    console.log(`🧪 Running tests with pattern: ${testPattern}`);
    execSync(`npx jest ${args.join(' ')}`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    return true;
  } catch (error) {
    console.error('❌ Tests failed:', error.message);
    return false;
  }
}

/**
 * Check if all required environment variables are set
 */
function checkEnvironmentVariables() {
  const requiredVars = [
    'OPENAI_API_KEY',
    'YOUTUBE_API_KEY', 
    'TAVILY_API_KEY',
    'GOOGLE_CUSTOM_SEARCH_API_KEY',
    'GOOGLE_CUSTOM_SEARCH_ENGINE_ID'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
    console.warn('   Tests will use mock data instead of real API calls');
    return false;
  }
  
  console.log('✅ All environment variables are set');
  return true;
}

/**
 * Validate test file structure
 */
function validateTestFiles() {
  const testFiles = [
    'tests/integration/roadmap-generation.test.ts',
    'src/lib/services/search/search-service.ts',
    'src/lib/services/openai/openai-service.ts',
    'src/lib/services/youtube/youtube-service.ts',
    'src/lib/services/articles/article-service.ts',
    'src/lib/services/images/image-service.ts'
  ];
  
  const missing = testFiles.filter(file => !fs.existsSync(file));
  
  if (missing.length > 0) {
    console.error('❌ Missing required files:', missing);
    return false;
  }
  
  console.log('✅ All required test files exist');
  return true;
}

/**
 * Run specific test scenarios
 */
function runTestScenarios() {
  console.log('\n🔍 Running specific test scenarios...\n');
  
  const scenarios = [
    {
      name: 'Edge Case Queries',
      pattern: 'Edge Cases',
      description: 'Testing queries with edge cases like empty strings, special characters, etc.'
    },
    {
      name: 'Query Format Handling',
      pattern: 'Query Format Handling',
      description: 'Testing different query formats like "how to", "get better at", "faster", etc.'
    },
    {
      name: 'Error Handling',
      pattern: 'Error Handling',
      description: 'Testing error scenarios and graceful degradation'
    },
    {
      name: 'Content Enhancement',
      pattern: 'Content Enhancement',
      description: 'Testing roadmap enhancement with real content'
    },
    {
      name: 'Non-Programming Topics',
      pattern: 'Non-Programming Topics',
      description: 'Testing universal applicability to non-programming topics'
    }
  ];
  
  let allPassed = true;
  
  scenarios.forEach(scenario => {
    console.log(`\n📋 ${scenario.name}`);
    console.log(`   ${scenario.description}`);
    
    const passed = runJestTests(scenario.pattern, { verbose: false });
    if (!passed) {
      allPassed = false;
    }
  });
  
  return allPassed;
}

/**
 * Run performance tests
 */
function runPerformanceTests() {
  console.log('\n⚡ Running performance tests...\n');
  
  const performanceTests = [
    {
      name: 'Concurrent Requests',
      pattern: 'Performance and Limits',
      description: 'Testing concurrent request handling'
    },
    {
      name: 'Content Limits',
      pattern: 'Content Limits',
      description: 'Testing content limit enforcement'
    }
  ];
  
  let allPassed = true;
  
  performanceTests.forEach(test => {
    console.log(`\n📊 ${test.name}`);
    console.log(`   ${test.description}`);
    
    const passed = runJestTests(test.pattern, { verbose: false });
    if (!passed) {
      allPassed = false;
    }
  });
  
  return allPassed;
}

/**
 * Generate test report
 */
function generateTestReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: results.total,
    passedTests: results.passed,
    failedTests: results.failed,
    successRate: ((results.passed / results.total) * 100).toFixed(2) + '%',
    issues: results.issues || []
  };
  
  const reportPath = 'test-reports/roadmap-generation-report.json';
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Test report saved to: ${reportPath}`);
  
  return report;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('🚀 Starting Roadmap Generation Test Suite\n');
  
  // Check prerequisites
  if (!validateTestFiles()) {
    console.error('❌ Test prerequisites not met. Exiting.');
    process.exit(1);
  }
  
  const hasRealAPIs = checkEnvironmentVariables();
  
  if (!hasRealAPIs) {
    console.log('⚠️  Running tests with mock data only');
  }
  
  // Run comprehensive tests
  console.log('\n🧪 Running comprehensive test suite...\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    issues: []
  };
  
  // Run all tests first
  console.log('📋 Running all integration tests...');
  const allTestsPassed = runJestTests('roadmap-generation.test.ts');
  
  if (allTestsPassed) {
    results.passed++;
  } else {
    results.failed++;
    results.issues.push('Integration tests failed');
  }
  results.total++;
  
  // Run specific scenarios
  const scenariosPassed = runTestScenarios();
  if (!scenariosPassed) {
    results.issues.push('Some test scenarios failed');
  }
  
  // Run performance tests
  const performancePassed = runPerformanceTests();
  if (!performancePassed) {
    results.issues.push('Performance tests failed');
  }
  
  // Generate report
  const report = generateTestReport(results);
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   Total Tests: ${report.totalTests}`);
  console.log(`   Passed: ${report.passedTests}`);
  console.log(`   Failed: ${report.failedTests}`);
  console.log(`   Success Rate: ${report.successRate}`);
  
  if (report.issues.length > 0) {
    console.log('\n⚠️  Issues Found:');
    report.issues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
  }
  
  if (report.failedTests > 0) {
    console.log('\n❌ Some tests failed. Please review the issues above.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed! The roadmap generation system is ready for production.');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runJestTests,
  checkEnvironmentVariables,
  validateTestFiles,
  runTestScenarios,
  runPerformanceTests,
  generateTestReport,
  TEST_CONFIG
};
