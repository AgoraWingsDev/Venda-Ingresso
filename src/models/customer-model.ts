import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Database } from "../database";
import { UserModel } from "./user-model";

export class CustomerModel {
  id: number;
  address: string;
  phone: string;
  created_at: Date;
  user_id: number;
  user?: UserModel;

  constructor(data: Partial<CustomerModel> = {}) {
    this.fill(data);
  }

  static async create(
    data: {
      address: string;
      phone: string;
      user_id: number;
    },
    options?: { connection?: PoolConnection }
  ): Promise<CustomerModel> {
    const { address, phone, user_id } = data;
    const db = options?.connection ?? Database.getInstance();
    const createdAt = new Date();

    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO customers (user_id, address, phone, created_at) VALUES (?, ?, ?, ?)",
      [user_id, address, phone, createdAt]
    );

    return new CustomerModel({
      ...data,
      id: result.insertId,
      created_at: createdAt,
    });
  }

  static async findById(
    customerId: number,
    options?: { user?: boolean }
  ): Promise<CustomerModel | null> {
    const connection = Database.getInstance();

    let query = "SELECT * FROM customers WHERE id = ?";
    if (options?.user) {
      query =
        "SELECT c.*, users.id as user_id, users.name as user_name, users.email as user_email FROM customers c JOIN users ON c.user_id = users.id WHERE c.id = ?";
    }

    const [rows] = await connection.execute<RowDataPacket[]>(query, [
      customerId,
    ]);

    if (rows.length === 0) return null;

    const customer = new CustomerModel(rows[0] as CustomerModel);

    if (options?.user) {
      customer.user = new UserModel({
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email,
      });
    }

    return customer;
  }

  static async findByUserId(
    userId: number,
    options?: { user: boolean }
  ): Promise<CustomerModel | null> {
    const connection = Database.getInstance();

    let query = "SELECT * FROM customers WHERE user_id = ?";
    if (options?.user) {
      query =
        "SELECT c.*, users.id as user_id, users.name as user_name, users.email as user_email FROM customers c JOIN users ON c.user_id = users.id WHERE c.user_id = ?";
    }

    const [rows] = await connection.execute<RowDataPacket[]>(query, [userId]);

    if (rows.length === 0) return null;

    const customer = new CustomerModel(rows[0] as CustomerModel);

    if (options?.user) {
      customer.user = new UserModel({
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email,
      });
    }

    return customer;
  }

  static async findAll(): Promise<CustomerModel[]> {
    const connection = Database.getInstance();
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM customer"
    );
    return rows.map((row) => new CustomerModel(row as CustomerModel));
  }

  async update(): Promise<void> {
    const connection = Database.getInstance();
    const [updateResult] = await connection.execute<ResultSetHeader>(
      "UPDATE customers SET user_id = ?, address = ?, phone = ? WHERE id = ?",
      [this.user_id, this.address, this.phone, this.id]
    );
    if (updateResult.affectedRows === 0) {
      throw new Error("Update fail");
    }
  }

  async delete(): Promise<void> {
    const connection = Database.getInstance();
    const [deleteResult] = await connection.execute<ResultSetHeader>(
      "DELETE FROM customers WHERE id = ?",
      [this.id]
    );
    if (deleteResult.affectedRows === 0) {
      throw new Error("Customer not found");
    }
  }

  fill(data: Partial<CustomerModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.address !== undefined) this.address = data.address;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.created_at !== undefined) this.created_at = data.created_at;
    if (data.user_id !== undefined) this.user_id = data.user_id;
  }
}
