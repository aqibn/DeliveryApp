var frameModule = require("ui/frame");
var viewModule = require("ui/core/view");
var UserViewModel = require("../view-models/user-view-model");
var dialogsModule = require("ui/dialogs");

var email;

var user = new UserViewModel({
  email: "admin@app-delivery.com",
  password: "Abcd1234"
});

exports.loaded = function(args) {
  var page = args.object;
  if (page.ios) {
    var navigationBar = frameModule.topmost().ios.controller.navigationBar;
    navigationBar.barStyle = UIBarStyle.UIBarStyleBlack;
}
  page.bindingContext = user;
};

exports.signIn = function() {
  user.login()
     .catch(function(error) {
         console.log(error);
         dialogsModule.alert({
             message: "Unfortunately we could not find your account.",
             okButtonText: "OK"
         });
         return Promise.reject();
     })
     .then(function() {
          console.log("Success");
         frameModule.topmost().navigate({moduleName: "main-page/main-page"});
     });

};

exports.register = function() {
  var topmost = frameModule.topmost();
  // topmost.navigate("views/register/register");
};
