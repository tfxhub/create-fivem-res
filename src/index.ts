#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import kleur from 'kleur';
import ora from 'ora';
import { DEPENDENCIES, DEV_DEPENDENCIES } from './config.js';
import { initializeGitRepository } from './gitInit.js';
import { installDependencies, selectPackageManager } from './packageManager.js';
import { selectFormatterLinterTools } from './toolSelection.js';
import { addToolScriptsToPackageJson, copyDirectory, replaceTemplateVariables } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main function that orchestrates the FiveM resource creation process
 */
async function main(): Promise<void> {
    console.log(kleur.cyan().bold('🚀 Create FiveM Resource'));
    console.log(kleur.gray('Generate a new TypeScript FiveM resource\n'));

    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error(kleur.red('❌ Error: Please provide a resource name'));
        console.log(kleur.gray('Usage: create-fivem-res <resource-name>'));
        process.exit(1);
    }

    const resourceName = args[0];
    const targetDir = join(process.cwd(), resourceName);

    if (existsSync(targetDir)) {
        console.error(kleur.red(`❌ Error: Directory "${resourceName}" already exists`));
        process.exit(1);
    }

    const selectedPM = await selectPackageManager();
    const toolSelection = await selectFormatterLinterTools();

    let spinner = ora('Creating project directory...').start();

    try {
        mkdirSync(targetDir, { recursive: true });
        spinner.succeed('Project directory created');

        spinner = ora('Copying template files...').start();
        const templatesDir = join(__dirname, '..', 'templates', 'core');

        if (!existsSync(templatesDir)) {
            throw new Error('Templates directory not found');
        }

        copyDirectory(templatesDir, targetDir);

        for (const tool of toolSelection.selectedTools) {
            const toolDir = join(__dirname, '..', 'templates', 'tools', tool.id);
            if (existsSync(toolDir)) {
                for (const configFile of tool.configFiles) {
                    const srcPath = join(toolDir, configFile);
                    const destFileName = configFile.endsWith('.template')
                        ? configFile.replace('.template', '')
                        : configFile;
                    const destPath = join(targetDir, destFileName);
                    if (existsSync(srcPath)) {
                        copyFileSync(srcPath, destPath);
                    }
                }
            }
        }

        spinner.succeed('Template files copied');

        spinner = ora('Configuring project files...').start();
        const packageJsonPath = join(targetDir, 'package.json');
        const fxmanifestPath = join(targetDir, 'fxmanifest.json');

        const templateVariables = {
            RESOURCE_NAME: resourceName,
            PACKAGE_MANAGER: selectedPM.command,
            PACKAGE_MANAGER_EXEC: selectedPM.execCommand,
        };

        if (existsSync(packageJsonPath)) {
            replaceTemplateVariables(packageJsonPath, templateVariables);
            addToolScriptsToPackageJson(packageJsonPath, toolSelection.selectedTools, selectedPM.execCommand);
        }

        if (existsSync(fxmanifestPath)) {
            replaceTemplateVariables(fxmanifestPath, templateVariables);
        }

        spinner.succeed('Project files configured');

        process.chdir(join(targetDir, 'src'));

        spinner = ora(`Installing dependencies with ${selectedPM.name}...`).start();
        execSync(selectedPM.installCmd, { stdio: 'pipe' });
        spinner.succeed('Base dependencies installed');

        spinner = ora('Installing FiveM dev dependencies...').start();
        installDependencies(selectedPM, DEV_DEPENDENCIES, true);
        spinner.succeed('FiveM dev dependencies installed');

        spinner = ora('Installing FiveM runtime dependencies...').start();
        installDependencies(selectedPM, DEPENDENCIES, false);
        spinner.succeed('FiveM runtime dependencies installed');

        if (toolSelection.selectedTools.length > 0) {
            const toolDependencies = toolSelection.selectedTools.flatMap((tool) => tool.dependencies);
            if (toolDependencies.length > 0) {
                spinner = ora('Installing tool dependencies...').start();
                installDependencies(selectedPM, toolDependencies, true);
                spinner.succeed('Tool dependencies installed');
            }
        }

        process.chdir(targetDir);
        initializeGitRepository(targetDir);

        console.log(`\n${kleur.green().bold('✅ Success! 🎉')}`);
        console.log(kleur.gray(`Your FiveM resource "${resourceName}" has been created.\n`));

        if (toolSelection.selectedTools.length > 0) {
            console.log(kleur.bold('Configured tool:'));
            for (const tool of toolSelection.selectedTools) {
                console.log(kleur.gray(`  • ${tool.name} - ${tool.description}`));
            }
            console.log();
        }

        console.log(kleur.bold('Next steps:'));
        console.log(kleur.cyan(`  cd ${resourceName}`));
        console.log(
            kleur.cyan(
                `  ${selectedPM.command} ${selectedPM.command === 'bun' || selectedPM.command === 'npm' ? 'run' : ''} dev`,
            ),
        );

        console.log(`\n${kleur.gray('Happy coding! 🎮')}`);
    } catch (error) {
        spinner.fail('An error occurred');
        console.error(kleur.red('❌ Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

/**
 * Handle process interruption gracefully
 */
process.on('SIGINT', () => {
    console.log(`\n${kleur.yellow('👋 Operation cancelled')}`);
    process.exit(0);
});

main().catch((error) => {
    console.error(kleur.red('❌ Unexpected error:'), error);
    process.exit(1);
});
