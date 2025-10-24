# Shared Library Migration Plan

This document captures every `libs/shared` import that the Petiqa service uses in the Smile monorepo and the
target location we will recreate inside the standalone Petiqa backend.

| Source (smile-aio) | Purpose | Proposed target (Petiqa-Backend) | Extra dependencies / notes |
| --- | --- | --- | --- |
| `libs/shared/service/log-util.service` | Nest-friendly logger wrapper with context helpers | `src/shared/services/log-util.service.ts` | Depends only on `@nestjs/common` |
| `libs/shared/service/unity-travel.service` | Heavy Unity integration client (unused in current Petiqa service) | _Exclude for now_ | Only migrate if future scope requires Unity flows. Relies on many other shared services, Config, Axios, trackers, etc. |
| `libs/shared/exception/custom.exception` & `libs/shared/exception/error.dto` | Company-standard HTTP exception envelope | `src/shared/exceptions/custom.exception.ts`, `src/shared/exceptions/error.dto.ts` | Requires `@nestjs/common`; imports `CommonError` |
| `libs/shared/error/common.error` | Central error catalogue | `src/shared/errors/common.error.ts` | Keep structure identical; ensure constants remain tree-shakeable |
| `libs/shared/mongo-schema/pet-profile.schema` | Pet profile schema + enums | `src/shared/mongo/pet-profile.schema.ts` | Needs `@nestjs/mongoose`, `mongoose`, `mongoose-paginate-v2` |
| `libs/shared/mongo-schema/pet-wallet-transaction.schema` | Wallet transaction schema | `src/shared/mongo/pet-wallet-transaction.schema.ts` | Requires same packages as above |
| `libs/shared/mongo-schema/pet-task-cycle.schema` | Task cycle schema | `src/shared/mongo/pet-task-cycle.schema.ts` | Requires same packages as above |
| `libs/shared/mongo-schema/pet-achievement-state.schema` | Achievement state schema | `src/shared/mongo/pet-achievement-state.schema.ts` | Requires same packages as above |
| `libs/shared/mongo-schema/pet-event-log.schema` | Event log schema | `src/shared/mongo/pet-event-log.schema.ts` | Requires same packages as above |
| `libs/shared/mongo-schema/pet-activity-log.schema` | Activity log schema | `src/shared/mongo/pet-activity-log.schema.ts` | Requires same packages as above |
| `libs/shared/interceptor/logging.interceptor` | Request logging with nanoid correlation | `src/shared/interceptors/logging.interceptor.ts` | Needs `nanoid`, `LogUtilService` |
| `libs/shared/interceptor/transform.interceptor` | Wrap responses in `{ data: … }` | `src/shared/interceptors/transform.interceptor.ts` | No extra deps |
| `libs/shared/guard/broker.guard` | Auth guard validating `broker-jwt` tokens | `src/shared/guards/broker.guard.ts` | Requires `@nestjs/passport`, `passport`, `passport-jwt`, and availability of a broker strategy. Decide whether to port or replace with simplified auth. |
| `libs/shared/decorator/app-id.decorator` | Extracts `x-app-id` header | `src/shared/decorators/app-id.decorator.ts` | Depends on `AppId` enum |
| `libs/shared/constant/api-id.enum` | Enumerates valid App IDs | `src/shared/constants/api-id.enum.ts` | None |
| `libs/shared/winston/logging` | Winston logger with OTEL transports | `src/shared/logging/winston.logger.ts` | Requires `nest-winston`, `winston`, `winston-daily-rotate-file`, multiple `@opentelemetry/*` packages. Consider slimming for MVP. |
| `libs/shared/index` & `libs/shared/shared.module` | Massive “shared” Nest module configuring many unrelated services | _Replace with project-specific `SharedModule`_ | Build a trimmed module that exposes only the log util and Mongoose models Petiqa needs. |

## Import Rewrite Examples

- `import { LogUtilService } from 'libs/shared/service/log-util.service';`  
  → `import { LogUtilService } from '../shared/services/log-util.service';`

- `import { PetProfile, PetProfileDocument } from 'libs/shared/mongo-schema/pet-profile.schema';`  
  → `import { PetProfile, PetProfileDocument } from '../shared/mongo/pet-profile.schema';`

- `import { SharedModule } from 'libs/shared';`  
  → `import { SharedModule } from '../shared/shared.module';` (new minimal module exporting providers + Mongoose schemas)

## Dependency Checklist (to be added to package.json)

- Runtime: `@nestjs/mongoose`, `@nestjs/passport`, `@nestjs/axios`, `class-transformer`, `class-validator`, `mongoose`, `mongoose-paginate-v2`, `nanoid`, `nest-winston`, `winston`, `winston-daily-rotate-file`, `helmet`, `express-basic-auth`, `passport`, `passport-jwt`
- Observability (if keeping OTEL logger/tracer): `@opentelemetry/api-logs`, `@opentelemetry/exporter-logs-otlp-http`, `@opentelemetry/resources`, `@opentelemetry/sdk-logs`, `@opentelemetry/auto-instrumentations-node`, `@opentelemetry/sdk-node`, `@opentelemetry/semantic-conventions`

If we decide to defer advanced logging/telemetry, we can replace `WLogger` and `tracer.ts` with simpler implementations and drop the OTEL packages.

## Outstanding Decisions

- **BrokerAuthGuard**: requires JWT strategies that are not yet part of the standalone project. Either port the strategy implementation or replace the guard with a basic API key/auth check for the MVP.
- **UnityTravelService**: currently unused; excluding it avoids pulling in dozens of additional dependencies. Revisit if future scope demands Unity integrations.
- **SharedModule Rebuild**: design a lean module that configures database connections (`MongooseModule.forRootAsync` + feature schemas) and exports `LogUtilService`, `LoggingInterceptor`, etc., without dragging unrelated services.
