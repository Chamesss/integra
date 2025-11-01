import { CoreRepo } from "./core.repo";
import { Employee } from "../models/employee";

export class EmployeeRepo extends CoreRepo<Employee> {
  constructor() {
    super(Employee);
  }
}
