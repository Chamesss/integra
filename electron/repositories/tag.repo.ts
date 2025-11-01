import { CoreRepo } from "./core.repo";
import { Tag } from "../models";

export class TagRepo extends CoreRepo<Tag> {
  constructor() {
    super(Tag);
  }
}
