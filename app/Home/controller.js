import Student from "../Students/model";
import Staff from "../Staff/model";

// const index = function (req, res) {
//   res.send("SUCCESS");
// };

const index = async (req, res) => {
  let staffs = await Staff.find({});
  for (const staff of staffs) {
    let newNumber = staff.regNumber.replaceAll("/", "-");
    await Staff.update({ _id: staff._id }, { admissionNumber: newNumber });
  }
  let students = await Student.find({});
  for (const student of students) {
    let newAdmissionNumber = student.admissionNumber.replaceAll("/", "-");
    await Student.update(
      { _id: student._id },
      { admissionNumber: newAdmissionNumber }
    );
  }
  res.send("lala");
};
module.exports = {
  index,
};
