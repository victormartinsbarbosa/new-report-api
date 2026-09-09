import { NewReportException } from "./new-report-exception.js";

export class ConflictException extends NewReportException {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}
