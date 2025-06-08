#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { readFileSync, writeFileSync } from 'fs';
import { AstraSync } from '..';

const program = new Command();

program
  .name('astrasync')
  .description('AstraSync AI Agent Registration CLI')
  .version('0.1.0');

program
  .command('register <file-or-json>')
  .description('Register an AI agent with AstraSync')
  .option('-e, --email <email>', 'Developer email (overrides env)')
  .option('-o, --output <file>', 'Save results to file')
  .action(async (input, options) => {
    const spinner = ora('Initializing AstraSync...').start();
    
    try {
      const email = options.email || process.env.ASTRASYNC_EMAIL;
      if (!email) {
        spinner.fail(chalk.red('Email required. Use --email or set ASTRASYNC_EMAIL'));
        process.exit(1);
      }

      // Parse input
      let agentData;
      try {
        // Try as file first
        const content = readFileSync(input, 'utf-8');
        agentData = input.endsWith('.json') ? JSON.parse(content) : input;
      } catch {
        // Try as inline JSON
        agentData = JSON.parse(input);
      }

      spinner.text = 'Detecting agent format...';
      const client = new AstraSync({ developerEmail: email });
      
      spinner.text = 'Registering with AstraSync...';
      const result = await client.register(agentData);
      
      spinner.succeed(chalk.green('✅ Registration complete!'));
      
      console.log('\n' + chalk.cyan('Registration Details:'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(`${chalk.bold('Agent ID:')} ${result.agentId}`);
      console.log(`${chalk.bold('Status:')} ${result.status}`);
      console.log(`${chalk.bold('Trust Score:')} ${result.trustScore}`);
      console.log(`${chalk.bold('Format Detected:')} ${result.detectedFormat}`);
      
      if (options.output) {
        writeFileSync(options.output, JSON.stringify(result, null, 2));
        console.log(`\n${chalk.green('✅')} Results saved to ${options.output}`);
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('verify <agentId>')
  .description('Verify an agent exists')
  .option('-e, --email <email>', 'Developer email')
  .action(async (agentId, options) => {
    const spinner = ora('Verifying agent...').start();
    
    try {
      const email = options.email || process.env.ASTRASYNC_EMAIL || 'verify@astrasync.ai';
      const client = new AstraSync({ developerEmail: email });
      
      const exists = await client.verify(agentId);
      
      if (exists) {
        spinner.succeed(chalk.green(`✅ Agent ${agentId} is registered`));
      } else {
        spinner.fail(chalk.yellow(`⚠️  Agent ${agentId} not found`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('detect <file>')
  .description('Detect agent format without registering')
  .action(async (file) => {
    try {
      const content = readFileSync(file, 'utf-8');
      const data = JSON.parse(content);
      
      const client = new AstraSync({ developerEmail: 'detect@astrasync.ai' });
      const format = client.detect(data);
      
      console.log(chalk.cyan(`Detected format: ${chalk.bold(format)}`));
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('health')
  .description('Check AstraSync API health')
  .action(async () => {
    const spinner = ora('Checking API health...').start();
    
    try {
      const client = new AstraSync({ developerEmail: 'health@astrasync.ai' });
      const healthy = await client.health();
      
      if (healthy) {
        spinner.succeed(chalk.green('✅ AstraSync API is healthy'));
      } else {
        spinner.fail(chalk.red('❌ AstraSync API is down'));
      }
    } catch (error) {
      spinner.fail(chalk.red('❌ Could not reach AstraSync API'));
      process.exit(1);
    }
  });

program.parse();
