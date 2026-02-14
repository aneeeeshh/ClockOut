import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Simple time endpoint to help with IST calculations if needed
  app.get(api.time.get.path, (_req, res) => {
    const now = new Date();
    res.json({
      iso: now.toISOString(),
      ist: now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    });
  });

  return httpServer;
}
