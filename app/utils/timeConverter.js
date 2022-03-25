const convertTime12to24 = (time12h) => {
  const [fullMatch, time, modifier] = time12h.match(/(\d?\d:\d\d)\s*(\w{2})/i);

  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = 0;
  }

  if (modifier === "PM") {
    hours = parseInt(hours, 10) + 12;
  }

  return parseInt(hours);
};

const convertTimeHourMinute = (time12h) => {
  const [fullMatch, time, modifier] = time12h.match(/(\d?\d:\d\d)\s*(\w{2})/i);

  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = 0;
  }

  if (modifier === "PM") {
    hours = parseInt(hours, 10) + 12;
  }

  return { hour: parseInt(hours), minute: parseInt(minutes) };
};

function to12Time(time) {
  // Check correct time format and split into components
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [
    time,
  ];

  if (time.length > 1) {
    // If time format correct
    time = time.slice(1); // Remove full string match value
    time[5] = +time[0] < 12 ? "AM" : "PM"; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(""); // return adjusted time or original string
}

export { convertTime12to24, convertTimeHourMinute, to12Time };
