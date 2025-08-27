import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { FormatterLinterTool } from './config.js';

/**
 * Recursively copies a directory and all its contents to a destination
 * @param src - Source directory path
 * @param dest - Destination directory path
 */
export function copyDirectory(src: string, dest: string): void {
    if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
    }

    const items = readdirSync(src);

    for (const item of items) {
        const srcPath = join(src, item);
        const destPath = join(dest, item);
        const stat = statSync(srcPath);

        if (stat.isDirectory()) {
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
 * Modifies package.json to add tool-specific scripts
 * @param packageJsonPath - Path to the package.json file
 * @param selectedTools - Array of selected formatter/linter tools
 * @param packageManagerExec - Package manager execution command (e.g., 'npx', 'pnpm', 'yarn', 'bun run')
 */
export function addToolScriptsToPackageJson(
    packageJsonPath: string,
    selectedTools: FormatterLinterTool[],
    packageManagerExec: string,
): void {
    const content = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    if (packageJson.scripts) {
        delete packageJson.scripts.format;
        delete packageJson.scripts.lint;
    }

    const scripts: Record<string, string> = {};

    for (const tool of selectedTools) {
        if (tool.scripts.format) {
            scripts.format = `${packageManagerExec} ${tool.scripts.format}`;
        }
        if (tool.scripts.lint) {
            scripts.lint = `${packageManagerExec} ${tool.scripts.lint}`;
        }
    }

    packageJson.scripts = { ...packageJson.scripts, ...scripts };

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
}
