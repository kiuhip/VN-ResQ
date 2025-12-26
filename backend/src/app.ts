import express from "express";
import cors from "cors";
import { incidentRoutes } from "./routes/incident.routes";
import { hotlineRoutes } from "./routes/hotline.routes";
import { messengerRoutes } from "./routes/messenger.routes";
import { dispatchRoutes } from "./routes/dispatch.routes";
import { teamRoutes } from "./routes/team.routes";
import { volunteerRoutes } from "./routes/volunteer.routes";
import { resourceRoutes } from "./routes/resource.routes";
import { missionRoutes } from "./routes/mission.routes";


const app = express();

app.use(cors());
app.use(express.json());

// Routes
// Routes
app.use("/api/incidents", incidentRoutes);
app.use("/api/hotline", hotlineRoutes);
app.use("/api/messenger", messengerRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/missions", missionRoutes);


app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("VN-ResQ Backend is running!");
});

export default app;
