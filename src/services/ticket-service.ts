import { EventModel } from "../models/event-model";
import { TicketModel, TicketStatus } from "../models/ticket-model";

export class TicketService {
  async createMany(data: {
    eventId: number;
    numTickets: number;
    price: number;
  }) {
    const { eventId, numTickets, price } = data;
    const event = await EventModel.FindById(eventId);

    if (!event) {
      throw new Error("Event not Found");
    }

    const ticketsData = Array(data.numTickets)
      .fill({})
      .map((_, index) => ({
        location: `Location ${index}`,
        event_id: event.id,
        price,
        status: TicketStatus.available,
      }));

    await TicketModel.createMany(ticketsData);
  }

  async findByEventId(eventId: number) {
    const event = await EventModel.FindById(eventId);

    if (!event) {
      throw new Error("Event not Found");
    }

    return TicketModel.findAll({ where: { event_id: eventId } });
  }

  async findById(eventId: number, id: number) {
    const ticket = await TicketModel.findOne(id);
    return ticket && ticket.event_id === eventId ? ticket : null;
  }
}
