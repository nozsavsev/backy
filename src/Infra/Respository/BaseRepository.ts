import { IDBModel } from "./BaseDBModel";

export class BaseRepository<T extends IDBModel> {
  protected databse: T[] = [];

  public GetById(id: string): T | undefined {
    return this.databse.find((item) => item.id === id);
  }

  public Query(
    filter: (item: T) => boolean,
    skip: number = 0,
    limit: number = 10
  ): T[] {
    return this.databse.filter(filter).slice(skip, skip + limit);
  }

  public Create(item: T): T {
    if (this.GetById(item.id)) {
      throw new DBError("ItemAlreadyExists");
    }

    this.databse.push(item);
    return item;
  }

  public Update(item: T): T {
    const index = this.databse.findIndex((i) => i.id === item.id);

    if (index !== -1) {
      this.databse[index] = item;
    } else {
      throw new DBError("ItemNotFound");
    }

    return item;
  }

  public Delete(id: string): void {
    const index = this.databse.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.databse.splice(index, 1);
    } else {
      throw new DBError("ItemNotFound");
    }
  }
}

export type DBErrorType = "ItemAlreadyExists" | "ItemNotFound";

export class DBError {
  public error: DBErrorType;

  constructor(error: DBErrorType) {
    this.error = error;
  }
}
