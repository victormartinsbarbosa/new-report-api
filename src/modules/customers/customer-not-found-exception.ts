import { ResourceNotFoundException } from "../../exceptions/resource-not-found-exception.js";

export class CustomerNotFoundException extends ResourceNotFoundException {
  constructor(id?: string) {
    super("Cliente", id);
  }
}
