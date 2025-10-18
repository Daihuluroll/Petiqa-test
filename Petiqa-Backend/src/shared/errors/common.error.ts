import { HttpStatus } from '@nestjs/common';

export const CommonError = {
  COMMON: {
    INVALID: {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'COMMON.INVALID',
      message: 'Unable to process the request.',
    },
  },

  PETIQA: {
    INVALID_DOCUMENT: {
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: 'PETIQA.INVALID_PET',
      message: 'Invalid pet payload.',
    },
    PET_ALREADY_EXISTS: {
      statusCode: HttpStatus.CONFLICT,
      errorCode: 'PETIQA.PET_ALREADY_EXISTS',
      message: 'Pet already exists.',
    },
    PET_NOT_FOUND: {
      statusCode: HttpStatus.NOT_FOUND,
      errorCode: 'PETIQA.PET_NOT_FOUND',
      message: 'Pet not found.',
    },
    TASK_NOT_FOUND: {
      statusCode: HttpStatus.NOT_FOUND,
      errorCode: 'PETIQA.TASK_NOT_FOUND',
      message: 'Task not found.',
    },
    NO_STATUS_UPDATES: {
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: 'PETIQA.NO_STATUS_UPDATES',
      message: 'No status updates provided.',
    },
    NO_WALLET_UPDATES: {
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: 'PETIQA.NO_WALLET_UPDATES',
      message: 'No wallet updates provided.',
    },
    INVENTORY_NEGATIVE_DELTA: {
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: 'PETIQA.INVENTORY_NEGATIVE_DELTA',
      message: 'Inventory adjustment would result in negative quantity.',
    },
    INVALID_IDENTIFIER: {
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: 'PETIQA.INVALID_IDENTIFIER',
      message: 'Invalid identifier supplied.',
    },
  },
} as const;

export type CommonErrorType = typeof CommonError;
