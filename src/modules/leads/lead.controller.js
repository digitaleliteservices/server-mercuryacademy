import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { sendLeadEmail } from "../../config/mailer.js";

import leadService from "./lead.service.js";

/**
 * Create Lead
 */

const createLead = asyncHandler(async (req, res) => {
  const lead = await leadService.createLead(req.body);

  sendLeadEmail(lead).catch((err) => {
    console.error("Failed to send lead email:", err);
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Lead created successfully.", lead));
});
/**
 * Get Leads
 */
const getLeads = asyncHandler(async (req, res) => {
  const result = await leadService.getLeads(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Leads fetched successfully.",
        result.data,
        result.meta,
      ),
    );
});

/**
 * Get Lead By ID
 */
const getLeadById = asyncHandler(async (req, res) => {
  const lead = await leadService.getLeadById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Lead fetched successfully.", lead));
});

/**
 * Update Lead
 */
const updateLead = asyncHandler(async (req, res) => {
  const lead = await leadService.updateLead(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Lead updated successfully.", lead));
});

/**
 * Delete Lead
 */
const deleteLead = asyncHandler(async (req, res) => {
  await leadService.deleteLead(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Lead deleted successfully."));
});

const leadController = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
};

export default leadController;
