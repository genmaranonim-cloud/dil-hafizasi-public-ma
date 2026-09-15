// MA — Ensures NativeWind's generated CSS path exists before Metro calculates asset hashes in a clean CI checkout.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const cacheDirectory = join(process.cwd(), "node_modules", "react-native-css-interop", ".cache");
const cssFile = join(cacheDirectory, "web.css");

mkdirSync(cacheDirectory, { recursive: true });
if (!existsSync(cssFile)) {
  writeFileSync(cssFile, "", "utf8");
}
