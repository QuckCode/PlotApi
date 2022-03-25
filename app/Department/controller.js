import Department from "./model";
import { missingParameterError } from "../utils/error";
import { APIError } from "@errors/baseErrors";

const createDepartment = (req, res, next) => {
  const { name, school } = req.body;

  if (!name)
    return next(
      new APIError(
        "Missing parameter",
        missingParameterError("Department name")
      )
    );
  if (!school)
    return next(
      new APIError("Missing parameter", missingParameterError("School"))
    );

  Department.find({ name: name, school }).then((value) => {
    if (value.length !== 0) {
      return next(
        new APIError("Duplicate Value", " This Department already exist")
      );
    } else {
      const department = new Department({
        name,
        school,
      });
      department
        .save()
        .then((department) => res.json({ message: "Created Department" }))
        .catch((err) => {
          return next(new APIError("User Error", err.message));
        });
    }
  });
};

const editDepartment = (req, res, next) => {
  const { department, name } = req.body;
  if (department) {
    Department.findById(department)
      .then((dep) => {
        dep.name = name;
        dep.save().then(() => {
          return res.json({ message: "Edited  Department" });
        });
      })
      .catch((err) => {
        return next(new APIError("User Error", err.message));
      });
  } else {
    return next(new APIError("User Error", "No User Department"));
  }
};

const fetchDepartment = (req, res, next) => {
  const { school } = req.params;
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );

  Department.find({ school })
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

export default { createDepartment, fetchDepartment, editDepartment };
