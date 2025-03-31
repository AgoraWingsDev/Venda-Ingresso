import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Database } from "../database";

export enum PurchaseStatus {
  pending = "pending",
  paid = "paid",
  error = "error",
  cancelled = "cancelled",
}

export class PurchaseModel {
  id: number;
  purchase_date: Date;
  total_amount: number;
  status: PurchaseStatus;
  customer_id: number;

  constructor(data: Partial<PurchaseModel> = {}) {
    this.fill(data);
  }

  static async create(
    data: {
      total_amount: number;
      status: PurchaseStatus;
      customer_id: number;
    },
    options?: { connection?: PoolConnection }
  ): Promise<PurchaseModel> {
    const { total_amount, status, customer_id } = data;
    const db = options?.connection ?? Database.getInstance();
    const purchaseDate = new Date();
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO purchases (purchase_date, total_amount, status, customer_id) VALUES (?, ?, ?, ?)",
      [purchaseDate, total_amount, status, customer_id]
    );

    return new PurchaseModel({
      ...data,
      id: result.insertId,
      purchase_date: purchaseDate,
    });
  }

  static async findById(purchaseId: number): Promise<PurchaseModel | null> {
    const connection = Database.getInstance();
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM purchases WHERE id = ?",
      [purchaseId]
    );

    return rows.length ? new PurchaseModel(rows[0] as PurchaseModel) : null;
  }

  static async findAll(): Promise<PurchaseModel[]> {
    const connection = Database.getInstance();
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM purchases"
    );

    return rows.map((row) => new PurchaseModel(row as PurchaseModel));
  }

  async update(options?: { connection?: PoolConnection }): Promise<void> {
    const db = options?.connection ?? Database.getInstance();
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE purchases SET purchase_date = ?, total_amount = ?, status = ? WHERE id = ?",
      [this.purchase_date, this.total_amount, this.status, this.id]
    );
    if (result.affectedRows === 0) {
      throw new Error("Purchase not found");
    }
  }

  async delete(): Promise<void> {
    const db = Database.getInstance();
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM purchases WHERE id = ?",
      [this.id]
    );
    if (result.affectedRows === 0) {
      throw new Error("Purchase not found");
    }
  }

  fill(data: Partial<PurchaseModel>) {
    if (data.id !== undefined) this.id = data.id;
    if (data.purchase_date !== undefined)
      this.purchase_date = data.purchase_date;
    if (data.total_amount !== undefined) this.total_amount = data.total_amount;
    if (data.status !== undefined) this.status = data.status;
    if (data.customer_id !== undefined) this.customer_id = data.customer_id;
  }
}
