import mongoose from "mongoose";

import seoSchema from "../../schemas/seo.schema.js";
import baseFields from "../../schemas/base.schema.js";

const specializationSchema = new mongoose.Schema(
  {
    /**
     * Marketing
     * Data Science
     * Artificial Intelligence
     */
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    /**
     * MKT
     * DS
     * AI
     */
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },

    /**
     * marketing
     * data-science
     */
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    /**
     * Parent Course
     * Example:
     * MBA
     * MCA
     * BBA
     */
    courseCatalog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseCatalog",
      required: true,
    },

    /**
     * Optional description
     */
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    /**
     * Icon/Image
     */
    icon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
      default: null,
    },

    seo: seoSchema,

    ...baseFields,
  },
  {
    timestamps: true,
  },
);

/**
 * Unique Indexes
 */

/**
 * Search & Filter Index
 */
/**
 * A specialization name, slug and code must be unique
 * only within the same Course Catalog.
 *
 * Examples:
 * BBA  + Business Analytics ✅
 * B.Com + Business Analytics ✅
 * BBA  + Business Analytics again ❌
 */

specializationSchema.index(
  {
    courseCatalog: 1,
    name: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

specializationSchema.index(
  {
    courseCatalog: 1,
    slug: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

specializationSchema.index(
  {
    courseCatalog: 1,
    code: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

const Specialization = mongoose.model("Specialization", specializationSchema);

export default Specialization;
