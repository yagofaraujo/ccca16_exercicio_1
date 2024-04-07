import { HttpCodes } from '../constants/httpCodes';
import { BaseError } from './base-error';

export class UnprocessableContent extends BaseError {
  constructor(message: string) {
    super(message, HttpCodes.UNPROCESSABLE_CONTENT);
  }
}
