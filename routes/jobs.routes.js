import { Router } from "express";
import { addJobs, getJobs, scrapJob } from "../controllers/job.controller.js";

const router = Router();

//get All Jobs
router.get("/jobs", getJobs);
// scrap reviews
router.post("/linkedin-jobs", addJobs);

// scrap linkedin single job
router.get("/scrap-jobs", scrapJob);

export default router;
