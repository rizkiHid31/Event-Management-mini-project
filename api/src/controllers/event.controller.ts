import type { NextFunction, Request, Response } from "express";
import {
  createEventService,
  getEventsService,
  getEventBySlugService,
  getEventByIdService,
  updateEventService,
  deleteEventService,
  getOrganizerEventsService,
  getOrganizerStatsService,
  getOrganizerChartService,
  getEventAttendeesService,
} from "../services/event.service.js";

export async function createEventController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const file = req.file as Express.Multer.File | undefined;
    const event = await createEventService(req.user!.id, req.body, file);
    res.status(201).json({ message: "Event Created", data: event });
  } catch (error) {
    next(error);
  }
}

export async function getEventsController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const result = await getEventsService(req.query as Record<string, unknown>);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getEventBySlugController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const event = await getEventBySlugService(req.params.slug as string);
    res.status(200).json({ data: event });
  } catch (error) {
    next(error);
  }
}

export async function getEventByIdController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const event = await getEventByIdService(Number(req.params.id));
    res.status(200).json({ data: event });
  } catch (error) {
    next(error);
  }
}

export async function updateEventController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const file = req.file as Express.Multer.File | undefined;
    const event = await updateEventService(
      Number(req.params.id), req.user!.id, req.body, file,
    );
    res.status(200).json({ message: "Event Updated", data: event });
  } catch (error) {
    next(error);
  }
}

export async function deleteEventController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const result = await deleteEventService(Number(req.params.id), req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getOrganizerEventsController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const events = await getOrganizerEventsService(req.user!.id);
    res.status(200).json({ data: events });
  } catch (error) {
    next(error);
  }
}

export async function getOrganizerStatsController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const stats = await getOrganizerStatsService(req.user!.id);
    res.status(200).json({ data: stats });
  } catch (error) {
    next(error);
  }
}

export async function getOrganizerChartController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const groupBy = (req.query.groupBy as string) || "month";
    const data = await getOrganizerChartService(req.user!.id, groupBy);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getEventAttendeesController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const attendees = await getEventAttendeesService(Number(req.params.eventId), req.user!.id);
    res.status(200).json({ data: attendees });
  } catch (error) {
    next(error);
  }
}
