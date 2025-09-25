import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import kleur from 'kleur';
import ora from 'ora';
import prompts from 'prompts';
import type { OptionalFeature, PackageManager } from './config.js';
import { copyDirectory, getAddSubcommand, buildExecCommand, copyFeatureConfigFiles } from './utils.js';

const execAsync = promisify(exec);

export async function selectUIFramework(): Promise<'react' | 'vue' | 'svelte' | 'none'> {
    const { framework } = await prompts({
        type: 'select',
        name: 'framework',
        message: 'Add UI:',
        choices: [
            { title: 'React', value: 'react' },
            { title: 'Vue', value: 'vue' },
            { title: 'Svelte', value: 'svelte' },
            { title: 'None', value: 'none' },
        ],
        initial: 3,
    });

    if (!framework && framework !== 'none') {
        console.log(kleur.yellow('👋 Operation cancelled'));
        process.exit(0);
    }
    return framework as 'react' | 'vue' | 'svelte' | 'none';
}

export async function runUIFrameworkSetup(
    selectedPM: PackageManager,
    targetDir: string,
    selectedFeatures: OptionalFeature[] = [],
    framework: 'react' | 'vue' | 'svelte' | 'none' = 'none',
): Promise<void> {
    if (framework === 'none') {
        return;
    }

    await setupFrameworkUI(selectedPM, targetDir, selectedFeatures, framework);
    await setupCommonUI(targetDir);
}

type Framework = 'react' | 'vue' | 'svelte';

interface FrameworkConfig {
    name: Framework;
    viteTemplate: string;
    cssEntry: string; // path under web/src
    tailwindAppCssToRemove?: string; // optional file to remove if tailwind is enabled (e.g. React's App.css)
}

const FRAMEWORK_CONFIG: Record<Framework, FrameworkConfig> = {
    react: { name: 'react', viteTemplate: 'react-ts', cssEntry: 'index.css', tailwindAppCssToRemove: 'App.css' },
    vue: { name: 'vue', viteTemplate: 'vue-ts', cssEntry: 'style.css' },
    svelte: { name: 'svelte', viteTemplate: 'svelte-ts', cssEntry: 'app.css' },
};

async function setupFrameworkUI(
    selectedPM: PackageManager,
    targetDir: string,
    selectedFeatures: OptionalFeature[],
    framework: Framework,
): Promise<void> {
    const wantPrettier = selectedFeatures.some((f) => f.id === 'prettier');
    const wantTailwind = selectedFeatures.some((f) => f.id === 'tailwind');
    const cfg = FRAMEWORK_CONFIG[framework];

    const scaffoldSpinner = ora(`Scaffolding ${framework[0].toUpperCase() + framework.slice(1)} UI...`).start();
    try {
        const extra = selectedPM.command === 'npm' ? '--' : '';
        const cmd = `${selectedPM.command} create vite@latest web ${extra} --template ${cfg.viteTemplate}`;
        await execAsync(cmd, { cwd: targetDir });
        scaffoldSpinner.succeed(`${framework[0].toUpperCase() + framework.slice(1)} app created in ./web`);
    } catch (error) {
        scaffoldSpinner.fail(`Failed to scaffold ${framework} app`);
        throw error;
    }

    const installSpinner = ora(`Installing UI dependencies with ${selectedPM.name}...`).start();
    try {
        await execAsync(selectedPM.installCmd, { cwd: join(targetDir, 'web') });
        installSpinner.succeed('UI dependencies installed');
    } catch (error) {
        installSpinner.fail('Failed to install UI dependencies');
        throw error;
    }

    // Copy base template files for the framework (excluding "#" folders)
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const frameworkTemplateDir = join(__dirname, '..', 'templates', 'web', framework);
        if (existsSync(frameworkTemplateDir)) {
            copyDirectory(frameworkTemplateDir, join(targetDir, 'web'), { ignore: (name) => name.startsWith('#') });
        }
    } catch {}

    if (wantTailwind) {
        await installAndConfigureTailwind(selectedPM, targetDir, selectedFeatures, framework, cfg);
    }

    if (wantPrettier) {
        await installPrettierAndTemplates(selectedPM, targetDir, framework, wantTailwind);
        await updatePrettierPlugins(targetDir, framework, wantTailwind);
    }
}

async function installAndConfigureTailwind(
    selectedPM: PackageManager,
    targetDir: string,
    selectedFeatures: OptionalFeature[],
    framework: Framework,
    cfg: FrameworkConfig,
): Promise<void> {
    const tailwindFeature = selectedFeatures.find((f) => f.id === 'tailwind');
    if (tailwindFeature) {
        const twSpinner = ora('Installing Tailwind CSS...').start();
        try {
            const addCmd = getAddSubcommand(selectedPM);
            const devFlag = selectedPM.devFlag ? ` ${selectedPM.devFlag}` : '';
            const cmd = `${selectedPM.command} ${addCmd} ${tailwindFeature.dependencies.join(' ')}${devFlag}`.trim();
            await execAsync(cmd, { cwd: join(targetDir, 'web') });
            const initCmd = buildExecCommand(selectedPM, 'tailwindcss init -p');
            await execAsync(initCmd, { cwd: join(targetDir, 'web') });
            twSpinner.succeed('Tailwind CSS installed');
        } catch (error) {
            twSpinner.fail('Failed to install Tailwind CSS');
            throw error;
        }
    }

    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const tailwindFeature = selectedFeatures.find((f) => f.id === 'tailwind');
        if (tailwindFeature) {
            copyFeatureConfigFiles(
                join(__dirname, '..', 'templates'),
                'tailwind',
                tailwindFeature.configFiles,
                join(targetDir, 'web'),
            );

            const sourceTailwindCss = join(__dirname, '..', 'templates', 'features', 'tailwind', 'tailwind.css');
            const appCssPath = join(targetDir, 'web', 'src', cfg.cssEntry);
            if (existsSync(appCssPath) && existsSync(sourceTailwindCss)) {
                const appCss = readFileSync(appCssPath, 'utf-8');
                const twCss = readFileSync(sourceTailwindCss, 'utf-8');
                const hasDirectives = /@tailwind\s+base;|@tailwind\s+components;|@tailwind\s+utilities;/.test(appCss);
                if (!hasDirectives) {
                    const updated = `${twCss}\n${appCss}`;
                    writeFileSync(appCssPath, updated, 'utf-8');
                }
            }

            if (cfg.tailwindAppCssToRemove) {
                const appCssFilePath = join(targetDir, 'web', 'src', cfg.tailwindAppCssToRemove);
                if (existsSync(appCssFilePath)) {
                    unlinkSync(appCssFilePath);
                }
            }
        }
    } catch {
        console.log(kleur.yellow('⚠️  Could not configure Tailwind CSS'));
    }

    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const tailwindTemplates = join(__dirname, '..', 'templates', 'web', framework, '#tailwind');
        if (existsSync(tailwindTemplates)) {
            copyDirectory(tailwindTemplates, join(targetDir, 'web'));
        }
    } catch {
        console.log(kleur.yellow(`⚠️ Could not copy Tailwind ${framework} template files`));
    }
}

async function installPrettierAndTemplates(
    selectedPM: PackageManager,
    targetDir: string,
    framework: Framework,
    wantTailwind: boolean,
): Promise<void> {
    const prettierSpinner = ora('Installing Prettier for the UI...').start();
    try {
        const addCmd = getAddSubcommand(selectedPM);
        const devFlag = selectedPM.devFlag ? ` ${selectedPM.devFlag}` : '';
        const plugins: string[] = [];
        if (framework === 'react') {
            plugins.push('eslint-config-prettier');
        }
        if (framework === 'svelte') {
            plugins.push('prettier-plugin-svelte');
        }
        if (wantTailwind) {
            plugins.push('prettier-plugin-tailwindcss');
        }
        const extra = plugins.length > 0 ? ` ${plugins.join(' ')}` : '';
        const cmd = `${selectedPM.command} ${addCmd} prettier${extra}${devFlag}`.trim();
        await execAsync(cmd, { cwd: join(targetDir, 'web') });
        prettierSpinner.succeed('Prettier installed');
    } catch (error) {
        prettierSpinner.fail('Failed to install Prettier');
        throw error;
    }

    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const prettierTemplateDir = join(__dirname, '..', 'templates', 'web', framework, '#prettier');
        if (existsSync(prettierTemplateDir)) {
            copyDirectory(prettierTemplateDir, join(targetDir, 'web'));
        }
    } catch {
        console.log(kleur.yellow('⚠️ Could not copy Prettier config files'));
    }

    // Package.json scripts per framework
    try {
        const webPkgPath = join(targetDir, 'web', 'package.json');
        if (existsSync(webPkgPath)) {
            const raw = readFileSync(webPkgPath, 'utf-8');
            const indentMatch = /\n(\s+)"/.exec(raw);
            const detectedIndent = indentMatch ? indentMatch[1] : '  ';
            const pkg = JSON.parse(raw);
            pkg.scripts = pkg.scripts || {};
            pkg.scripts.format = 'prettier --write .';
            if (framework !== 'react') {
                pkg.scripts.lint = 'prettier --check .';
            }
            const spaceCount = detectedIndent.startsWith('\t') ? undefined : detectedIndent.length;
            const output =
                spaceCount !== undefined ? JSON.stringify(pkg, null, spaceCount) : JSON.stringify(pkg, null, '\t');
            writeFileSync(webPkgPath, `${output}\n`, 'utf-8');
        }
    } catch {
        console.log(kleur.yellow('⚠️ Could not update web/package.json with Prettier scripts'));
    }
}

async function updatePrettierPlugins(targetDir: string, framework: Framework, wantTailwind: boolean): Promise<void> {
    if (!wantTailwind) return;
    try {
        const prettierRcPath = join(targetDir, 'web', '.prettierrc');
        if (!existsSync(prettierRcPath)) return;

        const raw = readFileSync(prettierRcPath, 'utf-8');

        if (framework === 'svelte') {
            // Svelte template may have a simple array; fallback to string replace if not JSON
            try {
                const config = JSON.parse(raw);
                if (!Array.isArray(config)) {
                    if (!config.plugins) config.plugins = [];
                    if (!config.plugins.includes('prettier-plugin-tailwindcss')) {
                        config.plugins.push('prettier-plugin-tailwindcss');
                        writeFileSync(prettierRcPath, JSON.stringify(config, null, 2), 'utf-8');
                    }
                } else {
                    if (!config.includes('prettier-plugin-tailwindcss')) {
                        config.push('prettier-plugin-tailwindcss');
                        writeFileSync(prettierRcPath, JSON.stringify(config, null, 2), 'utf-8');
                    }
                }
            } catch {
                if (!raw.includes('prettier-plugin-tailwindcss')) {
                    const updated = raw.replace(
                        '["prettier-plugin-svelte"]',
                        '["prettier-plugin-svelte", "prettier-plugin-tailwindcss"]',
                    );
                    writeFileSync(prettierRcPath, updated, 'utf-8');
                }
            }
            return;
        }

        // React/Vue: expect JSON object
        try {
            const config = JSON.parse(raw);
            if (!config.plugins) config.plugins = [];
            if (!config.plugins.includes('prettier-plugin-tailwindcss')) {
                config.plugins.push('prettier-plugin-tailwindcss');
                writeFileSync(prettierRcPath, JSON.stringify(config, null, 2), 'utf-8');
            }
        } catch {
            // If not JSON, do nothing
        }
    } catch {
        console.log(kleur.yellow('⚠️ Could not update .prettierrc with Tailwind plugin'));
    }
}

async function setupCommonUI(targetDir: string): Promise<void> {
    try {
        const fxmanifestPath = join(targetDir, 'fxmanifest.json');
        if (existsSync(fxmanifestPath)) {
            const raw = readFileSync(fxmanifestPath, 'utf-8');

            const indentMatch = /\n(\s+)"/.exec(raw);
            const detectedIndent = indentMatch ? indentMatch[1] : '  ';

            const manifest = JSON.parse(raw);
            manifest.ui_page = 'web/dist/index.html';
            manifest.ui_page_dev = 'http://localhost:3000';

            const requiredFiles = ['web/dist/index.html', 'web/dist/**/*'];
            const currentFiles: string[] = Array.isArray(manifest.files) ? manifest.files : [];
            for (const entry of requiredFiles) {
                if (!currentFiles.includes(entry)) {
                    currentFiles.push(entry);
                }
            }
            manifest.files = currentFiles;

            const spaceCount = detectedIndent.startsWith('\t') ? undefined : detectedIndent.length;
            const output =
                spaceCount !== undefined
                    ? JSON.stringify(manifest, null, spaceCount)
                    : JSON.stringify(manifest, null, '\t');

            writeFileSync(fxmanifestPath, `${output}\n`, 'utf-8');
        }
    } catch {
        console.log(kleur.yellow('⚠️ Could not update fxmanifest.json with UI entries'));
    }

    try {
        const webDir = join(targetDir, 'web');
        const appPath = join(webDir, 'tsconfig.app.json');
        if (existsSync(appPath)) {
            const raw = readFileSync(appPath, 'utf-8');
            const cleaned = raw.replace(/"([^"\\]|\\.)*"|\/\*[\s\S]*?\*\//g, (m) => (m.startsWith('/*') ? '' : m));
            const tsconfig = JSON.parse(cleaned);

            tsconfig.compilerOptions = tsconfig.compilerOptions || {};
            tsconfig.compilerOptions.baseUrl = '.';
            tsconfig.compilerOptions.paths = tsconfig.compilerOptions.paths || {};
            tsconfig.compilerOptions.paths['@commonTypes/*'] = ['../src/common/types/*'];

            const includeEntry = '../src/common/types/*.ts';
            if (Array.isArray(tsconfig.include)) {
                if (!tsconfig.include.includes(includeEntry)) {
                    tsconfig.include.push(includeEntry);
                }
            }

            writeFileSync(appPath, `${JSON.stringify(tsconfig, null, 2)}\n`, 'utf-8');
        } else {
            console.log(kleur.yellow(`⚠️ tsconfig.app.json not found at: ${appPath}`));
        }
    } catch {
        console.log(kleur.yellow('⚠️ Failed to update web/tsconfig.app.json'));
    }
}
