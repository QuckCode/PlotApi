const User = require("./model");
const crypto = require("../utils/crypto");
const { logInApi } = require("../utils/login");
const jwt = require("jsonwebtoken");
const { missingParameterError } = require("../utils/error");
const config = require("@config");
const firebase = require("../../firebase");
const Department = require("../ClassSections/model");
const Level = require("../Class/model");
const _ = require("lodash");
const { user, admin, staff } = require("@constants/SchemaEnum");

const createParent = function (req, res, next) {
  const { matricNumber, password, role } = req.body;

  if (!matricNumber)
    return res
      .status(500)
      .send(missingParameterError(" Missing matric number"));

  if (!password)
    return res.status(500).send(missingParameterError(" Missing password"));
};

const getUserById = function (req, res, next) {
  const { userId } = req.params;

  if (!userId)
    return res.status(500).send(missingParameterError(" Missing UserId"));

  User.findById(userId)
    .exec()
    .then((user) => {
      if (!user)
        return res
          .status(500)
          .send({ error: `There was know user found with this ${userId}` });
      return res.json(user);
    })
    .catch((e) => {
      return res.status(500).send({ error: "An error occurred" });
    });
};

const getUsers = function (req, res, next) {
  User.find({})
    .select("-password")
    .populate({ path: "department", select: "name" })
    .populate({ path: "level", select: "number" })
    .lean()
    .exec()
    .then((user) =>
      res.json(
        user.map((data) => {
          return {
            image: data.image,
            id: data._id,
            role: data.role,
            matricNumber: data.matricNumber,
            name: data.name,
            department: data.department ? data.department.name : null,
            level: data.level ? parseInt(data.level.number) : null,
          };
        })
      )
    )
    .catch((e) => {
      res.status(500).send({ error: "An error occurred" });
      console.log(e);
    });
};

const getUsersByLevel = function (req, res, next) {
  const { level } = req.params;
  User.find({ level })
    .select("-password")
    .populate({ path: "department", select: "name" })
    .populate({ path: "level", select: "number" })
    .lean()
    .exec()
    .then((user) =>
      res.json(
        user.map((data) => {
          return {
            image: data.image,
            id: data._id,
            role: data.role,
            matricNumber: data.matricNumber,
            name: data.name,
            department: data.department ? data.department.name : null,
            level: data.level ? parseInt(data.level.number) : null,
            present: false,
          };
        })
      )
    )
    .catch((e) => {
      res.status(500).send({ error: "An error occurred" });
      console.log(e);
    });
};

/* Delete a user */
const deleteUserById = function (req, res, next) {
  const { userId } = req.params;
  console.log(userId);
  User.findByIdAndRemove(userId)
    .exec()
    .then((user) => {
      return res.json({ message: `Successfully delete user ${user.name}` });
    })
    .catch((e) => {
      return res.status(500).send({ error: " Could not delete user" });
    });
};

// Login is a curried function which takes passport
const login = function (passport) {
  return function (req, res, next) {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err || !user) {
        console.log(err, info);
        return res.status(400).json({
          error: "User Id or Password is wrong",
        });
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          next(err);
        }
        user = user._doc;
        // Provide data since user is not a proper serialized object
        let userData = { ...user };
        Department.findById(user.department)
          .then((data) => {
            userData = { ...user, department: data.name };
            Level.findById(user.level)
              .then((data) => {
                userData.level = data.number;
                const token = jwt.sign(userData, config.SECRET);
                return res.json({
                  success: true,
                  token,
                });
              })
              .catch((err) => {
                userData.level = "";
                console.log(err);
              });
          })
          .catch((err) => {
            userData.department = "";
            console.log(err);
          });
      });
    })(req, res);
  };
};

const verifyToken = (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return res.status(500).send(missingParameterError("Missing Token"));
  }
  confirmToken(token).then((value) => {
    return res.send({ token: token });
  });
};

function confirmToken(token) {
  return new Promise((resolve, reject) => {
    const userData = jwt.verify(token, config.SECRET);
    User.findById(userData._id)
      .then((user) => {
        if (
          user.matricNumber === userData.matricNumber &&
          user.password === userData.password
        ) {
          resolve(true);
        } else reject(false);
      })
      .catch(() => {
        reject(false);
      });
  });
}

const changePassword = function (req, res, next) {
  console.log(req.user);
};

module.exports = {};
