import { Router } from "express";
import { PartnerService } from "../services/partner-service";
import { EventService } from "../services/event-service";

export const partnerRoutes = Router();

partnerRoutes.post("/register", async (req, res) => {
  const { name, email, password, company_name } = req.body;

  const partnerService = new PartnerService();
  const register = await partnerService.register({
    name,
    email,
    password,
    company_name,
  });
  res.status(201).json(register);
});

partnerRoutes.post("/events", async (req, res) => {
  const { name, description, date, location } = req.body;
  const user = req.user!.id;

  const partnerService = new PartnerService();
  const partner = await partnerService.findByUserId(user);

  if (!partner) {
    res.status(403).json({ message: "Access unauthorized" });
    return;
  }

  const eventService = new EventService();
  const result = await eventService.create({
    name,
    description,
    date: new Date(date),
    location,
    partnerId: partner.id,
  });
  res.status(201).json(result);
});

partnerRoutes.get("/events", async (req, res) => {
  const user = req.user!.id;

  const partnerService = new PartnerService();
  const partner = await partnerService.findByUserId(user);

  if (!partner) {
    res.status(403).json({ message: "Access unauthorized" });
    return;
  }

  const eventService = new EventService();
  const result = await eventService.findAll(partner.id);
  res.json(result);
});

partnerRoutes.get("/event/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const user = req.user!.id;

  const partnerService = new PartnerService();
  const partner = await partnerService.findByUserId(user);

  if (!partner) {
    res.status(403).json({ message: "Access unauthorized" });
    return;
  }

  const eventService = new EventService();
  const event = await eventService.findOne(+eventId);

  if (!event || partner.id !== event.partner_id) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  res.json(event);
});
