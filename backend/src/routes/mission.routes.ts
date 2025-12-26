import { Router } from "express";
import { missionController } from "../controllers/mission.controller";

const router = Router();

router.get("/offers", missionController.listOffers.bind(missionController));
router.get("/active", missionController.getActive.bind(missionController));
router.post("/assign", missionController.assign.bind(missionController));
router.post("/:id/accept", missionController.accept.bind(missionController));
router.post("/:id/reject", missionController.reject.bind(missionController));
router.patch(
  "/:id/status",
  missionController.updateStatus.bind(missionController)
);
router.post("/:id/report", missionController.report.bind(missionController));
router.post(
  "/:id/backup",
  missionController.requestBackup.bind(missionController)
);
router.get("/:id", missionController.getById.bind(missionController));

export const missionRoutes = router;
