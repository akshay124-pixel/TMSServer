const { z } = require("zod");
const ValidticketSchema = require("../Schema/validation");

const validateTicket = (req, res, next) => {
  try {
    // Validate request body using the Zod schema
    const validatedData = ValidticketSchema.parse(req.body);

    // Attach validated data to the request object
    req.validatedData = validatedData;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors in a structured format
      return res.status(400).json({
        errors: error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    // Handle unexpected errors
    console.error("Unexpected validation error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = validateTicket;
