import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Database } from "../database";
import { UserModel } from "./user-model";

export class PartnerModel {
  id: number;
  user_id: number;
  company_name: string;
  created_at: Date;
  user?: UserModel;

  constructor(data: Partial<PartnerModel> = {}) {
    this.fill(data);
  }

  static async create(
    data: { userId: number; companyName: string },
    options?: { connection?: PoolConnection }
  ): Promise<PartnerModel> {
    const { userId, companyName } = data;
    const createdAt = new Date();
    const db = options?.connection ?? Database.getInstance();
    const [partnersResult] = await db.execute<ResultSetHeader>(
      "INSERT INTO partners (user_id, company_name, created_at) VALUES (?, ?, ?)",
      [userId, companyName, createdAt]
    );

    return new PartnerModel({
      ...data,
      id: partnersResult.insertId,
      created_at: createdAt,
    });
  }

  static async findById(
    partnerId: number,
    options?: { user?: boolean }
  ): Promise<PartnerModel | null> {
    const connection = Database.getInstance();

    let query = "SELECT * FROM partners WHERE id = ?";
    if (options?.user) {
      query =
        "SELECT p.*, users.id as user_id, users.name as user_name, users.email as user_email FROM partners p JOIN users ON p.user_id = users.id WHERE p.id = ?";
    }

    const [rows] = await connection.execute<RowDataPacket[]>(query, [
      partnerId,
    ]);

    if (rows.length === 0) return null;

    const partner = new PartnerModel(rows[0] as PartnerModel);

    if (options?.user) {
      partner.user = new UserModel({
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email,
      });
    }

    return partner;
  }

  static async findByUserId(
    userId: number,
    options?: { user?: boolean }
  ): Promise<PartnerModel | null> {
    const connection = Database.getInstance();

    let query = "SELECT * FROM partners WHERE user_id = ?";
    if (options?.user) {
      query =
        "SELECT p.*, users.id as user_id, users.name as user_name, users.email as user_email FROM partners p JOIN users ON p.user_id = users.id WHERE p.user_id = ?";
    }

    const [rows] = await connection.execute<RowDataPacket[]>(query, [userId]);

    if (rows.length === 0) return null;

    const partner = new PartnerModel(rows[0] as PartnerModel);

    if (options?.user) {
      partner.user = new UserModel({
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email,
      });
    }

    return partner;
  }

  static async findAll(): Promise<PartnerModel[]> {
    const connection = Database.getInstance();
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM partners"
    );
    return rows.map((row) => new PartnerModel(row as PartnerModel));
  }

  async update(): Promise<void> {
    const connection = Database.getInstance();
    const [updateResult] = await connection.execute<ResultSetHeader>(
      "UPDATE patners SET user_id = ?, company_name = ?, WHERE id = ?",
      [this.user_id, this.company_name, this.id]
    );
    if (updateResult.affectedRows === 0) {
      throw new Error("Update fail");
    }
  }

  async delete(): Promise<void> {
    const connection = Database.getInstance();
    const [deleteResult] = await connection.execute<ResultSetHeader>(
      "DELETE FROM partners WHERE id = ?",
      [this.id]
    );
    if (deleteResult.affectedRows === 0) {
      throw new Error("Partner not found");
    }
  }

  fill(data: Partial<PartnerModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.user_id !== undefined) this.user_id = data.user_id;
    if (data.company_name !== undefined) this.company_name = data.company_name;
    if (data.created_at !== undefined) this.created_at = data.created_at;
  }
}
