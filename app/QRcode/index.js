const controller = require("./controller");

const { app } = require("../../server");
const { QrCodeStudents } = require("./routes");

app.get(QrCodeStudents, controller.getStudentByAdmissionNumberQrCode);
