const path = require("node:path");
const vm = require("node:vm");
const babel = require("@babel/core");

function loadFlowModule(relativePath, dependencies = {}, globals = {}) {
  const filename = path.resolve(__dirname, "../../node_modules/react-native/Libraries/Blob", relativePath);
  const { code } = babel.transformFileSync(filename, {
    babelrc: false,
    configFile: false,
    plugins: ["@babel/plugin-transform-flow-strip-types", "@babel/plugin-transform-modules-commonjs"],
  });
  const module = { exports: {} };
  const compiled = vm.runInNewContext(`(function(require, module, exports) {\n${code}\n})`, globals, { filename });
  compiled(request => {
    if (Object.prototype.hasOwnProperty.call(dependencies, request)) return dependencies[request];
    throw new Error(`Unexpected React Native URL dependency: ${request}`);
  }, module, module.exports);
  return module.exports;
}

// Exercise the installed React Native polyfills, whose behavior differs from Node's URL APIs.
const searchParams = loadFlowModule("URLSearchParams.js");
const url = loadFlowModule("URL.js", {
  "./NativeBlobModule": { __esModule: true, default: null },
  "./URLSearchParams": searchParams,
}, { URLSearchParams: searchParams.URLSearchParams });

module.exports = { URL: url.URL, URLSearchParams: searchParams.URLSearchParams };
