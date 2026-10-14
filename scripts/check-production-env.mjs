import nextEnv from '@next/env';
import { getProductionConfigurationIssues } from '../lib/production-config.js';

nextEnv.loadEnvConfig(process.cwd(), false);
const issues = getProductionConfigurationIssues(process.env);
if (issues.length) {
  console.error('Production configuration is incomplete:\n' + issues.map(issue => `- ${issue}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Production configuration checks passed.');
}
