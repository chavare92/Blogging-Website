import { handle } from "hono/vercel";
import app from "../dist/boot.js";

export const edge = false;
export default handle(app);
