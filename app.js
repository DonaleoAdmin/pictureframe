const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
// const http = require('http');
const bodyParser = require("body-parser");

const index = require("./routes/index");
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// set path for static assets
// app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("./public"));
// app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use("/node_modules", express.static("./node_modules"));
// app.use("/css", express.static(path.join(__dirname, "/public/css")));
// app.use("/img", express.static(path.join(__dirname, "/public/img")));
// app.use("/js", express.static(path.join(__dirname, "/public/js")));
app.use("/btcss", express.static("./node_modules/bootstrap/dist/css"));
app.use("/btjs", express.static("./node_modules/bootstrap/dist/js"));
app.use("/font", express.static("./node_modules/bootstrap-icons/font"));
app.use("/font", express.static("./node_modules/bootstrap-icons/font"));
app.use("/icons", express.static("./node_modules/bootstrap-icons/icons"));

// set routes
app.use("/", index);

// SSL options
const sslOptions = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  res.render("error", { status: err.status, message: err.message });
});

// Create an HTTPS server
https.createServer(sslOptions, app);
// https.createServer(sslOptions, app).listen(3000, () => {
//   console.log("HTTPS Server running on https://localhost:3000");
// });

// For Local and Debug run
// const port = process.env.PORT || 3000;
// const port = 3000;
// app.listen(port, () => console.log(`Listening on port ${port}...`));
// app.set("port", port);

// app.get('/', (req, res) => {
//     res.send('Hello World');
// })

module.exports = app;
