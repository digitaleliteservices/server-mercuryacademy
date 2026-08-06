import nodemailer from "nodemailer";
import UniversityCourse from "../modules/university-course/university-course.model.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendLeadEmail = async (lead) => {
  const course = await UniversityCourse.findById(lead.universityCourse).populate([
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
  ]);

  const courseName = [
    course?.university?.name,
    course?.courseCatalog?.name,
    course?.specialization?.name,
  ]
    .filter(Boolean)
    .join(" • ");

  await transporter.sendMail({
    from: `"Lead Management" <${process.env.EMAIL_USER}>`,
    to: process.env.RECEIVER_EMAIL,
    subject: "New Mercury Website Lead Received",
    html: `
      <h2>New Lead Received</h2>

      <table border="1" cellpadding="8" cellspacing="0">
        <tr>
          <td><strong>First Name</strong></td>
          <td>${lead.firstName}</td>
        </tr>
        <tr>
          <td><strong>Last Name</strong></td>
          <td>${lead.lastName || "-"}</td>
        </tr>
        <tr>
          <td><strong>Email</strong></td>
          <td>${lead.email}</td>
        </tr>
        <tr>
          <td><strong>Phone</strong></td>
          <td>${lead.phone}</td>
        </tr>
        <tr>
          <td><strong>Course</strong></td>
          <td>${courseName || "-"}</td>
        </tr>
      </table>
    `,
  });
};