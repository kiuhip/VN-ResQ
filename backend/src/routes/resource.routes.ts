import { Router } from "express";
import { resourceController } from "../controllers/resource.controller";

const router = Router();

router.post("/", resourceController.create.bind(resourceController));
router.get("/", resourceController.getAll.bind(resourceController));
router.patch(
  "/:id/quantity",
  resourceController.updateQuantity.bind(resourceController)
);

export const resourceRoutes = router;
