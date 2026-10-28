const { withXcodeProject } = require("expo/config-plugins");
const path = require("path");
const fs = require("fs");

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function normalizeXcodeValue(value) {
  return typeof value === "string" ? value.replace(/^"|"$/g, "") : value;
}

function hasNativeModulesGroup(project) {
  const groups = project.hash.project.objects.PBXGroup;

  return Object.entries(groups).some(([key, group]) => {
    if (key.endsWith("_comment") || typeof group !== "object") return false;

    const name = normalizeXcodeValue(group.name);
    const groupPath = normalizeXcodeValue(group.path);
    return name === "NativeModules" || groupPath?.endsWith("/NativeModules");
  });
}

module.exports = function withNativeModules(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const iosRoot = config.modRequest.platformProjectRoot;
    const projectRoot = config.modRequest.projectRoot;
    const appName = config.modRequest.projectName;

    const nativeModulesSource = path.join(projectRoot, "native", "NativeModules");
    const nativeModulesDest = path.join(iosRoot, appName, "NativeModules");

    if (!fs.existsSync(nativeModulesSource)) return config;

    // Copy native modules into ios/ folder
    copyDirSync(nativeModulesSource, nativeModulesDest);

    // 기존 프로젝트에 이미 등록된 그룹과 build phase를 재생성하지 않는다.
    if (hasNativeModulesGroup(project)) return config;

    const targetKey = project.getFirstTarget().uuid;

    // Collect all source files
    const allFiles = [];
    for (const moduleName of fs.readdirSync(nativeModulesSource)) {
      const moduleDir = path.join(nativeModulesDest, moduleName);
      if (!fs.statSync(moduleDir).isDirectory()) continue;
      for (const file of fs.readdirSync(moduleDir)) {
        if (file.endsWith(".swift") || file.endsWith(".m")) {
          allFiles.push(path.join(appName, "NativeModules", moduleName, file));
        }
      }
    }

    // Create group and add files
    const group = project.addPbxGroup(allFiles, "NativeModules", path.join(appName, "NativeModules"));
    const groupKey = Object.keys(project.hash.project.objects.PBXGroup).find((key) => {
      const g = project.hash.project.objects.PBXGroup[key];
      return typeof g === "object" && g.name === "NativeModules";
    });

    // Add group to main group
    const mainGroupId = project.getFirstProject().firstProject.mainGroup;
    const mainGroup = project.hash.project.objects.PBXGroup[mainGroupId];
    if (mainGroup && groupKey && !mainGroup.children.some((c) => c.value === groupKey)) {
      mainGroup.children.push({ value: groupKey, comment: "NativeModules" });
    }

    // Add source files to build phase
    for (const filePath of allFiles) {
      project.addSourceFile(filePath, { target: targetKey }, groupKey);
    }

    return config;
  });
};
