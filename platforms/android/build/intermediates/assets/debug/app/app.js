var application = require("application");
var UserViewModel = require("./view-models/user-view-model");
var OnlineApiModel = require("./view-models/online-delivery-view-model");

application.cssFile = "./app.css";
global.user = new UserViewModel({
  email: "admin@app-delivery.com",
  password: "Abcd1234"
});

global.apiModel = new OnlineApiModel();

global.deliveryViewModel = null;
application.start({ moduleName: "login/login"});
