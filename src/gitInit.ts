import { execSync } from 'node:child_process';
import kleur from 'kleur';
import ora from 'ora';

/**
 * Initializes a git repository, stages all files, and makes an initial commit
 * @param targetDir - The directory where the git repository should be initialized
 */
export function initializeGitRepository(targetDir: string): void {
    const spinner = ora('Initializing git repository...').start();

    try {
        execSync('git --version', { stdio: 'pipe', cwd: targetDir });
        execSync('git init', { stdio: 'pipe', cwd: targetDir });
        execSync('git add .', { stdio: 'pipe', cwd: targetDir });
        execSync('git commit -m "Initial commit"', { stdio: 'pipe', cwd: targetDir });

        spinner.succeed('Git repository initialized');
    } catch (error) {
        spinner.fail('Failed to initialize git repository. 💥');

        if (error instanceof Error && error.message.includes('git --version')) {
            console.log(kleur.yellow('⚠️  Git is not installed or not available in PATH'));
            console.log(
                kleur.gray(
                    '   You can manually initialize git later with: git init && git add . && git commit -m "Initial commit"',
                ),
            );
        } else if (error instanceof Error && error.message.includes('git init')) {
            console.log(kleur.yellow('⚠️  Failed to initialize git repository'));
            console.log(kleur.gray('   Please check if you have write permissions in the target directory'));
        } else if (error instanceof Error && error.message.includes('git add')) {
            console.log(kleur.yellow('⚠️  Failed to stage files'));
            console.log(kleur.gray('   Git repository was initialized but files could not be staged'));
        } else if (error instanceof Error && error.message.includes('git commit')) {
            console.log(kleur.yellow('⚠️  Failed to create initial commit'));
            console.log(kleur.gray('   Git repository was initialized and files staged, but commit failed'));
            console.log(kleur.gray('   This might be due to missing git user configuration'));
            console.log(
                kleur.gray(
                    '   Run: git config --global user.name "Your Name" && git config --global user.email "your.email@example.com"',
                ),
            );
        } else {
            console.log(kleur.yellow('⚠️  An unexpected error occurred during git initialization'));
            console.log(kleur.gray(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
    }
}
