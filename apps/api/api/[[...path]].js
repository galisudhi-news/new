// Vercel function entry for the whole API surface (/api and everything under it).
// It delegates to the tsc-compiled Nest app in dist/ — compiling through
// `nest build` (not the bundler) is what preserves the decorator metadata
// Nest's dependency injection relies on.
const { getHandler } = require("../dist/serverless");

module.exports = async (req, res) => {
  const express = await getHandler();
  return express(req, res);
};
