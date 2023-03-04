module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["plugin:vue/essential", "eslint:recommended"],
  rules: {
    "no-console": 0,
    "no-undef": 0,
    "no-unused-vars": 0,
    "no-debugger": process.env.VUE_APP_ENV === "PROD" ? "error" : "off",
  },
  parserOptions: {
    parser: "babel-eslint",
  },
}
