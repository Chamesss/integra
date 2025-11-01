import { CoreRepo } from "./core.repo";
import { Client } from "../models";

export class ClientRepo extends CoreRepo<Client> {
  constructor() {
    super(Client);
  }
}
