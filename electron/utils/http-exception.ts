export class HttpException extends Error {
  public status: number;
  public message: string;
  public details?: string;

  constructor(
    message: string = "An error occurred.",
    status: number = 500,
    details = ""
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.message = message;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      message: this.message,
      status: this.status,
      details: this.details,
    };
  }
}
