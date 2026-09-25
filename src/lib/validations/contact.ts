import { z } from "zod";

import { optionalEmail, optionalText, phone10 } from "./common";

export const contactSchema = z.object({
  full_name: z.string().trim().min(1, "Enter your name"),
  phone: phone10,
  email: optionalEmail,
  interested_course_text: optionalText,
  remarks: optionalText,
});
