# create-fivem-res

A CLI tool to quickly scaffold new FiveM resources with TypeScript.

## Features

- **Speedy compilation**: Uses `@tfxhub/builder` (esbuild under the hood) for fast builds.
- **Type-safe FiveM natives**: `@nativewrappers/fivem` gives full TypeScript types, IntelliSense, and runtime safety for FiveM/GTA V natives.
- **Auto fxmanifest.lua generation**: Built automatically from your `fxmanifest.json` and `package.json` during build.
- **Dev auto-build**: In dev mode, files are watched and rebuilt automatically (you still need to restart the resource in your server).
- **Logger helper**: Simple logger with levels that adapt to dev/prod based on the `env` value in `fxmanifest.json`.

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
4. Prompt you to choose optional features.
5. Install all required dependencies
6. Set up the project with proper TypeScript configuration

## Project Structure

```
my-awesome-resource/
├── fxmanifest.json          # Build source for manifest (fxmanifest.lua is generated)
├── package.json             # Project dependencies and scripts
└── src/
    ├── tsconfig.json        # Base TS config
    ├── client/
    │   ├── index.ts         # Client entry
    │   └── tsconfig.json    # Client TS config
    ├── server/
    │   ├── index.ts         # Server entry
    │   └── tsconfig.json    # Server TS config
    └── common/
        ├── index.ts         # Shared code
        ├── tsconfig.json    # Shared TS config
        └── utils/
            ├── index.ts
            ├── env.ts       # Env helpers (dev/prod, client/server)
            └── logger.ts    # Logger with levels

# Generated after build:
# dist/client.js, dist/server.js, fxmanifest.lua
```

## How it works (for Lua users)

- **You write TypeScript** in `src/client`, `src/server` and `src/common`.
- The **builder (`tfxb`) compiles** your `.ts` files into plain JavaScript in `dist/` and **generates `fxmanifest.lua`** from your `fxmanifest.json` and `package.json`.
- **Dev mode** (`npm run dev`) watches your files and rebuilds automatically. After a rebuild, **restart your resource** in the server console (e.g., `restart my-awesome-resource`).
- **Natives are typed** via `@nativewrappers/fivem`. You call natives like you normally do, but now your editor tells you the correct parameters and warns on mistakes.
- **Logging** uses `log.error|warn|info|debug|trace`. Set `env` in `fxmanifest.json` to `dev` for verbose logs or `prod` for quieter logs.

````

## Development

After creating your resource:

```bash
cd my-awesome-resource

# Start development mode (watches for changes)
npm run dev
# or pnpm run dev, yarn dev, bun run dev

# Build for production
npm run build

# Generate types
npm run types

# Format code
npm run format # if using Biome.js or Prettier

# Lint code
npm run lint # if using Biome.js (ESLint not supported by this CLI)
````

## Requirements

- Node.js >= 22.0.0
- One of the following package managers: npm, pnpm, yarn, or bun

## License

MIT
