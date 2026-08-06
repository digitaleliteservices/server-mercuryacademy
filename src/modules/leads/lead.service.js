import Lead from "./lead.model.js";

import UniversityCourse from "../university-course/university-course.model.js";
import Country from "../country/country.model.js";
import State from "../state/state.model.js";
import City from "../city/city.model.js";
// import User from "../user/user.model.js";

import ApiError from "../../utils/ApiError.js";
import baseService from "../../services/base.service.js";

import validateReferences from "../../helpers/reference.helpers.js";

/**
 * Create Lead
 */
const createLead = async (payload) => {
  const normalizedPayload = {
    ...payload,
    firstName: payload.firstName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
  };

  if (payload.lastName) {
    normalizedPayload.lastName = payload.lastName.trim();
  }

  /**
   * Validate References
   */
  await validateReferences([
    {
      Model: UniversityCourse,
      id: normalizedPayload.universityCourse,
    },
    {
      Model: Country,
      id: normalizedPayload.country,
    },
    {
      Model: State,
      id: normalizedPayload.state,
    },
    {
      Model: City,
      id: normalizedPayload.city,
    },
    // {
    //   Model: User,
    //   id: normalizedPayload.assignedTo,
    // },
  ]);

  /**
   * Prevent duplicate lead
   */
  // const existingLead = await Lead.findOne({
  //   email: normalizedPayload.email,
  //   universityCourse: normalizedPayload.universityCourse,
  //   isDeleted: false,
  // });

  // if (existingLead) {
  //   throw new ApiError(409, "A lead already exists for this email and course.");
  // }

  return await Lead.create(normalizedPayload);
};

/**
 * Get Leads
 */
const getLeads = async ({
  page = 1,
  limit = 10,
  search = "",
  universityCourse,
  country,
  state,
  city,
  source,
  leadStatus,
  assignedTo,
  featured,
  status,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const filter = {};

  if (search) {
    filter.$or = [
      {
        firstName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        lastName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (universityCourse) {
    filter.universityCourse = universityCourse;
  }

  if (country) {
    filter.country = country;
  }

  if (state) {
    filter.state = state;
  }

  if (city) {
    filter.city = city;
  }

  if (source) {
    filter.source = source;
  }

  if (leadStatus) {
    filter.leadStatus = leadStatus;
  }

  if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (featured !== undefined) {
    filter.featured = featured;
  }

  if (status) {
    filter.status = status;
  }

  return await baseService.paginate(Lead, filter, {
    page,
    limit,
    sortBy,
    sortOrder,
    // populate: ["universityCourse", "country", "state", "city", "assignedTo"],
    populate: [
      {
        path: "universityCourse",
        populate: [
          {
            path: "university",
            select: "name",
          },
          {
            path: "courseCatalog",
            select: "name",
          },
          {
            path: "specialization",
            select: "name",
          },
        ],
      },
      "country",
      "state",
      "city",
    ],
  });
};

/**
 * Get Lead By ID
 */
const getLeadById = async (id) => {
  return await baseService.findById(Lead, id, [
    {
      path: "universityCourse",
      populate: [
        {
          path: "university",
          select: "name",
        },
        {
          path: "courseCatalog",
          select: "name",
        },
        {
          path: "specialization",
          select: "name",
        },
      ],
    },
    "country",
    "state",
    "city",
  ]);
};

/**
 * Update Lead
 */
const updateLead = async (id, payload) => {
  const lead = await baseService.findById(Lead, id);

  const normalizedPayload = {
    ...payload,
  };

  if (payload.firstName) {
    normalizedPayload.firstName = payload.firstName.trim();
  }

  if (payload.lastName) {
    normalizedPayload.lastName = payload.lastName.trim();
  }

  if (payload.email) {
    normalizedPayload.email = payload.email.trim().toLowerCase();
  }

  if (payload.phone) {
    normalizedPayload.phone = payload.phone.trim();
  }

  /**
   * Validate References
   */
  await validateReferences([
    {
      Model: UniversityCourse,
      id: normalizedPayload.universityCourse,
    },
    {
      Model: Country,
      id: normalizedPayload.country,
    },
    {
      Model: State,
      id: normalizedPayload.state,
    },
    {
      Model: City,
      id: normalizedPayload.city,
    },
    // {
    //   Model: User,
    //   id: normalizedPayload.assignedTo,
    // },
  ]);

  /**
   * Duplicate Check
   */
  // if (normalizedPayload.email || normalizedPayload.universityCourse) {
  //   const existingLead = await Lead.findOne({
  //     email: normalizedPayload.email || lead.email,
  //     universityCourse:
  //       normalizedPayload.universityCourse || lead.universityCourse,
  //     _id: { $ne: id },
  //     isDeleted: false,
  //   });

  //   if (existingLead) {
  //     throw new ApiError(
  //       409,
  //       "A lead already exists for this email and course.",
  //     );
  //   }
  // }

  Object.assign(lead, normalizedPayload);

  await lead.save();

  return lead;
};

/**
 * Delete Lead
 */
const deleteLead = async (id) => {
  await baseService.softDelete(Lead, id);

  return null;
};

const leadService = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
};

export default leadService;
