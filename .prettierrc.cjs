/** @type {import('prettier').Config} */
const prettierConfig = {
  plugins: ['prettier-plugin-sh'],
  singleQuote: true,
  printWidth: 120,
};

const config = {
  ...prettierConfig,
};

module.exports = config;
