import { NewReportException } from "./new-report-exception.js";

export class UnauthorizedException extends NewReportException {
  constructor(message = "Não autorizado.") {
    super(message, 401, "UNAUTHORIZED");
  }
}
