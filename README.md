# create-fivem-res

- Create FiveM resources in seconds with TypeScript. `create-fivem-res` scaffolds a batteries‑included TypeScript setup for client, server, typed natives, smart logging, and a zero‑config build.
- Add a web UI powered by React, Vue, or Svelte with Vite HMR and fully typed Client ↔ NUI messaging, all from a single dev command.

## Usage

### Quick Start (Recommended)

Go to your server resources folder and run:

```bash
npx create-fivem-res my-awesome-resource
```

or

```bash
npx create fivem-res my-awesome-resource
```

or

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

1. Create a new directory named `my-awesome-resource` with boilerplate code for your TS resource.
2. Prompt you to choose your preferred package manager (npm, pnpm, yarn, or bun).
3. Prompt you to choose a framework for building the UI (React, Vue, or Svelte).
4. Prompt you to choose optional features (Prettier, Tailwind CSS for UI).
5. Install all required dependencies and build the project.

## Project Structure

```
my-awesome-resource/
├── fxmanifest.json          # Build source for manifest (fxmanifest.lua is generated from this file)
├── package.json             # Project dependencies and scripts
├── src/
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

└── web/                     # Present if a UI framework is selected
│   └── react | vue | svelte/
│       ├── src/
│       │   ├── App.(tsx|vue|svelte)   # UI entry
│       │   ├── lib/
│       │   │   └── fivem.ts           # UI ↔ Client helpers (on/request)
│       │   ├── fivem.d.ts             # In-game NUI globals/types
│       │   └── styles (index.css | app.css | style.css)
│       └── vite.config.ts             # Vite configuration

# Generated after build:
# dist/client.js, dist/server.js, fxmanifest.lua
```

## What It Does

- **You write TypeScript** in `src/client`, `src/server` and `src/common`.
- It uses a custom-made **builder (`tfxb`)** to compile your `.ts` files into plain JavaScript in `dist/` and **generates `fxmanifest.lua`** from your `fxmanifest.json` + `package.json`, that will be used by FiveM.
- It adds a **UI framework** (React, Vue, or Svelte) if selected during installation. It also comes with a type-safe way of communicating with it: Client → NUI, NUI → Client (more information below).
- **DEV mode** (`npm run dev`) watches your files and rebuilds automatically. If a UI framework is present, it will also run a Vite web server and include the URL as `ui_page` in `fxmanifest.lua`, to allow HMR capabilities. All this in a single dev command! After rebuilding client/server files, make sure to **restart your resource**.
- **Natives are typed** via `@nativewrappers/fivem`. You call natives like you normally do, but now your editor tells you the correct parameters and warns on mistakes.
- **Logging** uses `log.error|warn|info|debug|trace`. Set `env` in `fxmanifest.json` to `dev` for verbose logs or `prod` for quieter logs.

### UI interaction (Client ↔ NUI)

- **Define your types**: Add your event names and payload/response types in `src/common/types/nui.ts`. You'll notice the payload and response/request types will be automatically inferred from client and the UI. Check the included example to see the full flow.
- **Client → NUI (one-way events)**: From `src/client`, send UI events with `nui.send(event, payload)`. In the web app, subscribe with `fivem.on(event, handler)` to receive/listen for the events.
- **NUI → Client (request/response)**: In the web app, call `fivem.request(event, data)`. In `src/client`, handle it with `nui.onRequest(event, handler)` and return a JSON response. Both sides are fully typed via the shared NUI types.
- **Dev experience**: During `npm run dev`, Vite serves the web UI and the resource sets `ui_page` to the dev server for instant HMR. Production builds will reference the bundled dist files instead.

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
npm run format
```

## Requirements

- Node.js >= 22.10.0
- One of the following package managers: npm, pnpm, yarn, or bun
- Optional but recommended: git

## License

MIT
