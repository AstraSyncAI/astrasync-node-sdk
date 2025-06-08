import { Agent } from '../types';

export function calculateTrustScore(agent: Agent): number {
  let score = 70; // Base score

  // Add points for completeness
  if (agent.description && agent.description.length > 50) score += 5;
  if (agent.version) score += 5;
  if (agent.capabilities && agent.capabilities.length > 0) score += 5;
  if (agent.capabilities && agent.capabilities.length > 3) score += 5;
  
  // Add points for specific capabilities
  const trustedCapabilities = ['authentication', 'audit', 'compliance'];
  if (agent.capabilities) {
    for (const cap of agent.capabilities) {
      if (trustedCapabilities.some(tc => cap.toLowerCase().includes(tc))) {
        score += 2;
      }
    }
  }

  return Math.min(score, 95); // Cap at 95 for preview
}
