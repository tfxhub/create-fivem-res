export interface PackageManager {
    name: string;
    command: string;
    installCmd: string;
    devFlag: string;
    execCommand: string;
}

export const PACKAGE_MANAGERS: PackageManager[] = [
    {
        name: 'npm',
        command: 'npm',
        installCmd: 'npm install',
        devFlag: '--save-dev',
        execCommand: 'npx',
    },
    {
        name: 'pnpm',
        command: 'pnpm',
        installCmd: 'pnpm install',
        devFlag: '--save-dev',
        execCommand: 'pnpm exec',
    },
    {
        name: 'yarn',
        command: 'yarn',
        installCmd: 'yarn install',
        devFlag: '--dev',
        execCommand: 'yarn',
    },
    {
        name: 'bun',
        command: 'bun',
        installCmd: 'bun install',
        devFlag: '--dev',
        execCommand: 'bunx',
    },
];

export const DEV_DEPENDENCIES = [
    '@citizenfx/client@latest',
    '@citizenfx/server@latest',
    'typescript@latest',
    '@types/node@latest',
    '@tfxhub/builder@latest',
];

export const DEPENDENCIES = ['@nativewrappers/fivem@latest', '@nativewrappers/server@latest'];

export interface OptionalFeature {
    id: string;
    name: string;
    description: string;
    dependencies: string[];
    scripts?: {
        format?: string;
        lint?: string;
    };
    configFiles: string[];
    isUIrequired: boolean;
}

export const OPTIONAL_FEATURES: OptionalFeature[] = [
    {
        id: 'prettier',
        name: 'Prettier',
        description: 'Code formatter',
        dependencies: ['prettier'],
        scripts: {
            format: 'prettier --write .',
            lint: 'prettier --check .',
        },
        configFiles: ['.prettierrc', '.prettierignore', '.vscode'],
        isUIrequired: false,
    },
    {
        id: 'tailwind',
        name: 'Tailwind CSS',
        description: 'Utility-first CSS framework',
        dependencies: ['tailwindcss@3', 'postcss', 'autoprefixer'],
        configFiles: ['tailwind.config.js'],
        isUIrequired: true,
    },
];
