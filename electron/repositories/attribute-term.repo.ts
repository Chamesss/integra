import { CoreRepo } from "./core.repo";
import { AttributeTerm } from "../models";

export class AttributeTermRepo extends CoreRepo<AttributeTerm> {
  constructor() {
    super(AttributeTerm);
  }
}
