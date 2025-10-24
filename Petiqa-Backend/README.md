# Petiqa Backend

Standalone NestJS backend scaffold for the Petiqa service extracted from the Smile monorepo.

## Prerequisites
- Node.js >= 18
- Yarn (classic)

## Getting Started
```bash
yarn install
yarn start:dev
```

Create a `.env` file (see `.env.example`) with the database URI and any overrides you need.

## Configuration
- `PORT` – API port (default: `3000`)
- `GLOBAL_PREFIX` – Global route prefix (default: `petiqa`)
- `MONGODB_URI` – Mongo connection string (required)
- `ENABLE_SWAGGER` – Set to `true` to expose `/petiqa/docs`
- `SWAGGER_USER` / `SWAGGER_PASSWORD` – Basic auth credentials protecting Swagger when enabled

## Useful Scripts
- `yarn build` – compile TypeScript into `dist/`
- `yarn start:prod` – run the compiled application
- `yarn test` – execute unit tests
- `yarn lint` – run ESLint checks
- `yarn format` – check formatting with Prettier

## Project Structure
```
Petiqa-Backend/
├── src/
│   ├── app.module.ts
│   ├── config/
│   │   ├── configuration.ts
│   │   └── validation.ts
│   ├── pet/
│   ├── petiqa/
│   └── shared/
├── test/
│   └── app.module.spec.ts
├── .env.example
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── jest.config.js
├── .eslintrc.js
├── .prettierrc
└── .gitignore
```

This scaffold now includes the Petiqa modules and shared libraries. Upcoming work will focus on Dockerization, automated testing, and deployment tooling.
