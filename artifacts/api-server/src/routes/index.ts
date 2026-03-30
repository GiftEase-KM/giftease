import { Router, type IRouter } from "express";
import healthRouter from "./health";
import recipientsRouter from "./recipients";
import occasionsRouter from "./occasions";
import giftsRouter from "./gifts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(recipientsRouter);
router.use(occasionsRouter);
router.use(giftsRouter);

export default router;
