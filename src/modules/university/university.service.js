import mongoose from "mongoose";
import slugify from "slugify";

import University from "./university.model.js";

import Approval from "../approvals/approval.model.js";

import ApiError from "../../utils/ApiError.js";
import baseService from "../../services/base.service.js";

const universityPopulate = [
  {
    path: "approvals",
    populate: {
      path: "logo",
      model: "Media",
    },
  },
  "country",
  "state",
  "city",
  "logo",
  "banner",
  "thumbnail",
  "gallery",
];

const createUniversity = async (payload) => {
  const normalizedPayload = {
    ...payload,
    name: payload.name.trim(),
    code: payload.code.trim().toUpperCase(),
  };

  if (payload.shortName) {
    normalizedPayload.shortName = payload.shortName.trim().toUpperCase();
  }

  normalizedPayload.slug = slugify(normalizedPayload.name, {
    lower: true,
    strict: true,
  });

  const existingUniversity = await University.findOne({
    $or: [
      { name: normalizedPayload.name },
      { code: normalizedPayload.code },
      { slug: normalizedPayload.slug },
    ],
    isDeleted: false,
  });

  if (existingUniversity?.name === normalizedPayload.name) {
    throw new ApiError(409, "University name already exists.");
  }

  if (existingUniversity?.code === normalizedPayload.code) {
    throw new ApiError(409, "University code already exists.");
  }

  if (existingUniversity?.slug === normalizedPayload.slug) {
    throw new ApiError(409, "University slug already exists.");
  }

  // Validate Approvals
  if (normalizedPayload.approvals?.length) {
    for (const approvalId of normalizedPayload.approvals) {
      await baseService.findById(Approval, approvalId);
    }
  }

  return await University.create(normalizedPayload);
};

const exportUniversities = async ({
  search = "",
  status,
  universityType,
  country,
  state,
  city,
  featured,
  sortBy = "displayOrder",
  sortOrder = "asc",
}) => {
  const filter = {};

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        shortName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        code: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (status) filter.status = status;

  if (universityType) filter.universityType = universityType;

  if (country) filter.country = country;

  if (state) filter.state = state;

  if (city) filter.city = city;

  if (featured !== undefined && featured !== "") {
    filter.featured = featured === "true";
  }

  return await University.find(filter)
    .populate("country")
    .populate("state")
    .populate("city")
    .sort({
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    });
};

const getUniversities = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  universityType,
  country,
  state,
  city,
  featured,
  sortBy = "displayOrder",
  sortOrder = "asc",
}) => {
  const filter = {};

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        shortName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        code: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (universityType) {
    filter.universityType = universityType;
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

  if (featured !== undefined) {
    filter.featured = featured;
  }

  // if (featured !== undefined && featured !== "") {
  //   filter.featured = featured === "true";
  // }

  return await baseService.paginate(University, filter, {
    page,
    limit,
    sortBy,
    sortOrder,
    populate: universityPopulate,
  });
};

const getUniversityById = async (id) => {
  return await baseService.findById(University, id, [
    "approvals",
    "country",
    "state",
    "city",
  ]);
};

const getUniversityBySlug = async (slug) => {
  const normalizedSlug = slug.trim().toLowerCase();

  const university = await University.findOne({
    slug: normalizedSlug,
    status: "PUBLISHED",
    isDeleted: false,
  }).populate(universityPopulate);

  if (!university) {
    throw new ApiError(404, "University not found.");
  }

  return university;
};

const getUniversityByIdentifier = async (identifier) => {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  const isObjectId =
    mongoose.Types.ObjectId.isValid(identifier) &&
    /^[a-f\d]{24}$/i.test(identifier);

  const identifierFilter = isObjectId
    ? { _id: identifier }
    : { slug: normalizedIdentifier };

  const university = await University.findOne({
    ...identifierFilter,
    status: "PUBLISHED",
    isDeleted: false,
  }).populate(universityPopulate);

  if (!university) {
    throw new ApiError(404, "Published university not found.");
  }

  return university;
};

const updateUniversity = async (id, payload) => {
  const university = await baseService.findById(University, id);

  const normalizedPayload = {
    ...payload,
  };

  if (payload.name) {
    normalizedPayload.name = payload.name.trim();

    normalizedPayload.slug = slugify(normalizedPayload.name, {
      lower: true,
      strict: true,
    });

    const existingName = await University.findOne({
      name: normalizedPayload.name,
      _id: { $ne: id },
      isDeleted: false,
    });

    if (existingName) {
      throw new ApiError(409, "University name already exists.");
    }

    const existingSlug = await University.findOne({
      slug: normalizedPayload.slug,
      _id: { $ne: id },
      isDeleted: false,
    });

    if (existingSlug) {
      throw new ApiError(409, "University slug already exists.");
    }
  }

  if (payload.code) {
    normalizedPayload.code = payload.code.trim().toUpperCase();

    const existingCode = await University.findOne({
      code: normalizedPayload.code,
      _id: { $ne: id },
      isDeleted: false,
    });

    if (existingCode) {
      throw new ApiError(409, "University code already exists.");
    }
  }

  if (payload.shortName) {
    normalizedPayload.shortName = payload.shortName.trim().toUpperCase();
  }

  // Validate Approvals
  if (payload.approvals?.length) {
    for (const approvalId of payload.approvals) {
      await baseService.findById(Approval, approvalId);
    }
  }

  Object.assign(university, normalizedPayload);

  await university.save();

  return university;
};

const deleteUniversity = async (id) => {
  await baseService.softDelete(University, id);

  return null;
};

const universityService = {
  createUniversity,
  exportUniversities,
  getUniversities,
  getUniversityById,
  getUniversityBySlug,
  getUniversityByIdentifier,
  updateUniversity,
  deleteUniversity,
};

export default universityService;
