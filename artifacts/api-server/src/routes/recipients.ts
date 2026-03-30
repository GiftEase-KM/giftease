import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, recipientsTable } from "@workspace/db";
import {
  ListRecipientsResponse,
  CreateRecipientBody,
  GetRecipientParams,
  GetRecipientResponse,
  UpdateRecipientParams,
  UpdateRecipientBody,
  UpdateRecipientResponse,
  DeleteRecipientParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/recipients", async (req, res): Promise<void> => {
  const recipients = await db.select().from(recipientsTable).orderBy(recipientsTable.name);
  res.json(ListRecipientsResponse.parse(recipients));
});

router.post("/recipients", async (req, res): Promise<void> => {
  const parsed = CreateRecipientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [recipient] = await db.insert(recipientsTable).values(parsed.data).returning();
  res.status(201).json(GetRecipientResponse.parse(recipient));
});

router.get("/recipients/:id", async (req, res): Promise<void> => {
  const params = GetRecipientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [recipient] = await db.select().from(recipientsTable).where(eq(recipientsTable.id, params.data.id));
  if (!recipient) {
    res.status(404).json({ error: "Recipient not found" });
    return;
  }
  res.json(GetRecipientResponse.parse(recipient));
});

router.patch("/recipients/:id", async (req, res): Promise<void> => {
  const params = UpdateRecipientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateRecipientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [recipient] = await db
    .update(recipientsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(recipientsTable.id, params.data.id))
    .returning();
  if (!recipient) {
    res.status(404).json({ error: "Recipient not found" });
    return;
  }
  res.json(UpdateRecipientResponse.parse(recipient));
});

router.delete("/recipients/:id", async (req, res): Promise<void> => {
  const params = DeleteRecipientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [recipient] = await db.delete(recipientsTable).where(eq(recipientsTable.id, params.data.id)).returning();
  if (!recipient) {
    res.status(404).json({ error: "Recipient not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
