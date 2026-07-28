import University from "../university/university.model.js";
import UniversityCourse from "../university-course/university-course.model.js";
import UniversityCourseCurriculum from "../university-course-curriculum/university-course-curriculum.model.js";
import UniversityCourseSubject from "../university-course-subject/university-course-subject.model.js";
import FAQ from "../faqs/faq.model.js";

const PUBLIC_RECORD_FILTER = {
  status: "PUBLISHED",
  isDeleted: false,
};

/**
 * Get a published university and all its published courses.
 *
 * GET /api/v1/public/universities/:slug
 */
export const getPublicUniversityBySlug = async (slug) => {
  const normalizedSlug = slug.trim().toLowerCase();

  /**
   * Fetch published university details.
   */
  const university = await University.findOne({
    slug: normalizedSlug,
    ...PUBLIC_RECORD_FILTER,
  })
    .select(
      [
        "name",
        "shortName",
        "code",
        "slug",
        "establishedYear",
        "universityType",
        "websiteUrl",
        "email",
        "phone",
        "country",
        "state",
        "city",
        "address",
        "googleMapUrl",
        "logo",
        "banner",
        "thumbnail",
        "gallery",
        "overview",
        "vision",
        "mission",
        "approvals",
        "seo",
        "featured",
        "displayOrder",
        "createdAt",
        "updatedAt",
      ].join(" "),
    )
    .populate({
      path: "country",
      select: "name code",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "state",
      select: "name code",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "city",
      select: "name",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "logo",
      select: "url altText caption width height mimeType",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "banner",
      select: "url altText caption width height mimeType",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "thumbnail",
      select: "url altText caption width height mimeType",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "gallery",
      select: "url altText caption width height mimeType",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "approvals",
      match: PUBLIC_RECORD_FILTER,
    })
    .lean();

  if (!university) {
    return null;
  }

  /**
   * Fetch published courses belonging to the university.
   */
  const universityCourses = await UniversityCourse.find({
    university: university._id,
    ...PUBLIC_RECORD_FILTER,
  })
    .select(
      [
        "university",
        "courseCatalog",
        "specialization",
        "slug",
        "duration",
        "durationUnit",
        "eligibility",
        "admissionProcess",
        "admissionMode",
        "overview",
        "applicationFee",
        "semesterFee",
        "annualFee",
        "totalFee",
        "currency",
        "studyMode",
        "degreeAwarded",
        "brochure",
        "thumbnail",
        "banner",
        "applicationUrl",
        "seo",
        "featured",
        "displayOrder",
        "createdAt",
        "updatedAt",
      ].join(" "),
    )
    .populate({
      path: "courseCatalog",
      select:
        "name shortName code slug category level degreeType duration durationUnit overview icon seo",
      match: PUBLIC_RECORD_FILTER,
      populate: [
        {
          path: "category",
          match: PUBLIC_RECORD_FILTER,
        },
        {
          path: "icon",
          select: "url altText caption width height mimeType",
          match: {
            isDeleted: false,
          },
        },
      ],
    })
    .populate({
      path: "specialization",
      match: PUBLIC_RECORD_FILTER,
    })
    .populate({
      path: "brochure",
      select:
        "url originalName fileName mimeType extension size altText caption",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "thumbnail",
      select: "url altText caption width height mimeType",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "banner",
      select: "url altText caption width height mimeType",
      match: {
        isDeleted: false,
      },
    })
    .sort({
      featured: -1,
      displayOrder: 1,
      createdAt: -1,
    })
    .lean();

  /**
   * Remove university courses whose course catalog is not public.
   */
  const publishedCourses = universityCourses.filter(
    (course) => course.courseCatalog !== null,
  );

  return {
    ...university,
    courses: publishedCourses,
    totalCourses: publishedCourses.length,
  };
};

/**
 * Get one published university course using university slug and course slug.
 *
 * GET /api/v1/public/universities/:universitySlug/courses/:courseSlug
 */
export const getPublicUniversityCourseBySlug = async (
  universitySlug,
  courseSlug,
) => {
  const normalizedUniversitySlug = universitySlug.trim().toLowerCase();
  const normalizedCourseSlug = courseSlug.trim().toLowerCase();

  /**
   * Verify that the university is published.
   */
  const university = await University.findOne({
    slug: normalizedUniversitySlug,
    ...PUBLIC_RECORD_FILTER,
  })
    .select(
      [
        "name",
        "shortName",
        "code",
        "slug",
        "establishedYear",
        "universityType",
        "websiteUrl",
        "email",
        "phone",
        "country",
        "state",
        "city",
        "address",
        "googleMapUrl",
        "logo",
        "banner",
        "thumbnail",
        "approvals",
        "seo",
        "featured",
      ].join(" "),
    )
    .populate({
      path: "country",
      select: "name code",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "state",
      select: "name code",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "city",
      select: "name",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "logo",
      select: "url altText caption width height mimeType",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "banner",
      select: "url altText caption width height mimeType",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "thumbnail",
      select: "url altText caption width height mimeType",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "approvals",
      match: PUBLIC_RECORD_FILTER,
    })
    .lean();

  if (!university) {
    return null;
  }

  /**
   * Fetch the published university course.
   */
  const universityCourse = await UniversityCourse.findOne({
    university: university._id,
    slug: normalizedCourseSlug,
    ...PUBLIC_RECORD_FILTER,
  })
    .select(
      [
        "university",
        "courseCatalog",
        "specialization",
        "slug",
        "duration",
        "durationUnit",
        "eligibility",
        "admissionProcess",
        "admissionMode",
        "overview",
        "applicationFee",
        "semesterFee",
        "annualFee",
        "totalFee",
        "currency",
        "studyMode",
        "degreeAwarded",
        "brochure",
        "thumbnail",
        "banner",
        "applicationUrl",
        "seo",
        "featured",
        "displayOrder",
        "createdAt",
        "updatedAt",
      ].join(" "),
    )
    .populate({
      path: "courseCatalog",
      select:
        "name shortName code slug category level degreeType duration durationUnit overview icon seo",
      match: PUBLIC_RECORD_FILTER,
      populate: [
        {
          path: "category",
          match: PUBLIC_RECORD_FILTER,
        },
        {
          path: "icon",
          select: "url altText caption width height mimeType",
          match: {
            isDeleted: false,
          },
        },
      ],
    })
    .populate({
      path: "specialization",
      match: PUBLIC_RECORD_FILTER,
      populate: {
        path: "icon",
        select: "url altText caption width height mimeType",
        match: {
          isDeleted: false,
        },
      },
    })
    .populate({
      path: "brochure",
      select:
        "url originalName fileName mimeType extension size altText caption",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "thumbnail",
      select: "url altText caption width height mimeType",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "banner",
      select: "url altText caption width height mimeType",
      match: {
        isDeleted: false,
      },
    })
    .lean();

  /**
   * A university course cannot be public when its course catalog
   * is deleted, unpublished or missing.
   */
  if (!universityCourse || !universityCourse.courseCatalog) {
    return null;
  }

  /**
   * If the course originally has a specialization but its populated
   * specialization is null, it means the specialization is not public.
   */
  if (
    universityCourse.specialization === null ||
    universityCourse.specialization === undefined
  ) {
    const originalCourse = await UniversityCourse.findById(universityCourse._id)
      .select("specialization")
      .lean();

    if (originalCourse?.specialization) {
      return null;
    }
  }

  /**
   * Fetch all published semesters.
   */
  const semesters = await UniversityCourseCurriculum.find({
    universityCourse: universityCourse._id,
    ...PUBLIC_RECORD_FILTER,
  })
    .select(
      [
        "universityCourse",
        "semesterNumber",
        "title",
        "description",
        "featured",
        "displayOrder",
        "createdAt",
        "updatedAt",
      ].join(" "),
    )
    .sort({
      semesterNumber: 1,
      displayOrder: 1,
      createdAt: 1,
    })
    .lean();

  const semesterIds = semesters.map((semester) => semester._id);

  /**
   * Fetch the published subjects for all semesters using one query.
   */
  const subjects =
    semesterIds.length > 0
      ? await UniversityCourseSubject.find({
          universityCourseCurriculum: {
            $in: semesterIds,
          },
          ...PUBLIC_RECORD_FILTER,
        })
          .select(
            [
              "universityCourseCurriculum",
              "name",
              "code",
              "credits",
              "description",
              "featured",
              "displayOrder",
              "createdAt",
              "updatedAt",
            ].join(" "),
          )
          .sort({
            displayOrder: 1,
            createdAt: 1,
          })
          .lean()
      : [];

  /**
   * Group subjects using their curriculum/semester ID.
   */
  const subjectsBySemester = new Map();

  for (const subject of subjects) {
    const semesterId = String(subject.universityCourseCurriculum);

    if (!subjectsBySemester.has(semesterId)) {
      subjectsBySemester.set(semesterId, []);
    }

    subjectsBySemester.get(semesterId).push(subject);
  }

  /**
   * Attach subjects and calculated values to each semester.
   */
  const curriculum = semesters.map((semester) => {
    const semesterSubjects = subjectsBySemester.get(String(semester._id)) ?? [];

    const totalCredits = semesterSubjects.reduce(
      (total, subject) => total + (Number(subject.credits) || 0),
      0,
    );

    return {
      ...semester,
      subjects: semesterSubjects,
      totalSubjects: semesterSubjects.length,
      totalCredits,
    };
  });

  /**
   * Fetch course, university and global FAQs applicable to this page.
   */
  const faqs = await FAQ.find({
    ...PUBLIC_RECORD_FILTER,
    $or: [
      {
        scope: "UNIVERSITY_COURSE",
        universityCourse: universityCourse._id,
      },
      {
        scope: "UNIVERSITY",
        university: university._id,
      },
      {
        scope: "GLOBAL",
      },
    ],
  })
    .select(
      [
        "scope",
        "university",
        "universityCourse",
        "question",
        "answer",
        "category",
        "featured",
        "displayOrder",
        "createdAt",
        "updatedAt",
      ].join(" "),
    )
    .sort({
      featured: -1,
      displayOrder: 1,
      createdAt: 1,
    })
    .lean();

  /**
   * Return complete course-page data.
   *
   * Course-specific SEO is available under course.seo.
   * University SEO is available under university.seo.
   */
  return {
    university,
    course: universityCourse,
    curriculum,
    faqs,
    summary: {
      totalSemesters: curriculum.length,
      totalSubjects: subjects.length,
      totalCredits: curriculum.reduce(
        (total, semester) => total + semester.totalCredits,
        0,
      ),
      totalFaqs: faqs.length,
    },
  };
};
