import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Database } from "../database";

export enum TicketStatus {
  available = "available",
  sold = "sold",
}

export class TicketModel {
  id: number;
  location: string;
  event_id: number;
  price: number;
  status: TicketStatus;
  created_at: Date;

  constructor(data: Partial<TicketModel> = {}) {
    this.fill(data);
  }

  static async create(data: {
    location: string;
    event_id: number;
    price: number;
    status: TicketStatus;
  }): Promise<TicketModel> {
    const { location, event_id, price, status } = data;
    const created_at = new Date();
    const db = Database.getInstance();
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO tickets (location, event_id, price, status, created_at) VALUES (?, ?, ?, ?, ?)",
      [location, event_id, price, status, created_at]
    );
    return new TicketModel({
      ...data,
      id: result.insertId,
      created_at,
    });
  }

  static async createMany(
    data: {
      location: string;
      event_id: number;
      price: number;
      status: TicketStatus;
    }[]
  ): Promise<TicketModel[]> {
    const created_at = new Date();
    const db = Database.getInstance();
    const values = Array(data.length).fill("(?, ?, ?, ?, ?)").join(", ");
    const params = data.reduce<(string | number | Date)[]>(
      (acc, ticket) => [
        ...acc,
        ticket.location,
        ticket.event_id,
        ticket.price,
        ticket.status,
        created_at,
      ],
      []
    );

    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO tickets (location, event_id, price, status, created_at) VALUES ${values}`,
      params
    );

    return data.map(
      (ticket, index) =>
        new TicketModel({
          ...ticket,
          id: result.insertId + index,
          created_at,
        })
    );
  }

  static async findOne(ticketId: number): Promise<TicketModel | null> {
    const connection = Database.getInstance();
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ?",
      [ticketId]
    );

    return rows.length ? new TicketModel(rows[0] as TicketModel) : null;
  }

  static async findAll(
    filter?: {
      where?: { event_id?: number; ids?: number[] };
    },
    options?: { connection?: PoolConnection }
  ): Promise<TicketModel[]> {
    const connection = options?.connection ?? Database.getInstance();
    let query = "SELECT * FROM tickets";
    const params = [];
    if (filter && filter.where) {
      const where = [];
      if (filter.where.event_id) {
        where.push("event_id = ?");
        params.push(filter.where.event_id);
      }
      if (filter.where.ids) {
        //using ? and params
        where.push(`id IN (${filter.where.ids.map(() => "?").join(", ")})`);
        params.push(...filter.where.ids);
      }
      query += ` WHERE ${where.join(" AND ")}`;
    }

    const [rows] = await connection.execute<RowDataPacket[]>(query, params);

    return rows.map((row) => new TicketModel(row as TicketModel));
  }

  async update(): Promise<void> {
    const db = Database.getInstance();
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE tickets SET location = ?, event_id = ?, price = ?, status = ? WHERE id = ?",
      [this.location, this.event_id, this.price, this.status, this.id]
    );
    if (result.affectedRows === 0) {
      throw new Error("Ticket not found");
    }
  }

  async delete(): Promise<void> {
    const db = Database.getInstance();
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM tickets WHERE id = ?",
      [this.id]
    );
    if (result.affectedRows === 0) {
      throw new Error("Ticket not found");
    }
  }

  fill(data: Partial<TicketModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.location !== undefined) this.location = data.location;
    if (data.event_id !== undefined) this.event_id = data.event_id;
    if (data.price !== undefined) this.price = data.price;
    if (data.status !== undefined) this.status = data.status;
    if (data.created_at !== undefined) this.created_at = data.created_at;
  }
}
