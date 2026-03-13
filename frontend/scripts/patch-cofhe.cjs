/**
 * Patches @cofhe/react@0.4.0 bugs:
 * 1. validateAndCompactizeSteps receives undefined instead of []
 * 2. Replaces @mui/icons-material imports with inline SVG stubs (MUI not installed)
 *
 * Run automatically via "postinstall" in package.json.
 */
const fs = require("fs");
const path = require("path");

// Inline SVG stubs for each MUI icon used by @cofhe/react
const MUI_ICON_STUBS = `
var CloseIcon = () => null;
var KeyboardArrowRightIcon = () => null;
var KeyboardArrowRightIcon2 = () => null;
var KeyboardArrowRightIcon3 = () => null;
var ArrowBackIcon = () => null;
var ArrowBackIcon2 = () => null;
var ArrowBackIcon3 = () => null;
var ArrowBackIcon4 = () => null;
var ArrowBackIcon5 = () => null;
var ArrowBackIcon6 = () => null;
var ArrowBackIcon7 = () => null;
var ArrowBackIcon8 = () => null;
var ArrowBackIcon9 = () => null;
var ArrowBackIcon10 = () => null;
var ArrowBackIcon11 = () => null;
var ArrowBackIcon12 = () => null;
var ArrowBackIcon13 = () => null;
var LockIcon = () => null;
var PublicIcon = () => null;
var KeyboardArrowDownIcon = () => null;
`;

const files = [
  path.join(__dirname, "..", "node_modules", "@cofhe", "react", "dist", "index.js"),
  path.join(__dirname, "..", "node_modules", "@cofhe", "react", "dist", "index.cjs"),
];

let patched = 0;

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, "utf8");

  // Patch 1: validateAndCompactizeSteps — add ?? []
  const buggy1 = "currentKey ? steps[currentKey] : []";
  const fixed1 = "currentKey ? (steps[currentKey] ?? []) : []";
  if (content.includes(buggy1) && !content.includes(fixed1)) {
    content = content.replace(buggy1, fixed1);
  }

  // Patch 2: lastStep — guard against undefined steps[currentKey]
  const buggy2Re = /const lastStep = currentKey \? steps\[currentKey\]\[steps\[currentKey\]\.length - 1\] : null;/g;
  const fixed2 = "const currentSteps = currentKey ? steps[currentKey] : null;\n  const lastStep = currentSteps ? currentSteps[currentSteps.length - 1] : null;";
  if (buggy2Re.test(content)) {
    content = content.replace(buggy2Re, fixed2);
  }

  // Patch 3: Replace all @mui/icons-material imports with inline stubs
  const muiImportRe = /import \w+ from "@mui\/icons-material\/[^"]+";/g;
  if (muiImportRe.test(content)) {
    content = content.replace(muiImportRe, "");
    // Inject stubs after the last "use client" or at the very beginning
    content = MUI_ICON_STUBS + content;
  }

  fs.writeFileSync(file, content, "utf8");
  patched++;
}

if (patched > 0) {
  console.log(`[patch-cofhe] Patched ${patched} file(s) in @cofhe/react`);
}
