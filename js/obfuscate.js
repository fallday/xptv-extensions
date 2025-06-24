const { obfuscate } = require('javascript-obfuscator');
const fs = require('fs');

const code = fs.readFileSync('bjlt.js', 'utf8');
const options = {
    compact: true,
    controlFlowFlattening: true, // 控制流扁平化
    stringArray: true,          // 字符串加密
};

const result = obfuscate(code, options);
fs.writeFileSync('bjlt.min.js', result.getObfuscatedCode());