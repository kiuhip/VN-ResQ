import { Router } from "express";
import { volunteerController } from "../controllers/volunteer.controller";

const router = Router();

router.post("/", volunteerController.create.bind(volunteerController));
router.get("/", volunteerController.getAll.bind(volunteerController));

export const volunteerRoutes = router;
