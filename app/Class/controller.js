import Class from "./model";
import {
  APIError,
  InValidParameterError,
  MissingParameterError,
} from "@errors/baseErrors";
import { getAllStudentInClassAggregate } from "./aggregation";
import Section from "@app/Section/model";
import School from "@app/School/model";

const createClass = async (req, res, next) => {
  const { className, section, school } = req.body;
  if (!className) return next(new MissingParameterError("Class Name"));
  if (!section) return next(new MissingParameterError("Section"));
  if (!school) return next(new MissingParameterError("School"));

  if (await Section.validateById(section))
    return next(new InValidParameterError("Section"));

  if (!(await School.validateById(school)))
    return next(new InValidParameterError("School"));

  if (section)
    try {
      await Class.create({ name: className, section, school });
      return res.send({
        status: "success",
        message: "Create User Successfully ",
      });
    } catch (error) {
      return next(new APIError(error.title, error.message));
    }
};

const fetchClass = async (req, res, next) => {
  const { school } = req.params;
  if (!school) return next(new MissingParameterError("School"));
  if (!(await School.validateById(school)))
    return next(new InValidParameterError("Section"));

  try {
    let classes = await Class.find({ school })
      .populate("section", "section")
      .lean()
      .exec();
    classes = classes.map(
      ({ section, name, school, _id, subjects, tests, hasSubjectGroup }) => ({
        section: section.section,
        sectionId: section._id,
        name,
        school,
        _id,
        subjects: subjects,
        hasSubjectGroup,
      })
    );
    return res.send(classes);
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const deleteClass = async (req, res, next) => {
  const { classId } = req.body;
  if (!classId) return next(new MissingParameterError("School"));
  if (!(await Class.validateById(classId)))
    return next(new InValidParameterError("Class Id"));
  try {
    let classN = await Class.findByIdAndRemove(classId).lean();
    return res.send({
      title: "success",
      message: ` Deleted class ${classN.name}`,
    });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const addClassSubject = async (req, res, next) => {
  const { classId, subjects } = req.body;

  if (!classId) return next(new MissingParameterError("Class Id"));
  if (!subjects) return next(new MissingParameterError("Subjects"));

  if (!(await Class.validateById(classId)))
    return next(new InValidParameterError("Class"));

  try {
    let classData = await Class.findById(classId).lean();
    await Class.findOneAndUpdate(
      { _id: classData._id },
      { $addToSet: { subjects: subjects } }
    );
    return res.send({ title: "Added Subjects Successfully " });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const fetchClassSubject = async (req, res, next) => {
  const { classId } = req.params;

  if (!classId) return next(new MissingParameterError("Class Id"));

  if (!(await Class.validateById(classId)))
    return next(new InValidParameterError("Class"));

  try {
    let classData = await Class.findById(classId).lean().populate("subjects");
    return res.send(classData.subjects);
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const removeClassSubject = async (req, res, next) => {
  const { classId, subjects } = req.body;

  if (!classId) return next(new MissingParameterError("Class Id"));
  if (!subjects) return next(new MissingParameterError("Subjects "));

  if (!(await Class.validateById(classId)))
    return next(new InValidParameterError("Class"));

  try {
    let classData = await Class.findById(classId).lean();
    await Class.findOneAndUpdate(
      { _id: classData._id },
      { $pullAll: { subjects: subjects } }
    );
    return res.send({ title: "Removed  Subjects  Success" });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const addClassTest = async (req, res, next) => {
  const { classId, tests } = req.body;

  if (!classId) return next(new MissingParameterError("Class Id"));
  if (!tests) return next(new MissingParameterError("Tests "));

  if (!(await Class.validateById(classId)))
    return next(new InValidParameterError("Class"));

  try {
    let classData = await Class.findById(classId).lean();
    await Class.findOneAndUpdate(
      { _id: classData._id },
      { $addToSet: { tests: tests } }
    );
    return res.send({ title: "success", message: "Added Tests Successfully" });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const fetchClassTest = async (req, res, next) => {
  const { classId } = req.params;

  if (!classId) return next(new MissingParameterError("Class Id"));

  if (!(await Class.validateById(classId)))
    return next(new InValidParameterError("Class"));

  try {
    let classData = await Class.findById(classId).lean().populate("tests");
    return res.send(classData.tests);
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const removeClassTest = async (req, res, next) => {
  const { classId, tests } = req.body;

  if (!classId) return next(new MissingParameterError("Class Id"));
  if (!tests) return next(new MissingParameterError("Tests "));

  if (!(await Class.validateById(classId)))
    return next(new InValidParameterError("Class"));

  try {
    let classData = await Class.findById(classId).lean();
    await Class.findOneAndUpdate(
      { _id: classData._id },
      { $pullAll: { tests: tests } }
    );
    return res.send({
      title: "success",
      message: "Removed Tests Successfully ",
    });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const getAllStudentInAClass = async (req, res, next) => {
  const { classId } = req.params;

  if (!classId) return next(new MissingParameterError("Class Id"));
  if (!(await Class.validateById(classId)))
    return next(new InValidParameterError("Class"));

  try {
    await Class.aggregate(getAllStudentInClassAggregate(classId)).exec(
      (err, result) => {
        if (err) return next(new APIError(null, err.message));
        if (result.length === 0)
          return next(new APIError("User Error", "No Class with this Id"));
        if (result[0].students.length === 0)
          return next(new APIError("User Error", "No Students in this Class"));
        return res.send(result[0].students);
      }
    );
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

const setHasSubjectGroup = async (req, res, next) => {
  try {
    const { hasSubjectGroup, classId } = req.body;
    if (!classId) return next(new MissingParameterError("Class Id"));
    if (hasSubjectGroup === undefined)
      return next(new MissingParameterError("Has Group Subject"));

    if (!(await Class.validateById(classId)))
      return next(new InValidParameterError("Class"));

    await Class.findOneAndUpdate({ _id: classId }, { hasSubjectGroup });

    return res.send({
      title: "success",
      message: "Set Has Subject Group Successfully",
    });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};
export default {
  createClass,
  fetchClass,
  addClassSubject,
  removeClassSubject,
  fetchClassSubject,
  addClassTest,
  removeClassTest,
  fetchClassTest,
  getAllStudentInAClass,
  deleteClass,
  setHasSubjectGroup,
};
