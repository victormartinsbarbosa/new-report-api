import { NewReportException } from "./new-report-exception.js";

export class BadRequestException extends NewReportException {
  constructor(message: string, details?: unknown) {
    super(message, 400, "BAD_REQUEST", details);
  }
}
