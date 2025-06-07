import { readFile } from 'fs/promises';
import { Agent } from './types';
import chalk from 'chalk';
import ora from 'ora';

export async function readFileContent(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf-8');
  } catch (error: any) {
    throw new Error(`Failed to read file ${path}: ${error.message}`);
  }
}

export function calculateTrustScore(agent: Agent): number {
  let score = 70; // Base score

  // Add points for completeness
  if (agent.description && agent.description.length > 50) score += 5;
  if (agent.ownerUrl) score += 3;
  if (agent.version) score += 2;
  
  // Add points for capabilities
  if (agent.capabilities && agent.capabilities.length > 0) {
    score += Math.min(agent.capabilities.length * 2, 10);
  }
  
  // Add points for skills
  if (agent.skills) {
    const skillCount = typeof agent.skills === 'number' ? agent.skills : agent.skills.length;
    score += Math.min(skillCount * 2, 10);
  }
  
  // Add points for authentication
  if (agent.authentication) score += 5;
  
  return Math.min(score, 100);
}

export function formatAgentId(id: string): string {
  return chalk.cyan(id);
}

export function formatTrustScore(score: string | number): string {
  const numScore = typeof score === 'string' ? parseInt(score) : score;
  if (numScore >= 90) return chalk.green(`${score}%`);
  if (numScore >= 70) return chalk.yellow(`${score}%`);
  return chalk.red(`${score}%`);
}

export function createSpinner(text: string) {
  return ora({
    text,
    spinner: 'dots'
  });
}

export function printSuccess(message: string) {
  console.log(chalk.green('✓'), message);
}

export function printError(message: string) {
  console.log(chalk.red('✗'), message);
}

export function printInfo(message: string) {
  console.log(chalk.blue('ℹ'), message);
}

export function printWarning(message: string) {
  console.log(chalk.yellow('⚠'), message);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateTimestamp(): string {
  return new Date().toISOString();
}

export function detectFileType(filename: string): string | null {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'json':
      return 'json';
    case 'af':
      return 'letta';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'zip':
      return 'zip';
    default:
      return null;
  }
}

export function sanitizeAgentData(agent: any): Agent {
  return {
    name: agent.name || 'Unnamed Agent',
    description: agent.description || '',
    owner: agent.owner || agent.developer || agent.creator || 'Unknown',
    ownerUrl: agent.ownerUrl || agent.website || agent.url,
    capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
    version: agent.version || '1.0.0',
    skills: agent.skills,
    authentication: agent.authentication,
    metadata: agent.metadata || {}
  };
}
