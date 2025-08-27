export interface PackageManager {
    name: string;
    command: string;
    installCmd: string;
    devFlag: string;
    execCommand: string;
}

export const PACKAGE_MANAGERS: PackageManager[] = [
    { name: 'npm', command: 'npm', installCmd: 'npm install', devFlag: '--save-dev', execCommand: 'npx' },
    { name: 'pnpm', command: 'pnpm', installCmd: 'pnpm install', devFlag: '--save-dev', execCommand: 'pnpm' },
    { name: 'yarn', command: 'yarn', installCmd: 'yarn install', devFlag: '--dev', execCommand: 'yarn' },
    { name: 'bun', command: 'bun', installCmd: 'bun install', devFlag: '--dev', execCommand: 'bunx' },
];

export const DEV_DEPENDENCIES = [
    '@citizenfx/client@latest',
    '@citizenfx/server@latest',
    'typescript@latest',
    '@types/node@latest',
    '@tfxhub/builder@latest',
];

export const DEPENDENCIES = ['@nativewrappers/fivem@latest', '@nativewrappers/server@latest'];

export interface FormatterLinterTool {
    id: string;
    name: string;
    description: string;
    dependencies: string[];
    scripts: {
        format?: string;
        lint?: string;
    };
    configFiles: string[];
}

export const FORMATTER_LINTER_TOOLS: FormatterLinterTool[] = [
    {
        id: 'biomejs',
        name: 'Biome.js',
        description: 'All-in-one formatter and linter (recommended)',
        dependencies: ['@biomejs/biome@latest'],
        scripts: {
            format: 'biome format --write',
            lint: 'biome lint --write',
        },
        configFiles: ['biome.json'],
    },
    {
        id: 'prettier',
        name: 'Prettier',
        description: 'Code formatter',
        dependencies: ['prettier@latest'],
        scripts: {
            format: 'prettier --write "src/**/*.{ts,js,json}"',
        },
        configFiles: ['.prettierrc.json', '.prettierignore'],
    },
];
