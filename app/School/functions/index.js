import School from "../model";

export const isValidSchoolById = async (schoolId) => {
  try {
    let school = await School.findById(schoolId);
    return school ? true : false;
  } catch (error) {
    return false;
  }
};
