# Weather App - Full Stack Home Assignment

## Development Log

### [feature/init-setup] Project Scaffolding

- **Architecture:** Initialized a Monorepo containing `/client` and `/server` for streamlined local development and unified version control.
- **Client:** Scaffolded with Vite + React + TypeScript + SWC for fast builds. Configured ESLint for code quality.
- **Server:** Initialized a Node.js Express server with TypeScript (`ts-node`) for end-to-end type safety.
- **Root Configuration:** Added a global `.gitignore` (securing the `.env` API key) and a root `package.json` utilizing `concurrently` to run both client and server environments with a single command.
