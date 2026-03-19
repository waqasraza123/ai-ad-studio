
Contributing to AI Ad Studio

Thanks for contributing.

Before you start

Please read:

README.md

CODE_OF_CONDUCT.md

SECURITY.md

SUPPORT.md

For larger changes, open an issue first so the implementation direction can be aligned before work starts.

What good contributions look like

We prefer contributions that are:

production-grade

modular

strongly typed

validated properly

scoped to one clear problem

aligned with the existing architecture

Please avoid unrelated cleanup mixed into feature work.

Workflow

Fork the repository

Create a focused branch

Make one cohesive change

Run the full check suite

Open a pull request with a clear description

Example branch names:

feat/batch-review-filtering

fix/export-delivery-state

chore/readme-community-files

Quality bar

Before opening a pull request, run:

pnpm lint

pnpm typecheck

pnpm test

pnpm build

If your change touches runtime flows, also verify the affected app locally:

pnpm --filter @ai-ad-studio/web dev

pnpm --filter @ai-ad-studio/worker dev

Development standards

Coding expectations

use descriptive names

keep functions small and readable

prefer reusable modules over large multi-purpose files

avoid tight coupling

avoid hardcoded values when configuration belongs elsewhere

do not introduce dead code, silent failures, or speculative abstractions

do not commit secrets, tokens, or private environment files

Pull requests

A strong pull request includes:

clear problem statement

concise implementation summary

screenshots for UI changes

notes about data model or workflow changes

exact verification steps

Commit messages should stay short and meaningful.

Documentation

Update docs when you change:

public behavior

workflow states

environment setup

repository structure

contributor expectations

Security

Do not open a public issue for a security vulnerability. Follow SECURITY.md.

