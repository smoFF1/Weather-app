# Full Stack Developer Home Assignment - Weather App

## Running Log & Decisions

### Step 1: Initial Environment Setup & Architecture

- **Decision:** Monorepo Structure.
  - **Why:** I decided to structure the project as a monorepo with distinct `client` (frontend) and `server` (backend) folders at the root. For a project of this scale (expected 8 hours), a monorepo is easier to manage, version control, and set up locally without juggling multiple repositories.
- **Decision:** Node.js + Express for Backend.
  - **Why:** Fulfills the requirement for a Node.js + Express API server. I also integrated TypeScript immediately (`ts-node`, `tsc --init`) to ensure type safety across the entire Full Stack architecture from day one.
- **Decision:** React + TypeScript via Vite for Frontend.
  - **Why:** Vite is currently the industry standard for scaffolding React + TS applications. It offers significantly faster build times and Hot Module Replacement (HMR) compared to Create React App (CRA).
- **Decision:** Linter Selection (ESLint).
  - **Why:** When prompted by Vite, I chose ESLint. Maintaining strict code cleanliness and preventing basic runtime errors is crucial. This will enforce good practices, especially regarding React Hooks (like `useEffect` dependency arrays).
- **Decision:** Git Workflow.
  - **Why:** Renamed the default branch to `main`. Created a `.gitignore` at the root level to ensure `node_modules` and sensitive data (like the `.env` file containing the OpenWeather API key) are never committed to version control. I am using a branching strategy (starting with `feature/init-setup`) to keep the `main` branch clean and stable, simulating a real-world agile development environment.
