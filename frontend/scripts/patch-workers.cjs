/**
 * Patches areWorkersAvailable() to return false in @cofhe/sdk and the Vite cache.
 * The zkProve.worker.js file is not shipped in the package dist,
 * so the Worker constructor fails silently and ZK proof generation
 * breaks. Disabling workers forces main-thread ZK proving (WASM).
 */
const fs = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..");

const TARGET = "return typeof Worker !== \"undefined\";";
const REPLACEMENT = "return false; // workers-disabled-patch";

const files = [
  path.join(BASE, "node_modules", "@cofhe", "sdk", "dist", "web.js"),
  path.join(BASE, "node_modules", "@cofhe", "sdk", "dist", "web.cjs"),
  path.join(BASE, "node_modules", ".vite", "deps", "@cofhe_react.js"),
];

let patched = 0;
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, "utf8");
  if (content.includes("workers-disabled-patch")) { patched++; continue; }
  // Replace both occurrences (worker check + the class guard)
  if (!content.includes(TARGET)) {
    console.log("[patch-workers] PATTERN NOT FOUND in:", path.basename(f));
    continue;
  }
  // Replace only the areWorkersAvailable function body (not the Worker === undefined guard)
  content = content.replace(
    /function areWorkersAvailable\(\) \{\s*return typeof Worker !== "undefined";\s*\}/,
    'function areWorkersAvailable() {\n  return false; // workers-disabled-patch\n}'
  );
  // Also handle minified version
  content = content.replace(
    /function areWorkersAvailable\(\)\{return typeof Worker!=="undefined"\}/,
    'function areWorkersAvailable(){return false;}'
  );
  fs.writeFileSync(f, content, "utf8");
  patched++;
  console.log("[patch-workers] Patched:", path.basename(f));
}
console.log("[patch-workers] Done (" + patched + " file(s))");
