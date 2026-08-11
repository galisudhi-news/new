// Vercel function entry for the whole API surface. vercel.json rewrites every
// path here, so Nest does the routing from req.url (its global prefix is "api").
//
// It delegates to the tsc-compiled Nest app in dist/ — compiling through
// `nest build` rather than the bundler is what preserves the decorator
// metadata Nest's dependency injection relies on.
const { getHandler } = require("../dist/serverless");

module.exports = async (req, res) => {
  const express = await getHandler();

  // Rewrites normally preserve the original path. If a platform ever hands us
  // the rewrite destination instead, restore the prefix so Nest still matches.
  if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url === "/" ? "" : req.url}`;
  }

  return express(req, res);
};
