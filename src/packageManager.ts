import { exec, execSync } from 'node:child_process';
import { promisify } from 'node:util';
import kleur from 'kleur';
import prompts from 'prompts';
import { PACKAGE_MANAGERS, type PackageManager } from './config.js';
import { getAddSubcommand } from './utils.js';

/**
 * Checks if a package manager is available on the system
 * @param pm - Package manager configuration object
 * @returns True if the package manager is available, false otherwise
 */
export function checkPackageManagerAvailable(pm: PackageManager): boolean {
    try {
        execSync(`${pm.command} --version`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

/**
 * Prompts user to select a package manager from available options
 * If the selected package manager is not available, shows an error and exits
 * @returns Selected package manager configuration
 */
export async function selectPackageManager(): Promise<PackageManager> {
    const response = await prompts({
        type: 'select',
        name: 'packageManager',
        message: 'Choose a package manager:',
        choices: PACKAGE_MANAGERS.map((pm) => ({
            title: pm.name,
            value: pm,
        })),
        initial: 0,
    });

    if (!response.packageManager) {
        console.log(kleur.yellow('👋 Operation cancelled'));
        process.exit(0);
    }

    const selectedPM = response.packageManager as PackageManager;

    if (!checkPackageManagerAvailable(selectedPM)) {
        console.error(kleur.red(`❌ Error: ${selectedPM.name} is not available on this system`));
        console.log(kleur.gray(`Please install ${selectedPM.name} or choose a different package manager`));
        process.exit(1);
    }

    return selectedPM;
}

/**
 * Installs dependencies using the specified package manager
 * @param packageManager - Package manager configuration
 * @param dependencies - Array of dependency names
 * @param isDev - Whether these are dev dependencies
 */
export async function installDependencies(
    packageManager: PackageManager,
    dependencies: string[],
    isDev: boolean = false,
): Promise<void> {
    const devFlag = isDev ? packageManager.devFlag : '';
    const addSubcommand = getAddSubcommand(packageManager);
    const command = `${packageManager.command} ${addSubcommand} ${dependencies.join(' ')} ${devFlag}`.trim();
    const execAsync = promisify(exec);
    await execAsync(command);
}
