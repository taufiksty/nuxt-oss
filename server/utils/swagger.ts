import { readFileSync } from "fs";
import { resolve } from "path";
import { parse } from "yaml";

const swaggerPath = resolve("server/docs/swagger.yaml");
const swaggerSpec = parse(readFileSync(swaggerPath, "utf8"));

export default swaggerSpec;
