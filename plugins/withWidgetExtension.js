const {
  withEntitlementsPlist,
  withXcodeProject,
  withDangerousMod,
} = require("expo/config-plugins");
const path = require("path");
const fs = require("fs");

const APP_GROUP = "group.com.b1nd.dodam.student.shared";
const WIDGET_TARGET = "dodamwidgetExtension";
const NOTIF_TARGET = "NotificationService";

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

function collectSwiftFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectSwiftFiles(full));
    } else if (entry.name.endsWith(".swift") || entry.name.endsWith(".m")) {
      results.push(full);
    }
  }
  return results;
}

// Copy widget + notification source files to ios/
function withCopyFiles(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const iosRoot = config.modRequest.platformProjectRoot;
      const projectRoot = config.modRequest.projectRoot;

      // Widget files
      const widgetSrc = path.join(projectRoot, "native", "dodamwidget");
      const widgetDest = path.join(iosRoot, WIDGET_TARGET);
      if (fs.existsSync(widgetSrc)) {
        copyDirSync(path.join(widgetSrc, "Source"), widgetDest);
        copyDirSync(
          path.join(widgetSrc, "Resource", "Assets.xcassets"),
          path.join(widgetDest, "Assets.xcassets")
        );
      }

      // Widget entitlements
      const entSrc = path.join(
        projectRoot,
        "native",
        "dodamwidgetExtension.entitlements"
      );
      if (fs.existsSync(entSrc)) {
        fs.copyFileSync(
          entSrc,
          path.join(iosRoot, "dodamwidgetExtension.entitlements")
        );
      }

      // Notification Service Extension files
      const notifSrc = path.join(projectRoot, "native", "NotificationService");
      const notifDest = path.join(iosRoot, NOTIF_TARGET);
      if (fs.existsSync(notifSrc)) {
        copyDirSync(notifSrc, notifDest);
      }

      return config;
    },
  ]);
}

// Add app group entitlement to main app
function withAppGroupEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.security.application-groups"] = [APP_GROUP];
    return config;
  });
}

// Add widget + notification targets to Xcode project
function withExtensionTargets(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const iosRoot = config.modRequest.platformProjectRoot;
    const bundleId = config.ios?.bundleIdentifier || "com.b1nd.dodamdodamapp";

    // --- Widget Extension Target ---
    addExtensionTarget(project, iosRoot, {
      targetName: WIDGET_TARGET,
      bundleId: `${bundleId}.dodamwidget`,
      infoPlistPath: `${WIDGET_TARGET}/Info.plist`,
      entitlementsPath: "dodamwidgetExtension.entitlements",
      deploymentTarget: "17.0",
    });

    // --- Notification Service Extension Target ---
    addExtensionTarget(project, iosRoot, {
      targetName: NOTIF_TARGET,
      bundleId: `${bundleId}.NotificationService`,
      infoPlistPath: `${NOTIF_TARGET}/Info.plist`,
      entitlementsPath: null,
      deploymentTarget: "15.1",
    });

    return config;
  });
}

function addExtensionTarget(project, iosRoot, opts) {
  const { targetName, bundleId, infoPlistPath, entitlementsPath, deploymentTarget } = opts;

  // Skip if target already exists
  if (project.pbxTargetByName(targetName)) return;

  const targetDir = path.join(iosRoot, targetName);
  if (!fs.existsSync(targetDir)) return;

  // Collect source files; paths relative to targetDir for correct group-based resolution
  const absFiles = collectSwiftFiles(targetDir);
  const relFiles = absFiles.map((f) => path.relative(targetDir, f));

  // Create PBX group for the target
  const group = project.addPbxGroup([], targetName, targetName);
  const groupKey = group.uuid;

  // Add group to main project group
  const mainGroupId = project.getFirstProject().firstProject.mainGroup;
  const mainGroup = project.hash.project.objects.PBXGroup[mainGroupId];
  if (mainGroup && !mainGroup.children.some((c) => c.value === groupKey)) {
    mainGroup.children.push({ value: groupKey, comment: targetName });
  }

  // Add the extension target
  const target = project.addTarget(
    targetName,
    "app_extension",
    targetName,
    bundleId
  );

  project.addBuildPhase([], "PBXSourcesBuildPhase", "Sources", target.uuid);

  // Add source files to target's compile sources build phase
  // relFiles are relative to targetDir so the PBXFileReference path resolves
  // correctly within the group (group.path = targetName, file.path = relative-to-group)
  for (const relFile of relFiles) {
    project.addSourceFile(relFile, { target: target.uuid }, groupKey);
  }

  // Add asset catalog if exists
  const assetsDir = path.join(targetDir, "Assets.xcassets");
  if (fs.existsSync(assetsDir)) {
    project.addBuildPhase([], "PBXResourcesBuildPhase", "Resources", target.uuid);
    const assetsRel = `${targetName}/Assets.xcassets`;
    try {
      project.addResourceFile(assetsRel, { target: target.uuid });
    } catch (_) {
      // Asset catalog may already be registered
    }
  }

  // Configure build settings
  const configs = project.pbxXCBuildConfigurationSection();
  for (const key in configs) {
    const cfg = configs[key];
    if (
      typeof cfg === "object" &&
      cfg.buildSettings &&
      cfg.buildSettings.PRODUCT_BUNDLE_IDENTIFIER === `"${bundleId}"`
    ) {
      cfg.buildSettings.INFOPLIST_FILE = `"${infoPlistPath}"`;
      cfg.buildSettings.SWIFT_VERSION = "5.0";
      cfg.buildSettings.TARGETED_DEVICE_FAMILY = '"1"';
      cfg.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = deploymentTarget;
      cfg.buildSettings.GENERATE_INFOPLIST_FILE = "YES";
      cfg.buildSettings.CURRENT_PROJECT_VERSION = "1";
      cfg.buildSettings.MARKETING_VERSION = "1.0";
      cfg.buildSettings.SWIFT_EMIT_LOC_STRINGS = "YES";
      cfg.buildSettings.CODE_SIGN_STYLE = "Automatic";
      // Let CocoaPods xcconfig control these to avoid override warnings
      cfg.buildSettings.CLANG_CXX_LANGUAGE_STANDARD = '"$(inherited)"';
      cfg.buildSettings.CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = '"$(inherited)"';

      if (entitlementsPath) {
        cfg.buildSettings.CODE_SIGN_ENTITLEMENTS = `"${entitlementsPath}"`;
      }
    }
  }

  // `addTarget(..., "app_extension")` already embeds the product in the main app.
}

module.exports = function withWidgetExtension(config) {
  config = withCopyFiles(config);
  config = withAppGroupEntitlement(config);
  config = withExtensionTargets(config);
  return config;
};
