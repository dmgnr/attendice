process.on("unhandledRejection", (reason) => {
  console.error(reason);
});

process.on("uncaughtException", (err) => {
  console.error(err);
});

import("./build/index.js");
