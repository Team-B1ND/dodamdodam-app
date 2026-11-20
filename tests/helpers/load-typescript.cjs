const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

// Keep native/Expo modules outside Node while exercising the actual TS source.
module.exports = function loadTypeScript(relativePath, dependencies = {}, globals) {
  const filename = path.resolve(__dirname, "../..", relativePath);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  });
  const wrapper = `(function(require, module, exports) {\n${outputText}\n})`;
  const compiled = globals
    ? vm.runInNewContext(wrapper, globals, { filename })
    : vm.runInThisContext(wrapper, { filename });
  const module = { exports: {} };
  compiled(request => {
    if (Object.prototype.hasOwnProperty.call(dependencies, request)) {
      return dependencies[request];
    }
    throw new Error(`Unexpected test dependency: ${request}`);
  }, module, module.exports);
  return module.exports;
};
