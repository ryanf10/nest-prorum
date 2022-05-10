import {
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
  UnprocessableEntityException,
  ValidationError,
} from '@nestjs/common';

@Injectable()
export class ValidateInputPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(validationErrors);
      },
    });
  }
  public async transform(value, metadata: ArgumentMetadata) {
    try {
      return await super.transform(value, metadata);
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw new UnprocessableEntityException(
          this.handleError(e.getResponse()),
        );
      }
    }
  }

  private handleError(errors) {
    const { message, error, ...errorResponse } = errors;
    errorResponse['message'] = error;
    errorResponse['errors'] = {};
    errors.message.forEach((error) => {
      errorResponse['errors'][error.property] = [];
      for (const [key, value] of Object.entries(error.constraints)) {
        errorResponse['errors'][error.property].push(value);
      }
    });

    return errorResponse;
  }
}
