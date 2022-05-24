import { APIError } from "@root/errors/baseErrors";
import Student from "../Students/model";
// const index = function (req, res) {
//   res.send("SUCCESS");
// };

export const getStudentByAdmissionNumberQrCode = async (req, res, next) => {
  try {
    const { admissionNumber } = req.params;
    if (!admissionNumber)
      return next(new APIError("Missing Parameter", "Admission  Number"));
    let newStudent = admissionNumber.replace(/-/gi, "/");
    let data = await Student.findOne({
      admissionNumber: newStudent,
      active: true,
    })
      .select("-behaviourScores -skillScores -testScores -password")
      .populate("class arm school")
      .lean();
    if (!data) throw new Error("Student not found");
    let name = "";
    if (!data.name)
      name = `${data.firstName} ${data.middleName}  ${data.srnName}`;
    let className = `${data.class.name} ${data.arm.character}`;
    let gender = data.gender ? "M" : "F";
    let image = data.passport;
    let response = { ...data, class: className, name, gender, phone: image };
    return res.send(response);
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};
