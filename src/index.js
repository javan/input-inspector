import "./index.css"
import { Application } from "stimulus"
import ApplicationController from "./controllers/application_controller"
import ProfileController from "./controllers/profile_controller"

const application = new Application
application.register("application", ApplicationController)
application.register("profile", ProfileController)
application.start()
