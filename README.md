# create-fivem-res

A CLI tool to quickly scaffold new FiveM resources with TypeScript.

## Usage

### Quick Start (Recommended)
```bash
npx create-fivem-res my-awesome-resource
```
or

```bash
npx create fivem-res my-awesome-resource
```


### Alternative Methods

#### Global Installation
```bash
npm install -g create-fivem-res
create-fivem-res my-awesome-resource
```

#### Other Package Managers
```bash
# With pnpm
pnpm dlx create-fivem-res my-awesome-resource

# With yarn
yarn create fivem-res my-awesome-resource

# With bun
bunx create-fivem-res my-awesome-resource
```

This will:

1. Create a new directory named `my-awesome-resource`
2. Copy the FiveM TypeScript template files
3. Prompt you to choose a package manager (npm, pnpm, yarn, or bun)
4. Prompt you to choose a linter or formatter tool.
5. Install all required dependencies
6. Set up the project with proper TypeScript configuration

## Project Structure

```
my-awesome-resource/
├── fxmanifest.json          # FiveM resource manifest
└── src/
    ├── package.json         # Project dependencies and scripts
    ├── tsconfig.json        # Main TypeScript config
    ├── client/
    │   ├── index.ts         # Client-side entry point
    │   └── tsconfig.json    # Client TypeScript config
    ├── server/
    │   ├── index.ts         # Server-side entry point
    │   └── tsconfig.json    # Server TypeScript config
    └── common/
        ├── index.ts         # Shared code entry point
        ├── tsconfig.json    # Shared TypeScript config
        └── utils/
            ├── index.ts
            ├── env.ts       # Environment utilities
            └── logger.ts    # Logging utilities
```

## Development

After creating your resource:

```bash
cd my-awesome-resource/src

# Start development mode (watches for changes)
npm run dev
# or pnpm run dev, yarn dev, bun run dev

# Build for production
npm run build

# Generate types
npm run types

# Format code
npm run format #If using Biome.js or Prettier

# Lint code
npm run lint #If using Biome.js
```

## Requirements

- Node.js >= 22.0.0
- One of the following package managers: npm, pnpm, yarn, or bun

## License

MIT
