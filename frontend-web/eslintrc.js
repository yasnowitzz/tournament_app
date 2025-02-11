module.exports = {
    extends: ["next/core-web-vitals"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  };