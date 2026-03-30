import { Router, type IRouter } from "express";
import { eq, and, isNull } from "drizzle-orm";
import { db, giftsTable } from "@workspace/db";
import {
  ListGiftsQueryParams,
  ListGiftsResponse,
  CreateGiftBody,
  UpdateGiftParams,
  UpdateGiftBody,
  UpdateGiftResponse,
  DeleteGiftParams,
  ToggleGiftPurchasedParams,
  ToggleGiftPurchasedBody,
  ToggleGiftPurchasedResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/gifts", async (req, res): Promise<void> => {
  const query = ListGiftsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let gifts;
  const { recipientId, occasionId } = query.data;

  if (recipientId !== undefined && occasionId !== undefined) {
    gifts = await db.select().from(giftsTable)
      .where(and(eq(giftsTable.recipientId, recipientId), eq(giftsTable.occasionId, occasionId)))
      .orderBy(giftsTable.createdAt);
  } else if (recipientId !== undefined) {
    gifts = await db.select().from(giftsTable)
      .where(eq(giftsTable.recipientId, recipientId))
      .orderBy(giftsTable.createdAt);
  } else if (occasionId !== undefined) {
    gifts = await db.select().from(giftsTable)
      .where(eq(giftsTable.occasionId, occasionId))
      .orderBy(giftsTable.createdAt);
  } else {
    gifts = await db.select().from(giftsTable).orderBy(giftsTable.createdAt);
  }

  res.json(ListGiftsResponse.parse(gifts));
});

router.post("/gifts", async (req, res): Promise<void> => {
  const parsed = CreateGiftBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [gift] = await db.insert(giftsTable).values(parsed.data).returning();
  res.status(201).json(UpdateGiftResponse.parse(gift));
});

router.patch("/gifts/:id", async (req, res): Promise<void> => {
  const params = UpdateGiftParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateGiftBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [gift] = await db
    .update(giftsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(giftsTable.id, params.data.id))
    .returning();
  if (!gift) {
    res.status(404).json({ error: "Gift not found" });
    return;
  }
  res.json(UpdateGiftResponse.parse(gift));
});

router.delete("/gifts/:id", async (req, res): Promise<void> => {
  const params = DeleteGiftParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [gift] = await db.delete(giftsTable).where(eq(giftsTable.id, params.data.id)).returning();
  if (!gift) {
    res.status(404).json({ error: "Gift not found" });
    return;
  }
  res.sendStatus(204);
});

router.patch("/gifts/:id/purchased", async (req, res): Promise<void> => {
  const params = ToggleGiftPurchasedParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = ToggleGiftPurchasedBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [gift] = await db
    .update(giftsTable)
    .set({ purchased: parsed.data.purchased, updatedAt: new Date() })
    .where(eq(giftsTable.id, params.data.id))
    .returning();
  if (!gift) {
    res.status(404).json({ error: "Gift not found" });
    return;
  }
  res.json(ToggleGiftPurchasedResponse.parse(gift));
});

export default router;
