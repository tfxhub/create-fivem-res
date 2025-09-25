import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { dirname } from 'node:path';
import type { OptionalFeature, PackageManager } from './config.js';

/**
 * Recursively copies a directory and all its contents to a destination
 * @param src - Source directory path
 * @param dest - Destination directory path
 * @param options - Options for the copy operation
 */
export function copyDirectory(
    src: string,
    dest: string,
    options: { ignore?: (entryName: string, entryPath: string, isDirectory: boolean) => boolean } = {},
): void {
    if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
    }

    const items = readdirSync(src);

    for (const item of items) {
        const srcPath = join(src, item);
        const destPath = join(dest, item);
        const stat = statSync(srcPath);

        if (options.ignore && options.ignore(item, srcPath, stat.isDirectory())) {
            continue;
        }

        if (stat.isDirectory()) {
            copyDirectory(srcPath, destPath, options);
        } else {
            copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Copies the declared config files for a feature from templates to a destination directory.
 * If a config file path refers to a directory, copy recursively; if it ends with .template, strip the suffix.
 * @param templatesRoot - Absolute path to templates root
 * @param featureId - Feature identifier (folder under templates/features)
 * @param configFiles - File or directory paths relative to the feature folder
 * @param destDir - Destination directory where files should be copied
 */
export function copyFeatureConfigFiles(
    templatesRoot: string,
    featureId: string,
    configFiles: string[],
    destDir: string,
): void {
    const featureDir = join(templatesRoot, 'features', featureId);
    if (!existsSync(featureDir)) return;

    for (const configFile of configFiles) {
        const srcPath = join(featureDir, configFile);
        const destFileName = configFile.endsWith('.template') ? configFile.replace('.template', '') : configFile;
        const destPath = join(destDir, destFileName);
        if (!existsSync(srcPath)) continue;
        const isDirectory = statSync(srcPath).isDirectory();
        if (isDirectory) {
            copyDirectory(srcPath, destPath);
        } else {
            copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Replaces template variables in a file with provided values
 * @param filePath - Path to the file to process
 * @param variables - Object containing variable replacements
 */
export function replaceTemplateVariables(filePath: string, variables: Record<string, string>): void {
    let content = readFileSync(filePath, 'utf-8');

    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value);
    }

    writeFileSync(filePath, content, 'utf-8');
}

/**
 * Modifies package.json to add feature-specific scripts
 * @param packageJsonPath - Path to the package.json file
 * @param selectedFeatures - Array of selected optional features
 * @param packageManager - Selected package manager configuration
 */
export function addFeatureScriptsToPackageJson(
    packageJsonPath: string,
    selectedFeatures: OptionalFeature[],
    packageManager: PackageManager,
): void {
    const content = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    if (packageJson.scripts) {
        delete packageJson.scripts.format;
        delete packageJson.scripts.lint;
    }

    const scripts: Record<string, string> = {};

    for (const feature of selectedFeatures) {
        if (feature.scripts?.format) {
            scripts.format = feature.scripts.format;
        }
        if (feature.scripts?.lint) {
            scripts.lint = feature.scripts.lint;
        }
    }

    const hasWebDir = existsSync(join(dirname(packageJsonPath), 'web'));

    if (hasWebDir && scripts.format && scripts.format.trim() === 'prettier --write .') {
        const pmRunFormat = buildRunScriptCommand(packageManager, 'format');
        scripts.format = `prettier --write . && cd web && ${pmRunFormat}`;
    }
    if (hasWebDir && scripts.lint && scripts.lint.trim() === 'prettier --check .') {
        const pmRunLint = buildRunScriptCommand(packageManager, 'lint');
        scripts.lint = `prettier --check . && cd web && ${pmRunLint}`;
    }

    packageJson.scripts = { ...packageJson.scripts, ...scripts };

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
}

/**
 * Builds a package-manager specific command to run an npm script
 * @param packageManager - Selected package manager
 * @param script - Script name (e.g., 'dev', 'format')
 * @returns Full command string to execute the script
 */
export function buildRunScriptCommand(packageManager: PackageManager, script: string): string {
    return packageManager.command === 'yarn' ? `yarn ${script}` : `${packageManager.command} run ${script}`;
}

/**
 * Builds the execution command used to run a binary (npx/yarn/bunx/pnpm)
 * @param packageManager - Selected package manager
 * @param binAndArgs - Binary and arguments string
 */
export function buildExecCommand(packageManager: PackageManager, binAndArgs: string): string {
    return `${packageManager.execCommand} ${binAndArgs}`.trim();
}

/**
 * Returns the appropriate subcommand for adding/installing dependencies
 * @param packageManager - Selected package manager
 * @returns 'install' for npm, otherwise 'add'
 */
export function getAddSubcommand(packageManager: PackageManager): string {
    return packageManager.command === 'npm' ? 'install' : 'add';
}

/**
 * Returns the extra argument separator required by npm when forwarding args
 * @param packageManager - Selected package manager
 * @returns '--' for npm, otherwise ''
 */
export function getArgumentSeparator(packageManager: PackageManager): string {
    return packageManager.command === 'npm' ? '--' : '';
}

/**
 * Validates if a string is a valid directory name
 * @param name - The name to validate
 * @returns true if valid, false otherwise
 */
export function isValidDirectoryName(name: string): boolean {
    if (!name || name.trim().length === 0) {
        return false;
    }

    if (name.length > 255) {
        return false;
    }

    const invalidChars = /[<>:"|?*\\]/;
    if (invalidChars.test(name)) {
        return false;
    }

    if (name !== name.trim() || name.startsWith('.') || name.endsWith('.')) {
        return false;
    }

    const reservedNames = [
        'CON',
        'PRN',
        'AUX',
        'NUL',
        'COM1',
        'COM2',
        'COM3',
        'COM4',
        'COM5',
        'COM6',
        'COM7',
        'COM8',
        'COM9',
        'LPT1',
        'LPT2',
        'LPT3',
        'LPT4',
        'LPT5',
        'LPT6',
        'LPT7',
        'LPT8',
        'LPT9',
    ];

    const upperName = name.toUpperCase();
    if (reservedNames.includes(upperName)) {
        return false;
    }

    return true;
}
