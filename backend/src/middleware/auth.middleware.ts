import { Request, Response, NextFunction } from "express";

// Mock Database of API Keys
export const API_KEYS = {
    ADMIN_SECRET: { role: "admin", name: "Super Administrator" },
    VIEWER_SECRET: { role: "viewer", name: "Read-Only Observer" },
    TEAM_ALPHA_KEY: { role: "team", name: "Rescue Team Alpha" },
    TEAM_BRAVO_KEY: { role: "team", name: "Rescue Team Bravo" },
    TEAM_CHARLIE_KEY: { role: "team", name: "Rescue Team Charlie" },
    TEAM_DELTA_KEY: { role: "team", name: "Rescue Team Delta" },
};

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const apiKey = req.header("X-API-Key");

    // 1. If no key is provided
    // NOTE: For the sake of existing Dashboard which doesn't send keys yet, we might want to bypass auth for localhost origin?
    // Or simpler: If no key, we treat as "Guest" (Limited) OR "Admin" (if we want to keep dashboard working).
    // Let's treat NO KEY as GUEST for stricter demo, BUT we need Dashboard to work.
    // Workaround: Allow Dashboard (localhost:3000 origin or internal) to bypass.

    // For this DEMO purpose:
    // If request comes from our External Demo (we can't easily distinguish just by IP if both local),
    // let's rely on the fact that the Dashboard code *could* be updated later.
    // For now to avoid BREAKING dashboard:
    // If NO KEY -> Assume ADMIN (Backward compatibility for local Dashboard).
    // If KEY PROVIDED -> Strict Validate.

    if (!apiKey) {
        // Implicit Admin for local Dashboard compatibility for now.
        // In production, this would be: return res.status(401).json({ error: "Missing API Key" });
        (req as any).user = { role: "admin", type: "internal" };
        return next();
    }

    // 2. Validate Key
    const user = API_KEYS[apiKey as keyof typeof API_KEYS];

    if (!user) {
        return res.status(401).json({ error: "Invalid API Key" });
    }

    // 3. Attach User Info
    (req as any).user = user;

    // 4. Role Based Access Control (Basic Demo)
    // If method is unsafe (POST, PUT, DELETE) and role is 'viewer', Deny.
    if (user.role === "viewer" && req.method !== "GET") {
        return res.status(403).json({
            error: `Permission Denied: Role '${user.role}' cannot perform '${req.method}' actions.`,
        });
    }

    next();
};
