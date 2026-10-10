# Contributing Guidelines

Thank you for contributing to Blog CMS! Please follow these team guidelines to keep the codebase clean, consistent, and reliable.

## Branch Naming Conventions

Always create a new branch from `main` or your feature base:

- `feat/<feature-name>`: For new features (e.g., `feat/categories`, `feat/admin-auth`)
- `fix/<bug-name>`: For bug fixes (e.g., `fix/slug-collision`)
- `chore/<task-name>`: For maintenance, setup, and dependencies (e.g., `chore/project-setup`)

## Commit Messages (Conventional Commits)

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat: add categories CRUD API and admin manager`
- `fix: resolve hydration warning on theme switcher`
- `chore: update dependencies and configuration`
- `docs: update setup instructions in README`

## Neon Database Branching

- Each developer must use their **own dedicated Neon branch** during local development to avoid conflicting schema changes and migrations.
- Test migrations locally on your Neon branch before pushing.
- **IMPORTANT**: Always notify your teammate before making changes to `prisma/schema.prisma`.

## Pull Requests & Code Review

1. Keep pull requests focused on a single feature or fix.
2. Ensure `npm run lint`, `npm run typecheck`, and `npm run build` all pass locally before opening a PR.
3. Every pull request must be reviewed and approved by the other teammate before merging to `main`.
