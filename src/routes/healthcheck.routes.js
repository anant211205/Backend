import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controllers.js";

const healthRouter = Router() ;

healthRouter.route("/").get(healthcheck)

export default healthRouter