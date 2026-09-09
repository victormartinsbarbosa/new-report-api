import { NewReportException } from "./new-report-exception.js";

export class ResourceNotFoundException extends NewReportException {
  constructor(resourceName: string, identifier?: string) {
    const message = identifier
      ? `${resourceName} com o identificador '${identifier}' não foi encontrado.`
      : `${resourceName} não encontrado.`;

    super(message, 404, "NOT_FOUND");
  }
}
