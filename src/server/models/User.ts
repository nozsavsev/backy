import { v4 as uuidv4 } from "uuid";

export default class User {
  public id: string = uuidv4();
  public name: string | null = null;
}
