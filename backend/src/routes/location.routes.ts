import { Router } from "express";
import { locationController } from "../controllers/location.controller";

const router = Router();

router.get("/", locationController.getAll);
router.get("/:id", locationController.getById);
router.post("/", locationController.create);

export const locationRoutes = router;
