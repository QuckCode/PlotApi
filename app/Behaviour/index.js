import controller from "./controller";
import { app } from "../../server";
import { Behaviour, BehaviourFetch } from "./routes";

app.post(Behaviour, controller.createBehaviour);

app.get(BehaviourFetch, controller.fetchBehaviour);

app.delete(Behaviour, controller.deleteBehaviour);
