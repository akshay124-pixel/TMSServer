const { z } = require("zod");

const ValidticketSchema = z.object({
  customerName: z
    .string()
    .min(1, { message: "Customer Name is required" })
    .max(50, { message: "Customer Name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Customer Name must only contain alphabets",
    }),

  serialNumber: z.string().optional(), // No length, format, or uniqueness constraints

  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long" })
    .max(500, { message: "Description cannot exceed 500 characters" }),

  contactNumber: z.string().regex(/^[0-9]{10}$/, {
    message: "Contact Number must be exactly 10 digits",
  }),

  // billImage: z.string().regex(/\.(jpg|jpeg|png|gif)$/i, {
  //   message: "Bill Image must be a valid image format (JPG, JPEG, PNG, GIF)",
  // }),

  email: z
    .string()
    .email({ message: "Invalid email format" })
    .max(100, { message: "Email cannot exceed 100 characters" }),

  address: z
    .string()
    .min(10, { message: "Address must be at least 10 characters long" })
    .max(200, { message: "Address cannot exceed 200 characters" }),

  city: z
    .string()
    .min(2, {
      message: "City is required and must be at least 2 characters long",
    })
    .max(50, { message: "City cannot exceed 50 characters" }),

  state: z
    .string()
    .min(2, {
      message: "State is required and must be at least 2 characters long",
    })
    .max(50, { message: "State cannot exceed 50 characters" }),

  productType: z
    .string()
    .min(1, { message: "Product Type is required" })
    .max(50, { message: "Product Type cannot exceed 50 characters" }),

  modelType: z
    .string()
    .min(1, { message: "Model Type is required" })
    .max(50, { message: "Model Type cannot exceed 50 characters" }),
});

module.exports = ValidticketSchema;
