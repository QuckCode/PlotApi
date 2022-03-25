import controller from "./controller";
import { app } from "../../server";
const {
  GenerateScratchCard,
  GetScratchCard,
  UseScratchCard,
  DeleteCard,
  GetUsedScratchCard,
  StatsScratchCard,
} = require("./routes");
app.post(GenerateScratchCard, controller.generateScratchCard);
app.get(GetScratchCard, controller.getAllScratchCard);
app.post(UseScratchCard, controller.useScratchCard);
app.get(GetUsedScratchCard, controller.getAllUsedScratchCard);
app.get(StatsScratchCard, controller.getScratchCardStat);
app.delete(DeleteCard, controller.deleteUsedScratchCard);
