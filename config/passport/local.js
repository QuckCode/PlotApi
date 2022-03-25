import passport from "passport";

import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import Student from "@app/Students/model";
import Staff from "@app/Staff/model";
import crypto from "@app/utils/crypto";
import config from "../../config";

/**
 * Expose
 */
// passport related code
passport.use(
  "student",
  new LocalStrategy(
    {
      usernameField: "admissionNumber",
      passwordField: "password",
      session: false,
    },
    async (admissionNumber, password, done) => {
      Student.findOne(
        {
          admissionNumber: {
            $regex: new RegExp("^" + admissionNumber.toLowerCase(), "i"),
          },
        },
        function (err, student) {
          if (err) return done(err);
          if (!student) {
            return done(null, false, { message: " Student Does Not Exist" });
          }
          console.log(crypto.decrypt(student.password));
          if (crypto.decrypt(student.password) !== password) {
            return done(null, false, {
              message: "Password Does Not Match Student Password",
            });
          }
          return done(null, student);
        }
      );
    }
  )
);

passport.use(
  "staff",
  new LocalStrategy(
    {
      usernameField: "regNumber",
      passwordField: "password",
      session: false,
    },
    function (regNumber, password, done) {
      Staff.findOne(
        {
          regNumber: { $regex: new RegExp("^" + regNumber.toLowerCase(), "i") },
        },
        function (err, staff) {
          if (err) return done(err);
          if (!staff) {
            return done(null, false, { message: "Staff Does Not Exist" });
          }
          if (crypto.decrypt(staff.password) !== password) {
            return done(null, false, {
              message: "Password Does Not Match Staff Password",
            });
          }
          return done(null, staff);
        }
      );
    }
  )
);

passport.use(
  "admin",
  new LocalStrategy(
    {
      usernameField: "regNumber",
      passwordField: "password",
      session: false,
    },
    function (regNumber, password, done) {
      Staff.findOne(
        {
          regNumber: { $regex: new RegExp("^" + regNumber.toLowerCase(), "i") },
          type: "admin",
        },
        function (err, staff) {
          if (err) return done(err);
          if (!staff) {
            return done(null, false, { message: "Admin Does Not Exist" });
          }
          if (crypto.decrypt(staff.password) !== password) {
            return done(null, false, {
              message: "Password Does Not Match Admin Password",
            });
          }
          return done(null, staff);
        }
      );
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.SECRET,
    },
    function (jwtPayload, cb) {
      if (!jwtPayload) {
        return cb({ error: "Not authorized" });
      }
      Student.findById(jwtPayload._id)
        .then((student) => {
          return cb(null, student);
        })
        .catch((err) => {
          console.log(err);
          return cb(err);
        });
    }
  )
);
