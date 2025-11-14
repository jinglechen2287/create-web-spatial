#!/usr/bin/env node
import input from "@inquirer/input";
// import select from "@inquirer/select";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import degit from "degit";

async function getProjectInfo() {
  const rawName = await input({
    message: "Project name?",
    default: "my-web-spatial-app",
  });
  const name = rawName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

  //   console.log("");

  //   const framework = (await select({
  //     message: "Framework?",
  //     default: "react",
  //     choices: [
  //       { value: "react" },
  //       { value: "vanilla - coming soon", disabled: true },
  //     ],
  //   })) as "react";

  //   console.log("");

  //   const language = await select<"typeScript" | "javaScript">({
  //     message: "Project language?",
  //     default: "typeScript",
  //     choices: [{ value: "typeScript" }, { value: "javaScript" }],
  //   });

  return { name, framework: "react" as const, language: "typeScript" as const };
}

function getTemplateUrl(
  framework: "react" | "vanilla",
  language: "typeScript" | "javaScript"
) {
  if (framework === "react" && language === "typeScript")
    return "https://github.com/jinglechen2287/webspatial-starter.git";
  else 
    throw new Error(`Unsupported framework: ${framework} and language: ${language}`);
}

async function applyProjectName(name: string, targetDir: string) {
  const filesToUpdate = ["package.json", "index.html"];

  for (const file of filesToUpdate) {
    const filePath = path.join(targetDir, file);
    let content = await fs.readFile(filePath, "utf8");
    const replaced = content.replace(/web-spatial-starter/g, name);
    await fs.writeFile(filePath, replaced, "utf8");
  }
}

async function removeLicenseFile(targetDir: string) {
  const licenseFilePath = path.join(targetDir, "LICENSE");
  await fs.remove(licenseFilePath);
}

async function setupProject(
  name: string,
  framework: "react" | "vanilla",
  language: "typeScript" | "javaScript"
) {
  const targetDir = path.resolve(process.cwd(), name);
  const templateDir = getTemplateUrl(framework, language);

  try {
    const emitter = degit(templateDir);
    await emitter.clone(targetDir);
  } catch (error) {
    console.error(`Error copying template: ${error}`);
    throw error;
  }

  await applyProjectName(name, targetDir);
  await removeLicenseFile(targetDir);
}

async function main() {
  console.log(
    "create-web-spatial only supports TypeScript React template for now. More templates coming soon!\n"
  );
  const { name, framework, language } = await getProjectInfo();
  await setupProject(name, framework, language);
}

const executedDirectly = (() => {
  const argvPath = process.argv[1];
  if (!argvPath) return false;
  try {
    const argvReal = fs.realpathSync(argvPath);
    const moduleReal = fs.realpathSync(fileURLToPath(import.meta.url));
    return argvReal === moduleReal;
  } catch {
    return false;
  }
})();

if (executedDirectly) {
  await main().catch((error) => {
    console.error("\nError:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
