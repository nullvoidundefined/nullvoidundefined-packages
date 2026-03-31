#!/usr/bin/env node

import {
    existsSync,
    copyFileSync,
    readFileSync,
    writeFileSync,
    readdirSync,
    unlinkSync,
} from "node:fs";
import { dirname, join, resolve, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIGS_DIR = resolve(__dirname, "..", "configs");

const isDryRun = process.argv.includes("--dry-run");
const skipInstall = process.argv.includes("--skip-install");

const PKG_NAME = "@bottomlessmargaritas/formatting-configs";
const NAMESPACE = "bottomlessmargaritas";

// Namespaced filenames: prettier.config.js → prettier.config.bottomlessmargaritas.js
function namespacedFileName(file) {
    const ext = extname(file);
    const base = basename(file, ext);
    return `${base}.${NAMESPACE}${ext}`;
}

// Scripts reference the namespaced config files explicitly
const SCRIPTS_TO_ADD = {
    [`${NAMESPACE}:format`]: `prettier --config ${namespacedFileName("prettier.config.mjs")} --write "**/*.{js,jsx,ts,tsx,json,css,scss,md}"`,
    [`${NAMESPACE}:format:check`]: `prettier --config ${namespacedFileName("prettier.config.mjs")} --check "**/*.{js,jsx,ts,tsx,json,css,scss,md}"`,
    [`${NAMESPACE}:lint`]: `eslint --config ${namespacedFileName("eslint.config.js")} .`,
    [`${NAMESPACE}:lint:fix`]: `eslint --config ${namespacedFileName("eslint.config.js")} . --fix`,
};

const PEER_DEPS = {
    "@trivago/prettier-plugin-sort-imports": "^4",
    "@typescript-eslint/parser": "^8",
    eslint: "^9.0.0",
    "eslint-config-prettier": "^10",
    "eslint-plugin-security": "^3",
    "eslint-plugin-unused-imports": "^4",
    globals: "^15",
    prettier: "^3",
    "typescript-eslint": "^8",
};

const REACT_PEER_DEPS = {
    "@babel/eslint-parser": "^7",
    "eslint-plugin-jsx-a11y": "^6",
    "eslint-plugin-react": "^7",
    "eslint-plugin-react-hooks": "^5",
};

function findProjectRoot(startDir) {
    let dir = startDir;
    while (dir !== dirname(dir)) {
        if (existsSync(join(dir, "package.json"))) {
            return dir;
        }
        dir = dirname(dir);
    }
    return null;
}

function detectPackageManager(projectRoot) {
    if (existsSync(join(projectRoot, "pnpm-lock.yaml"))) {
        return "pnpm";
    }
    if (existsSync(join(projectRoot, "yarn.lock"))) {
        return "yarn";
    }
    if (existsSync(join(projectRoot, "bun.lockb")) || existsSync(join(projectRoot, "bun.lock"))) {
        return "bun";
    }
    return "npm";
}

function projectUsesReact(projectRoot) {
    try {
        const pkg = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf8"));
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        return "react" in allDeps || "next" in allDeps;
    } catch {
        return false;
    }
}

function copyConfigFiles(projectRoot) {
    const configFiles = readdirSync(CONFIGS_DIR);
    const currentNamespacedFiles = new Set(configFiles.map(namespacedFileName));
    let copied = 0;
    let skipped = 0;

    for (const file of configFiles) {
        const source = join(CONFIGS_DIR, file);
        const targetName = namespacedFileName(file);
        const target = join(projectRoot, targetName);

        if (existsSync(target)) {
            const sourceContent = readFileSync(source, "utf8");
            const targetContent = readFileSync(target, "utf8");

            if (sourceContent === targetContent) {
                skipped++;
                continue;
            }
        }

        if (isDryRun) {
            console.log(`[dry-run] Would write: ${targetName}`);
        } else {
            copyFileSync(source, target);
        }
        copied++;
    }

    // Remove stale namespaced config files from previous versions.
    // Only remove files that match known config patterns (eslint/prettier) to avoid
    // deleting user files that happen to contain the namespace in their name.
    const KNOWN_CONFIG_PREFIXES = ["eslint.config.", "prettier.config."];
    const namespacedPattern = `.${NAMESPACE}.`;
    let removed = 0;

    for (const file of readdirSync(projectRoot)) {
        if (
            file.includes(namespacedPattern) &&
            !currentNamespacedFiles.has(file) &&
            KNOWN_CONFIG_PREFIXES.some((prefix) => file.startsWith(prefix))
        ) {
            if (isDryRun) {
                console.log(`[dry-run] Would remove stale config: ${file}`);
            } else {
                unlinkSync(join(projectRoot, file));
            }
            removed++;
        }
    }

    console.log(`${PKG_NAME}: ${copied} config(s) written, ${skipped} unchanged, ${removed} stale removed`);
}

function updatePackageJsonScripts(projectRoot) {
    const pkgPath = join(projectRoot, "package.json");
    const raw = readFileSync(pkgPath, "utf8");
    const pkg = JSON.parse(raw);

    if (!pkg.scripts) {
        pkg.scripts = {};
    }

    const currentScriptNames = new Set(Object.keys(SCRIPTS_TO_ADD));
    let added = 0;
    let removed = 0;

    // Add/update current scripts
    for (const [name, command] of Object.entries(SCRIPTS_TO_ADD)) {
        if (pkg.scripts[name] !== command) {
            pkg.scripts[name] = command;
            added++;
        }
    }

    // Remove stale namespaced scripts from previous versions.
    // Only remove scripts matching known prefixes (format/lint) to avoid
    // deleting user-defined scripts that happen to use the namespace prefix.
    const KNOWN_SCRIPT_PREFIXES = [`${NAMESPACE}:format`, `${NAMESPACE}:lint`];
    for (const name of Object.keys(pkg.scripts)) {
        if (
            name.startsWith(`${NAMESPACE}:`) &&
            !currentScriptNames.has(name) &&
            KNOWN_SCRIPT_PREFIXES.some((prefix) => name.startsWith(prefix))
        ) {
            delete pkg.scripts[name];
            removed++;
        }
    }

    if (added > 0 || removed > 0) {
        if (isDryRun) {
            if (added > 0) console.log(`[dry-run] Would add/update ${added} script(s) in package.json`);
            if (removed > 0) console.log(`[dry-run] Would remove ${removed} stale script(s) from package.json`);
        } else {
            writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + "\n", "utf8");
        }
        console.log(`${PKG_NAME}: ${added} script(s) added/updated, ${removed} stale removed in package.json`);
    } else {
        console.log(`${PKG_NAME}: All namespaced scripts already up to date in package.json`);
    }
}

function installMissingPeers(projectRoot) {
    const pkgPath = join(projectRoot, "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    const usesReact = projectUsesReact(projectRoot);
    const requiredDeps = { ...PEER_DEPS, ...(usesReact ? REACT_PEER_DEPS : {}) };

    const missing = Object.entries(requiredDeps)
        .filter(([name]) => !(name in allDeps))
        .map(([name, version]) => `${name}@${version}`);

    if (missing.length === 0) {
        console.log(`${PKG_NAME}: All peer dependencies already installed`);
        return;
    }

    const pm = detectPackageManager(projectRoot);
    const installCmd =
        pm === "yarn"
            ? `yarn add --dev ${missing.join(" ")}`
            : `${pm} add -D ${missing.join(" ")}`;

    console.log(`${PKG_NAME}: Installing ${missing.length} missing peer dep(s) with ${pm}...`);

    if (isDryRun) {
        console.log(`[dry-run] Would run: ${installCmd}`);
    } else {
        try {
            execSync(installCmd, { cwd: projectRoot, stdio: "inherit" });
        } catch {
            console.warn(`${PKG_NAME}: Peer dependency install failed. Run manually:\n  ${installCmd}`);
        }
    }
}

function run() {
    const cwd = process.env.INIT_CWD || process.cwd();
    const projectRoot = findProjectRoot(cwd);

    if (!projectRoot) {
        console.error(`${PKG_NAME}: Could not find project root (no package.json found).`);
        process.exit(1);
    }

    copyConfigFiles(projectRoot);
    updatePackageJsonScripts(projectRoot);

    if (!skipInstall) {
        installMissingPeers(projectRoot);
    }
}

run();
