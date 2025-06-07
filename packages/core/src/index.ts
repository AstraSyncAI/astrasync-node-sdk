// Core exports for @astrasync/core package
export * from './types';
export * from './api';
export * from './utils';

// Re-export specific items for convenience
export { ApiClient } from './api';
export { 
  calculateTrustScore,
  formatAgentId,
  formatTrustScore,
  createSpinner,
  printSuccess,
  printError,
  printInfo,
  printWarning,
  isValidEmail,
  readFileContent,
  detectFileType,
  sanitizeAgentData
} from './utils';
