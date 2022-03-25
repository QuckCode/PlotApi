import { APIError } from "@errors/baseErrors";
import { missingParameterError } from "../utils/error";
import Designation from "./model";

const createDesignation = (req, res, next) => {
  const { name, school } = req.body;

  if (!name)
    return next(
      new APIError(
        "Missing parameter",
        missingParameterError("Designation name")
      )
    );
  if (!school)
    return next(
      new APIError("Missing parameter", missingParameterError("School"))
    );

  Designation.find({ name: name, school }).then((value) => {
    if (value.length !== 0) {
      return next(
        new APIError("Duplicate Value", " This Designation already exist")
      );
    } else {
      const designation = new Designation({
        name,
        school,
      });
      designation
        .save()
        .then((designation) => res.json({ message: "Created Designation" }))
        .catch((err) => {
          return next(new APIError("User Error", err.message));
        });
    }
  });
};

const editDesignation = (req, res, next) => {
  const { designation, name } = req.body;
  if (designation) {
    Designation.findById(designation)
      .then((dep) => {
        dep.name = name;
        dep.save().then(() => {
          return res.json({ message: "Edited  Designation" });
        });
      })
      .catch((err) => {
        return next(new APIError("User Error", err.message));
      });
  } else {
    return next(new APIError("User Error", "No User Designation"));
  }
};

const fetchDesignation = (req, res, next) => {
  const { school } = req.params;
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );

  Designation.find({ school })
    .lean()
    .exec()
    .then((data) => {
      return res.send(data);
    })
    .catch((err) => {
      console.log(err);
      return next(new APIError("User Error", "please an error occurred"));
    });
};

const deleteDesignation = (req, res, next) => {
  let { id } = req.params;
  if (id) {
    Designation.findById(id)
      .then((data) => {
        data.deleteOne();
        return res.json({ message: "Deleted Designation" });
      })
      .catch((err) => {
        return next(new APIError("User Error", err.message));
      });
  } else {
    return next(new APIError("User Error", "Please an error occurred"));
  }
};

export default {
  createDesignation,
  fetchDesignation,
  editDesignation,
  deleteDesignation,
};
