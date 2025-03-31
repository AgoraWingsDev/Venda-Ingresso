import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import bcrypt from "bcrypt";
import { Database } from "../database";

export class UserModel {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;

  constructor(data: Partial<UserModel> = {}) {
    this.fill(data);
  }

  static async create(
    data: {
      name: string;
      email: string;
      password: string;
    },
    options?: { connection?: PoolConnection }
  ): Promise<UserModel> {
    const { name, email, password } = data;
    const db = options?.connection ?? Database.getInstance();
    const created_at = new Date();
    console.log("== User Create ==", name, email, password, created_at);

    const hashedPassword = UserModel.hashPassword(password);
    const [userResult] = await db.execute<ResultSetHeader>(
      "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, created_at]
    );

    return new UserModel({
      ...data,
      id: userResult.insertId,
      password: hashedPassword,
      created_at,
    });
  }

  async update(): Promise<void> {
    const connection = Database.getInstance();
    const [updateResult] = await connection.execute<ResultSetHeader>(
      "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?",
      [this.name, this.email, this.password, this.id]
    );
    if (updateResult.affectedRows === 0) {
      throw new Error("Update fail");
    }
  }

  async delete(): Promise<void> {
    const connection = Database.getInstance();
    const [deleteResult] = await connection.execute<ResultSetHeader>(
      "DELETE FROM users WHERE id = ?",
      [this.id]
    );
    if (deleteResult.affectedRows === 0) {
      throw new Error("User not found");
    }
  }

  static async findById(userId: number): Promise<UserModel | null> {
    const connection = Database.getInstance();

    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );
    return rows.length ? new UserModel(rows[0] as UserModel) : null;
  }

  static async findByEmail(email: string): Promise<UserModel | null> {
    const connection = Database.getInstance();

    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows.length ? new UserModel(rows[0] as UserModel) : null;
  }

  static async findAll(): Promise<UserModel[]> {
    const connection = Database.getInstance();

    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM users"
    );
    return rows.map((row) => new UserModel(row as UserModel));
  }

  static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  static comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  fill(data: Partial<UserModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.name !== undefined) this.name = data.name;
    if (data.email !== undefined) this.email = data.email;
    if (data.password !== undefined) this.password = data.password;
    if (data.created_at !== undefined) this.created_at = data.created_at;
  }
}
