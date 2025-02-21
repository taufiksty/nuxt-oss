import { defineEventHandler } from "h3";
import swaggerSpec from "../../utils/swagger";

export default defineEventHandler(() => {
  return swaggerSpec;
});
