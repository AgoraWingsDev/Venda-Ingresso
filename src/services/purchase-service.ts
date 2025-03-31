import { PurchaseModel, PurchaseStatus } from "../models/purchase-model";
import { TicketModel, TicketStatus } from "../models/ticket-model";
import { PurchaseTicketModel } from "../models/purchase-ticket-model";
import { PaymentService } from "./payment-service";
import { CustomerModel } from "../models/customer-model";
import {
  ReservationStatus,
  ReservationTicketModel,
} from "../models/reservation-ticket-model";
import { Database } from "../database";

export class PurchaseService {
  constructor(private paymentService: PaymentService) {}

  async create(data: {
    customerId: number;
    ticketIds: number[];
    cardToken: string;
  }): Promise<number> {
    const { customerId, ticketIds, cardToken } = data;
    const customer = await CustomerModel.findById(customerId, { user: true });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const tickets = await TicketModel.findAll({
      where: { ids: ticketIds },
    });

    console.log(tickets);

    if (tickets.length !== ticketIds.length) {
      throw new Error("One or more tickets not found");
    }

    if (tickets.some((ticket) => ticket.status !== TicketStatus.available)) {
      throw new Error("Some tickets not available");
    }

    const amount = tickets.reduce((acc, ticket) => acc + ticket.price, 0);

    const db = Database.getInstance();
    const connection = await db.getConnection();

    let purchase: PurchaseModel;
    try {
      await connection.beginTransaction();

      purchase = await PurchaseModel.create(
        {
          total_amount: amount,
          status: PurchaseStatus.pending,
          customer_id: customerId,
        },
        { connection }
      );

      await this.associateTicketsWithPurchase(
        purchase.id,
        ticketIds,
        connection
      );

      const tickets1 = await TicketModel.findAll({
        where: { ids: ticketIds },
      });

      console.log(tickets1);

      await connection.commit();
    } catch (error) {
      console.log(error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    try {
      await connection.beginTransaction();

      purchase.status = PurchaseStatus.paid;
      await purchase.update({ connection });

      await ReservationTicketModel.create(
        {
          customer_id: customerId,
          ticket_id: ticketIds[0],
          status: ReservationStatus.reserved,
        },
        { connection }
      );

      await this.paymentService.processPayment(
        {
          name: customer.user!.name,
          email: customer.user!.email,
          address: customer.address,
          phone: customer.phone,
        },
        purchase!.total_amount,
        cardToken
      );

      await connection.commit();
      return purchase.id;
    } catch (error) {
      console.log(error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async associateTicketsWithPurchase(
    purchaseId: number,
    ticketIds: number[],
    connection: any
  ): Promise<void> {
    const purchaseTickets = ticketIds.map((ticketId) => ({
      purchase_id: purchaseId,
      ticket_id: ticketId,
    }));
    await PurchaseTicketModel.createMany(purchaseTickets, { connection });
  }

  async finById(PurchaseId: number): Promise<PurchaseModel | null> {
    return await PurchaseModel.findById(PurchaseId);
  }
}
