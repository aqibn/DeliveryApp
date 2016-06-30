var frameModule = require("ui/frame");
var viewModule = require("ui/core/view");
var UserViewModel = require("../view-models/user-view-model");
var dialogsModule = require("ui/dialogs");
var applicationSettings = require("application-settings");

var email;



exports.loaded = function(args) {
  var page = args.object;
  var stringUser = applicationSettings.getString("user");
    if (stringUser !== undefined) {
      console.log(stringUser);
    var user = JSON.parse(stringUser);
    global.user.userData = user;
    frameModule.topmost().navigate({
      moduleName: "main-page/main-page",
      context: {
        status: "login",
        user: user
      }
               });
  }
  
  page.bindingContext = global.user;
};

exports.signIn = function() {
  global.user.login()
     .catch(function(error) {
         console.log(error);
         dialogsModule.alert({
             message: "Unfortunately we could not find your account.",
             okButtonText: "OK"
         });
         return Promise.reject();
     })
     .then(function(data) {
          console.log("Success");
        if(data.role.name === "ADMIN") {
          console.log("ADMIn");
          applicationSettings.setString("user", JSON.stringify(data));
         frameModule.topmost().navigate({
           moduleName: "main-page/main-page",
           context: {
             status: "login",
             user: data
           }
                    });
       } else {

         console.log("worker");
       }
     });
  // frameModule.topmost().navigate({moduleName: "main-page/main-page"});
};

exports.register = function() {
  var topmost = frameModule.topmost();
  // topmost.navigate("views/register/register");
};
