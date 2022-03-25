import express from "express";
import session from "express-session";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import bodyParser from "body-parser";
import methodOverride from "method-override";
const mongoStore = require("connect-mongo")(session);
import flash from "connect-flash";
import winston from "winston";
import config from ".";
import pkg from "../package.json";

const env = process.env.NODE_ENV || "development";

/**
 * Expose
 */

module.exports = function (app, passport) {
  // Compression middleware (should be placed before express.static)
  app.use(
    compression({
      threshold: 512,
    })
  );

  // Static files middleware
  app.use(express.static(config.root + "/public"));

  // Use winston on production
  var log;
  if (env !== "development") {
    log = {
      stream: {
        write: function (message) {
          winston.info(message);
        },
      },
    };
  } else {
    log = "dev";
  }

  // Don't log during tests
  // Logging middleware
  if (env !== "test") app.use(morgan(log));

  // set views path and default layout
  app.set("views", config.root + "/app/views");
  app.set("view engine", "jade");

  // expose package.json to views
  app.use(function (req, res, next) {
    res.locals.pkg = pkg;
    res.locals.env = env;
    next();
  });

  // bodyParser should be above methodOverride
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(bodyParser.json());
  app.use(
    methodOverride(function (req) {
      if (req.body && typeof req.body === "object" && "_method" in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
      }
    })
  );

  // cookieParser should be above session
  app.use(cookieParser());
  app.use(
    cookieSession({
      secret: "3 33hbjk3kjb3ekb2ek23e3bebe1njk3kj3wjk33wkjfwjk3dw3f",
    })
  );
  app.use(
    session({
      secret: pkg.name,
      proxy: true,
      resave: true,
      saveUninitialized: true,
      store: new mongoStore({
        url: config.db,
        collection: "sessions",
      }),
    })
  );

  // use passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // connect flash for flash messages - should be declared after sessions
  app.use(flash());

  // should be declared after session and flash
  // app.use(helpers(pkg.name));
};
