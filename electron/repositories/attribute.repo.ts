import { CoreRepo } from "./core.repo";
import { Attribute } from "../models";

export class AttributeRepo extends CoreRepo<Attribute> {
  constructor() {
    super(Attribute);
  }
}
