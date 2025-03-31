import { Database } from "../database";
import { EventModel } from "../models/event-model";

export class EventService {
  async create(data: {
    name: string;
    description: string | null;
    date: Date;
    location: string;
    partnerId: number;
  }) {
    const { name, description, date, location, partnerId } = data;
    const connection = await Database.getInstance().getConnection();

    try {
      await connection.beginTransaction();

      const event = await EventModel.create({
        name,
        description,
        date,
        location,
        partner_id: partnerId,
      });

      await connection.commit();
      return {
        id: event.id,
        name,
        description,
        date,
        location,
        created_at: event.created_at,
        partner_id: partnerId,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  async findAll(partnerId?: number) {
    return EventModel.FindAll({ where: { partner_id: partnerId } });
  }

  async findOne(eventId: number) {
    return EventModel.FindById(eventId);
  }
}
