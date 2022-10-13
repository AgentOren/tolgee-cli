#!/usr/bin/env node

import { Command } from 'commander';
import { HttpError } from './client/errors';
import { setDebug, error } from './utils/logger';

import PushCommand from './commands/push';
import PullCommand from './commands/pull';

function preHandler(prog: Command, cmd: Command) {
  const opts = cmd.opts();
  // Validate --project-id and --api-key if necessary
  if ('apiKey' in opts && opts.project === -1) {
    if (!opts.apiKey.startsWith('tgpak_')) {
      error('Project ID is required when not using a Project API Key.');
      process.exit(1);
    }
  }

  // Apply verbosity
  setDebug(prog.opts().verbose);
}

const program = new Command('tolgee-cli')
  .description('Command Line Interface to interact with the Tolgee Platform')
  .option('-v, --verbose', 'Enable verbose logging.')
  .hook('preAction', preHandler);

// Register commands
program.addCommand(PushCommand);
program.addCommand(PullCommand);

// Run & handle potential uncaught failure
async function run() {
  try {
    await program.parseAsync();
  } catch (e: any) {
    if (e instanceof HttpError) {
      if (e.response.status === 503) {
        error(
          'The Tolgee server is temporarily unavailable. Please try again later.'
        );
        process.exit(1);
      }

      if (e.response.status >= 500) {
        error(
          'The Tolgee server reported an unexpected server error. Please try again later.'
        );
        process.exit(1);
      }
    }

    error(`Uncaught Error: ${e.message}`);
    console.log(e);
    process.exit(1);
  }
}

run();