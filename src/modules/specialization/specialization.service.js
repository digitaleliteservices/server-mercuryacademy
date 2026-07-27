import slugify from "slugify";

import Specialization from "./specialization.model.js";
import CourseCatalog from "../course-catalog/course-catalog.model.js";

import ApiError from "../../utils/ApiError.js";
import baseService from "../../services/base.service.js";

/**
 * Ensure specialization fields are unique within one Course Catalog.
 */
const ensureSpecializationIsUnique = async ({
  courseCatalog,
  name,
  code,
  slug,
  excludeId,
}) => {
  const conditions = [];

  if (name) {
    conditions.push({ name });
  }

  if (code) {
    conditions.push({ code });
  }

  if (slug) {
    conditions.push({ slug });
  }

  if (!conditions.length) {
    return;
  }

  const filter = {
    courseCatalog,
    isDeleted: false,
    $or: conditions,
  };

  if (excludeId) {
    filter._id = {
      $ne: excludeId,
    };
  }

  const existingSpecialization = await Specialization.findOne(filter).lean();

  if (!existingSpecialization) {
    return;
  }

  if (name && existingSpecialization.name === name) {
    throw new ApiError(
      409,
      "Specialization name already exists for this course catalog.",
    );
  }

  if (code && existingSpecialization.code === code) {
    throw new ApiError(
      409,
      "Specialization code already exists for this course catalog.",
    );
  }

  if (slug && existingSpecialization.slug === slug) {
    throw new ApiError(
      409,
      "Specialization slug already exists for this course catalog.",
    );
  }
};

/**
 * Create Specialization
 */
const createSpecialization = async (payload) => {
  const normalizedPayload = {
    ...payload,
    name: payload.name.trim(),
    code: payload.code.trim().toUpperCase(),
  };

  normalizedPayload.slug = slugify(normalizedPayload.name, {
    lower: true,
    strict: true,
  });

  // Validate Course Catalog
  await baseService.findById(CourseCatalog, normalizedPayload.courseCatalog);

  await ensureSpecializationIsUnique({
    courseCatalog: normalizedPayload.courseCatalog,
    name: normalizedPayload.name,
    code: normalizedPayload.code,
    slug: normalizedPayload.slug,
  });

  return await Specialization.create(normalizedPayload);
};

/**
 * Get Specializations
 */
const getSpecializations = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  featured,
  courseCatalog,
  sortBy = "displayOrder",
  sortOrder = "asc",
}) => {
  const filter = {
    isDeleted: false,
  };

  if (search) {
    filter.$or = [
      {
        name: {
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

  if (featured !== undefined) {
    filter.featured = featured;
  }

  if (courseCatalog) {
    filter.courseCatalog = courseCatalog;
  }

  return await baseService.paginate(Specialization, filter, {
    page,
    limit,
    sortBy,
    sortOrder,
    populate: ["courseCatalog", "icon"],
  });
};

/**
 * Get Specialization By ID
 */
const getSpecializationById = async (id) => {
  return await baseService.findById(Specialization, id, [
    "courseCatalog",
    "icon",
  ]);
};

/**
 * Update Specialization
 */
const updateSpecialization = async (id, payload) => {
  const specialization = await baseService.findById(Specialization, id);

  const normalizedPayload = {
    ...payload,
  };

  if (payload.name !== undefined) {
    normalizedPayload.name = payload.name.trim();

    normalizedPayload.slug = slugify(normalizedPayload.name, {
      lower: true,
      strict: true,
    });
  }

  if (payload.code !== undefined) {
    normalizedPayload.code = payload.code.trim().toUpperCase();
  }

  const effectiveCourseCatalog =
    normalizedPayload.courseCatalog ?? specialization.courseCatalog;

  const effectiveName = normalizedPayload.name ?? specialization.name;

  const effectiveCode = normalizedPayload.code ?? specialization.code;

  const effectiveSlug = normalizedPayload.slug ?? specialization.slug;

  if (payload.courseCatalog) {
    await baseService.findById(CourseCatalog, payload.courseCatalog);
  }

  await ensureSpecializationIsUnique({
    courseCatalog: effectiveCourseCatalog,
    name: effectiveName,
    code: effectiveCode,
    slug: effectiveSlug,
    excludeId: id,
  });

  Object.assign(specialization, normalizedPayload);

  await specialization.save();

  return await Specialization.findById(specialization._id).populate([
    "courseCatalog",
    "icon",
  ]);
};

/**
 * Delete Specialization
 */
const deleteSpecialization = async (id) => {
  await baseService.softDelete(Specialization, id);

  return null;
};

const specializationService = {
  createSpecialization,
  getSpecializations,
  getSpecializationById,
  updateSpecialization,
  deleteSpecialization,
};

export default specializationService;
