var frameModule = require("ui/frame");
var viewModule = require("ui/core/view");
var UserViewModel = require("../view-models/user-view-model");
var dialogsModule = require("ui/dialogs");
var applicationSettings = require("application-settings");
var Sqlite = require("nativescript-sqlite");
var createViewModel = require("../view-models/delivery-view-model").createViewModel;
var ObservableArray = require("data/observable-array").ObservableArray;
var Observable = require("data/observable").Observable
var email;


var pageData = new Observable({
  user: global.user
});

var fetch = function() {
  global.apiModel.getDispatches(1,10).catch(function(error) {
    console.log(JSON.stringify(error));
    dialogsModule.alert({
             message: "Unfortunately we could not connect to server.",
             okButtonText: "OK"
         });
          global.user.set("isLoading", false);

    frameModule.topmost().navigate({
      moduleName: "main-page/main-page",
      context: {
        status: "login",
        user: user
      }
               });
         return Promise.reject();
  }).then(function(disp) {
var count = disp.dispatches.length; 
      console.log("Dispatch: \n\n", JSON.stringify(disp));
      console.log("count", count);
       for (var a = 0; a < count; a++) {

              var dispatch = disp.dispatches[a];
              // console.log(JSON.stringify(dispatch));
              console.log("SO: ",dispatch.soNumber);
              var name = "";
              var id = "";
              if (dispatch.customer !== null) {
                name = dispatch.customer.firstName;
                id = dispatch.customer._id;
                }
              var delivery = {
                deliveryID: dispatch._id,
                customerName:  name,
                customerID: id,
                createdBy: dispatch.createdBy.firstName,
                deliveryDate: dispatch.date,
                itemType: dispatch.items[0].item.name,
                itemID: dispatch.items[0].item._id,
                soNumber: dispatch.soNumber
              };

              delivery.lots = new ObservableArray();

              for (var i = 0; i<dispatch.items.length; i++) {

                var lot = dispatch.items[i];
                // console.log(JSON.stringify(lot));
                if (lot.size === null) {
                var sizeName = "";
                var sizeID = "";
                } else {
                var sizeName = lot.size.name;
                var sizeID = lot.size._id;
                }
                 if (lot.quality === null) {
                var qualityName = "";
                var qualityID = "";
                } else {
                var qualityName = lot.quality.name;
                var qualityID = lot.quality._id;
                }

                var lotA = {
                  lotSize: sizeName,
                  sizeID: sizeID,
                  lotQuality: qualityName,
                  qualityID: qualityID,
                  items: new ObservableArray()
                };

                for (var k = 0; k < lot.weights.length; k++) {
                  lotA.items.push({weight: lot.weights[k]});
                }
                delivery.lots.push(lotA);
              }


              global.deliveryViewModel.saveDelivery(delivery);
              
          } 

  }).then(function(){
   global.user.set("isLoading", false);

    frameModule.topmost().navigate({
      moduleName: "main-page/main-page",
      context: {
        status: "login",
        user: user
      }
               });
    // return Promise.resolve();
  });

}
  
exports.loaded = function(args) {
  if (!Sqlite.exists("populated.db")) {
          console.log("ads");
          Sqlite.copyDatabase("populated.db");
      }
      (new Sqlite("populated.db")).then(db => {
          // database = db;
          db.resultType(Sqlite.RESULTSASOBJECT);
          global.deliveryViewModel = createViewModel(db);
          console.log("Success");

            // pageData.deliveries = new ObservableArray();
            // global.deliveryViewModel.loadDeliveries(pageData.deliveries);

          // console.log("a",r);


      }, error => {
          console.log("OPEN DB ERROR", error);
      });

  var page = args.object;
  var stringUser = applicationSettings.getString("user");
    if (stringUser !== undefined) {
      console.log(stringUser);
      global.user.set("isLoading", true);

    var user = JSON.parse(stringUser);
    global.user.userData = user;
    console.log("here");
    fetch();
    
  
    }
  
  page.bindingContext = global.user;
};

exports.signIn = function() {
  global.user.set("isLoading", true);
  global.user.login()
     .catch(function(error) {
         console.log(error);
         global.user.set("isLoading",false);
         dialogsModule.alert({
             message: error.message,
             okButtonText: "OK"
         });
         return Promise.reject();
     })
     .then(function(data) {
          console.log("Success");
    global.apiModel.getDispatches(1,10).then(function(disp) {
      var count = disp.dispatches.length; 
      console.log("Dispatch: \n\n", JSON.stringify(disp));
      console.log("count", count);
       for (var a = 0; a < count; a++) {

              var dispatch = disp.dispatches[a];
              // console.log(JSON.stringify(dispatch));
              console.log("SO: ",dispatch.soNumber);
              var name = "";
              var id = "";
              if (dispatch.customer !== null) {
                name = dispatch.customer.firstName;
                id = dispatch.customer._id;
                }
              var delivery = {
                deliveryID: dispatch._id,
                customerName:  name,
                customerID: id,
                createdBy: dispatch.createdBy.firstName,
                deliveryDate: dispatch.date,
                itemType: dispatch.items[0].item.name,
                itemID: dispatch.items[0].item._id,
                soNumber: dispatch.soNumber
              };

              delivery.lots = new ObservableArray();

              for (var i = 0; i<dispatch.items.length; i++) {

                var lot = dispatch.items[i];
                // console.log(JSON.stringify(lot));
                if (lot.size === null) {
                var sizeName = "";
                var sizeID = "";
                } else {
                var sizeName = lot.size.name;
                var sizeID = lot.size._id;
                }
                 if (lot.quality === null) {
                var qualityName = "";
                var qualityID = "";
                } else {
                var qualityName = lot.quality.name;
                var qualityID = lot.quality._id;
                }

                var lotA = {
                  lotSize: sizeName,
                  sizeID: sizeID,
                  lotQuality: qualityName,
                  qualityID: qualityID,
                  items: new ObservableArray()
                };

                for (var k = 0; k < lot.weights.length; k++) {
                  lotA.items.push({weight: lot.weights[k]});
                }
                delivery.lots.push(lotA);
              }


              global.deliveryViewModel.saveDelivery(delivery);
              
          } 
       
      
     }).then(function() {
          console.log("ADMIn");
            global.user.set("isLoading", false);

          applicationSettings.setString("user", JSON.stringify(data));
         frameModule.topmost().navigate({
           moduleName: "main-page/main-page",
           context: {
             status: "login",
             user: data
           }
                    });

       
     }); 
        
     });
  // frameModule.topmost().navigate({moduleName: "main-page/main-page"});
};

exports.register = function() {
  var topmost = frameModule.topmost();
  // topmost.navigate("views/register/register");
};
