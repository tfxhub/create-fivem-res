#!/usr/bin/env node

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
import { copyFileSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import kleur from 'kleur';
import ora from 'ora';
import { DEPENDENCIES, DEV_DEPENDENCIES } from './config.js';
import { initializeGitRepository } from './gitInit.js';
import { installDependencies, selectPackageManager } from './packageManager.js';
import { selectOptionalFeatures } from './featureSelection.js';
import { runUIFrameworkSetup, selectUIFramework } from './uiSelection.js';
import {
    addFeatureScriptsToPackageJson,
    copyDirectory,
    replaceTemplateVariables,
    buildRunScriptCommand,
    isValidDirectoryName,
    copyFeatureConfigFiles,
} from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const originalCwd = process.cwd();

/**
 * Main function that orchestrates the resource creation process
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

    if (!isValidDirectoryName(resourceName)) {
        console.error(kleur.red('❌ Error: Invalid resource name'));
        process.exit(1);
    }
    const targetDir = join(process.cwd(), resourceName);

    if (existsSync(targetDir)) {
        console.error(kleur.red(`❌ Error: Directory "${resourceName}" already exists`));
        process.exit(1);
    }

    const selectedPM = await selectPackageManager();
    const uiFramework = await selectUIFramework();
    const featureSelection = await selectOptionalFeatures(uiFramework);

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

        try {
            if (uiFramework !== 'none') {
                const webCoreSrcDir = join(__dirname, '..', 'templates', 'web', 'core', 'src');
                if (existsSync(webCoreSrcDir)) {
                    copyDirectory(webCoreSrcDir, join(targetDir, 'src'));
                }
            }
        } catch {}

        for (const feature of featureSelection.selectedFeatures) {
            if (feature.isUIrequired) continue;
            copyFeatureConfigFiles(join(__dirname, '..', 'templates'), feature.id, feature.configFiles, targetDir);
        }

        spinner.succeed('Template files copied');

        await runUIFrameworkSetup(selectedPM, targetDir, featureSelection.selectedFeatures, uiFramework);

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
            addFeatureScriptsToPackageJson(packageJsonPath, featureSelection.selectedFeatures, selectedPM);
        }

        if (existsSync(fxmanifestPath)) {
            replaceTemplateVariables(fxmanifestPath, templateVariables);
        }

        spinner.succeed('Project files configured');

        process.chdir(targetDir);

        spinner = ora(`Installing dependencies...`).start();
        await execAsync(selectedPM.installCmd);
        await installDependencies(selectedPM, DEV_DEPENDENCIES, true);
        await installDependencies(selectedPM, DEPENDENCIES, false);

        if (featureSelection.selectedFeatures.length > 0) {
            const rootFeatureDependencies = featureSelection.selectedFeatures
                .filter((feature) => !feature.isUIrequired)
                .flatMap((feature) => feature.dependencies);
            if (rootFeatureDependencies.length > 0) {
                await installDependencies(selectedPM, rootFeatureDependencies, true);
            }
        }

        spinner.succeed('Dependencies installed');

        spinner = ora('Formatting and linting code...').start();

        try {
            if (featureSelection.hasFormatting) {
                const runFormatCmd = buildRunScriptCommand(selectedPM, 'format');
                await execAsync(runFormatCmd);
            }

            if (featureSelection.hasLinting) {
                const runLintCmd = buildRunScriptCommand(selectedPM, 'lint');
                await execAsync(runLintCmd);
            }
        } catch {}

        spinner.succeed('Completed formatting and linting');

        await initializeGitRepository(targetDir);

        spinner = ora('Building resource...').start();
        await execAsync(buildRunScriptCommand(selectedPM, 'build'));
        spinner.succeed('Resource built');

        console.log(`\n${kleur.green().bold('✅ Success! 🎉')}`);
        console.log(kleur.gray(`Your FiveM resource "${resourceName}" has been created.\n`));

        if (featureSelection.selectedFeatures.length > 0) {
            console.log(kleur.bold('Features:'));
            if (uiFramework !== 'none') {
                console.log(kleur.gray(`  • UI - ${uiFramework[0].toUpperCase() + uiFramework.slice(1)}`));
            }
            for (const feature of featureSelection.selectedFeatures) {
                console.log(kleur.gray(`  • ${feature.name} - ${feature.description}`));
            }
            console.log();
        }

        console.log(kleur.bold('Next steps:'));
        console.log(kleur.cyan(`  cd ${resourceName}`));
        const devRun = buildRunScriptCommand(selectedPM, 'dev');
        const prodRun = buildRunScriptCommand(selectedPM, 'build');
        console.log(kleur.cyan(`  ${devRun}`) + kleur.gray(` or`) + kleur.cyan(` ${prodRun}`));

        console.log(`\n${kleur.gray('Happy coding! 🎮')}`);
    } catch (error) {
        spinner.fail('An error occurred');
        console.error(kleur.red('❌ Error:'), error instanceof Error ? error.message : error);
        cleanupOnError(targetDir);
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

function cleanupOnError(targetDir: string): void {
    try {
        process.chdir(originalCwd);
        rmSync(targetDir, { recursive: true, force: true });
    } catch {}
}

main().catch((error) => {
    console.error(kleur.red('❌ Unexpected error:'), error);
    const args = process.argv.slice(2);
    if (args.length > 0) {
        const targetDir = join(originalCwd, args[0]);
        cleanupOnError(targetDir);
    }
    process.exit(1);
});
