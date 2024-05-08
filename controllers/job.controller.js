import axios from "axios";
import Job from "../model/jobs.model.js";
import puppeteer from "puppeteer";
import * as Cheerio from "cheerio";

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();

    return res.status(200).json({ success: true, data: jobs, error: "" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: null, error: err.message });
  }
};

const addJobs = async (req, res) => {
  try {
    const { jobTitle, jobCountry, pageNumber } = req.body;

    if (!jobTitle || !jobCountry) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Job Title and Country is required.",
      });
    }

    if (!pageNumber) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Page Number is required.",
      });
    }

    const queries = {
      jobTitle: jobTitle,
      country: jobCountry,
    };

    const options = {
      method: "GET",
      url: `${process.env.RAPID_API_URL}`,
      params: {
        query: `${queries.jobTitle}, ${queries.country}`,
        page: pageNumber,
        num_pages: "10",
      },
      headers: {
        "X-RapidAPI-Key": `${process.env.RAPID_API_KEY}`,
        "X-RapidAPI-Host": `${process.env.RAPID_API_HOST}`,
      },
    };

    const { data } = await axios.request(options);

    const updateJobData = async (job) => {
      const genders = ["Male", "Female", "Any", "Not Mentioned"];

      const customData = {
        title: job?.job_title,
        companyName: job?.employer_name,
        companyLogo: job?.employer_logo,
        salary: {
          per: job?.job_salary_period,
          min: job?.job_min_salary,
          max: job?.job_max_salary,
          salary_currency: job?.job_salary_currency,
          salary_period: job?.job_salary_period,
        },
        vacancies: Math.floor(Math.random() * 5) + 1,
        deadline: job?.job_offer_expiration_datetime_utc,
        type:
          job?.job_employment_type === "FULLTIME"
            ? "Full-Time"
            : job?.job_employment_type,
        experience: job?.job_required_experience,
        skills: job?.job_required_skills,
        education: job?.job_required_education,
        jobPostedAt: job?.job_posted_at_datetime_utc,
        industry: job?.job_job_title,
        gender: genders[Math.floor(Math.random() * genders.length)],
        location: {
          country: queries.country,
          city: job?.job_city ?? null,
          latitude: job?.job_latitude || null,
          longitude: job?.job_longitude || null,
        },
        nationality: queries.country,
        workplaceType: job?.job_is_remote ? "Remote" : "Onsite",
        description: job?.job_description,
        highlights: job?.job_highlights,
        publisher: job?.job_publisher,
      };

      return customData;
    };

    const updatedResponse = await Promise.all(data.data.map(updateJobData));

    const savedJobs = await Job.insertMany(updatedResponse);

    return res
      .status(201)
      .json({ success: true, data: updatedResponse, error: null });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, data: null, error: err.message });
  }
};

const scrapJob = async (req, res) => {
  try {
    const { pageURL } = req.body;

    if (!pageURL) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Page URL is required.",
      });
    }

    // Puppeteer code
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.goto(pageURL);
    // const html = await page.content();
    // const title = await page.evaluate(() => document.title);
    // console.log(title);
    // await browser.close();

    const result = await axios.get(pageURL);

    if (result.status !== 200) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Page Loading Failed.",
      });
    }

    const html = result.data;
    const $ = Cheerio.load(html);

    const title = $(".top-card-layout__card .top-card-layout__title").text();
    const organization = $(
      ".top-card-layout__card .topcard__org-name-link"
    ).text();
    const location = $(".topcard__flavor.topcard__flavor--bullet").text();
    const createdAt = $(".posted-time-ago__text").text();

    const [jobTitle, typeText] = title.split("-").map((text) => text);
    const type = typeText.includes("Onsite") ? "Onsite" : typeText;
    const description = $(".show-more-less-html__markup")
      .html()
      ?.trim()
      ?.toString();

    let employmentType, industries;

    $(".description__job-criteria-list")
      .children("li")
      .each((i, el) => {
        const heading = $(el)
          .find("h3.description__job-criteria-subheader")
          .text()
          .trim();
        const title = $(el)
          .find("span.description__job-criteria-text")
          .text()
          .trim();

        if (heading === "Employment type") {
          employmentType = title;
        } else if (heading === "Industries") {
          industries = title;
        }
      });

    const customData = {
      jobTitle,
      type,
      companyName: organization?.trim(),
      location: location?.trim(),
      createdAt: createdAt?.trim(),
      types: employmentType,
      industry: industries,
      description,
    };

    return res.status(200).json({ success: true, data: customData, error: "" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, data: null, error: err.message });
  }
};

export { addJobs, getJobs, scrapJob };
