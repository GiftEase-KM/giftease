import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, occasionsTable } from "@workspace/db";
import {
  ListOccasionsResponse,
  CreateOccasionBody,
  UpdateOccasionParams,
  UpdateOccasionBody,
  UpdateOccasionResponse,
  DeleteOccasionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/occasions", async (_req, res): Promise<void> => {
  const occasions = await db.select().from(occasionsTable).orderBy(occasionsTable.date);
  res.json(ListOccasionsResponse.parse(occasions));
});

router.post("/occasions", async (req, res): Promise<void> => {
  const parsed = CreateOccasionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [occasion] = await db.insert(occasionsTable).values(parsed.data).returning();
  res.status(201).json(UpdateOccasionResponse.parse(occasion));
});

router.patch("/occasions/:id", async (req, res): Promise<void> => {
  const params = UpdateOccasionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOccasionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [occasion] = await db
    .update(occasionsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(occasionsTable.id, params.data.id))
    .returning();
  if (!occasion) {
    res.status(404).json({ error: "Occasion not found" });
    return;
  }
  res.json(UpdateOccasionResponse.parse(occasion));
});

router.delete("/occasions/:id", async (req, res): Promise<void> => {
  const params = DeleteOccasionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [occasion] = await db.delete(occasionsTable).where(eq(occasionsTable.id, params.data.id)).returning();
  if (!occasion) {
    res.status(404).json({ error: "Occasion not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
