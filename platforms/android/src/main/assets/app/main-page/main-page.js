var dialogsModule = require("ui/dialogs");
var frames = require("ui/frame");
var appSettings = require("application-settings");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var viewModule = require("ui/core/view");
var fileSystemModule = require("file-system");
var Sqlite = require("nativescript-sqlite");
var createViewModel = require("../view-models/delivery-view-model").createViewModel;
var applicationSettings = require("application-settings");
var Toast = require("nativescript-toast");
var toastSuccessAdded = Toast.makeText("Succesfully Added");

var page;
var deliveryViewModel;

var pageData = new Observable({
    deliveries: new ObservableArray(),
    user: null,
    qualities: new ObservableArray([{name: "Item 1"},{name: "Item 2"}])
});
var handleError = function() {
    console.log(error);
         dialogsModule.alert({
             message: "Unfortunately we could not connect to server.",
             okButtonText: "OK"
         });
         return Promise.reject();
};
var syncData = function() {
     global.apiModel.getQualities().catch(handleError).then(function(data) {
     console.log("Succesfull Quality",data);
     var id = global.deliveryViewModel.deleteAll("qualitytypes", function(){
          var count = data.count;
          for (var a = 0; a < count; a++) {
              var quality = data.qualities[a];
                console.log(quality);
                global.deliveryViewModel.addQuality(quality);
          } 
          
          });  
     });
     
     global.apiModel.getSizes().catch(handleError).then(function(data){
         var id = global.deliveryViewModel.deleteAll("sizetypes", function(){
          var count = data.count;
          for (var a = 0; a < count; a++) {
              var size = data.sizes[a];
                console.log(size);
                global.deliveryViewModel.addSize(size);
          }  
         });
     });
     
     global.apiModel.getItems().catch(handleError).then(function(data){
       var id = global.deliveryViewModel.deleteAll("itemtypes", function(){
       var count = data.count;
          for (var a = 0; a < count; a++) {
              var item = data.items[a];
                console.log(item);
                global.deliveryViewModel.addItemType(item);
          }      
    
    });

    });
     
     
     
  
}

exports.loaded = function(args) {
    page = args.object;
    syncData();

    page.bindingContext = pageData;
};


exports.add = function(args) {
  frames.topmost().navigate({
        moduleName: "delivery-page/delivery-page",
        context: {
          update: "new delivery",
          deliveryViewModel: global.deliveryViewModel
        }});
}

exports.showSettingsPage = function(args) {
   console.log(args.object.text);
   var setting = args.object.text;
   frames.topmost().navigate({
       moduleName: "settings-page/settings-page",
       context: setting
   });
}

exports.deleteListItem = function(args) {
  dialogsModule.confirm("Delete this Delivery?").then(function(result) {
    if (result) {
      var item = args.view.bindingContext;
      var index = pageData.deliveries.indexOf(item);
      console.log(index);
      pageData.deliveries.splice(index,1);
      global.deliveryViewModel.deleteDelivery(item);
    }
  });

}
// exports.listViewItemTap = function(args) {
//   var itemIndex = args.index;
//   // console.log(JSON.stringify(pageData.deliveries.getItem(itemIndex)));
//   frames.topmost().navigate({
//         moduleName: "delivery-page",
//         context: pageData.deliveries.getItem(itemIndex)
//     });
// }

exports.showUserSettings = function(args) {
  dialogsModule.action("User Settings", "Cancel", ["Change Password", "Logout"])
  .then(function(result){
    console.log(result);
    var oldPass = "";
    var newPass = "";

    if (result === "Change Password") {
      dialogsModule.prompt({
        title: "Change Password",
        message: "Enter old Password",
        cancelButtonText: "Cancel",
        okButtonText: "Confirm",
        inputType: dialogsModule.inputType.text

      }).then(function(r) {
        if (r.result) {
          oldPass = r.text;
          dialogsModule.prompt({
            title: "Change Password",
            message: "Enter New Password",
            cancelButtonText: "Cancel",
            okButtonText: "Confirm",

            inputType: dialogsModule.inputType.text

          }).then(function(r) {
            if (r.result) {
              newPass = r.text;
              dialogsModule.prompt({
                title: "Change Password",
                message: "Re-Enter New Password",
                cancelButtonText: "Cancel",
                okButtonText: "Confirm",

                inputType: dialogsModule.inputType.text

              }).then(function(r) {
                if (r.result) {
                  if (newPass === r.text) {
                    console.log("changing password");
                    global.user.changePassword(oldPass,newPass).catch(function(error) {
                        console.log(error);
                        dialogsModule.alert({
                            message: "Unfortunately we could not change Password",
                            okButtonText: "OK"
                        });
                        return Promise.reject();
                    })
                    .then(function(data) {
                    console.log("success");
                    });

                  }
                }
              });
            }
        });
      }
    });
    }
  });

  }

exports.showSettings = function(args) {
  dialogsModule.action("Settings", "Cancel", ["Add New Size", "Delete Size","Add New Quality", "Delete Quality","Add Item Type", "Delete Item Type"]).then(function(result){
    console.log(result);
    if (result === "Add New Size") {
    var sizeName;
    var sizeWeight;
    dialogsModule.prompt({
      title: "Add Size",
      message: "Enter Roll Size Name",
      cancelButtonText: "Cancel text",
      okButtonText: "Confirm",

      inputType: dialogsModule.inputType.text

    }).then(function(r) {
      if (r.result) {
      sizeName = r.text;
      console.log(r.text);
      dialogsModule.prompt({
        title: "Add Size",
        message: "Enter Roll Size Weight",
        cancelButtonText: "Cancel text",
        okButtonText: "Confirm",

        inputType: dialogsModule.inputType.text

      }).then(function(r) {
        if (r.result) {
        sizeWeight = r.text;
        global.deliveryViewModel.addSize(sizeName,sizeWeight);
      }
      });
    }
    });

  } else if(result === "Delete Size") {
  var listitemssize = new Array();
  global.deliveryViewModel.loadSizes(listitemssize);
  dialogsModule.action({
  message: "Delete Roll Size ",
  cancelButtonText: "Cancel",
  actions: listitemssize
}).then(function (result) {
  console.log("Dialog result: " + result)
  if (result !== "Cancel") {
  global.deliveryViewModel.deleteSize(result);
}
});
  } else if (result === "Delete Quality") {
    var listitemsquality = new Array();
    global.apiModel.getQualities();
    global.deliveryViewModel.loadQualities(listitemsquality);
    dialogsModule.action({
    message: "Delete Quality  ",
    cancelButtonText: "Cancel",
    actions: listitemsquality
  }).then(function (result) {
    if (result !== "Cancel") {
    global.deliveryViewModel.deleteQuality(result);
  }
    console.log("Dialog result: " + result)
  });
} else if (result === "Add New Quality") {
  dialogsModule.prompt({
    title: "Add Quality",
    message: "Enter Quality Name",
    cancelButtonText: "Cancel",
    okButtonText: "Confirm",

    inputType: dialogsModule.inputType.text

  }).then(function(r) {
    if (r.result) {
    // global.deliveryViewModel.addQuality(r.text);
    global.apiModel.createQuality(r.text).then(function() {
      toastSuccessAdded.show();
    });
    console.log(r.text);


  }
  });
} else if (result === "Add Item Type") {
  dialogsModule.prompt({
    title: "Add Item Type",
    message: "Enter Item Name",
    cancelButtonText: "Cancel",
    okButtonText: "Confirm",

    inputType: dialogsModule.inputType.text

  }).then(function(r) {
    if (r.result) {
    deliveryViewModel.addItemType(r.text);
    console.log(r.text);


  }
  });
} else if (result === "Delete Item Type") {
  var listItemTypes = new Array();
  global.deliveryViewModel.loadItemTypes(listItemTypes);
  dialogsModule.action({
  message: "Delete Item  ",
  cancelButtonText: "Cancel",
  actions: listItemTypes
}).then(function (result) {
  if (result !== "Cancel") {
  global.deliveryViewModel.deleteItemType(result);
}
  console.log("Dialog result: " + result)
});
}
  });
}
exports.navigatedTo = function(args) {



    console.log("navigatedto");
    var newpage = args.object;
    console.log(args.object)
    // console.log(page.navigationContext);
    if (newpage.navigationContext !== undefined) {




      if (newpage.navigationContext.status === "login") {
        pageData.user = newpage.navigationContext.user;
      if (!Sqlite.exists("populated.db")) {
          console.log("ads");
          Sqlite.copyDatabase("populated.db");
      }
      (new Sqlite("populated.db")).then(db => {
          // database = db;
          db.resultType(Sqlite.RESULTSASOBJECT);
          global.deliveryViewModel = createViewModel(db);


            pageData.deliveries = new ObservableArray();
            global.deliveryViewModel.loadDeliveries(pageData.deliveries);

          // console.log("a",r);


      }, error => {
          console.log("OPEN DB ERROR", error);
      });
    } else {
      console.log(newpage.navigationContext.delivery.totalWeight);
      var newDelivery = newpage.navigationContext.delivery;
      console.log("Total Weight: ",newDelivery.totalWeight);
      console.log("customerName: ",newDelivery.customerName);
      console.log("Date: ",newDelivery.deliveryDate);
      pageData.deliveries = new ObservableArray();
      
      global.deliveryViewModel.loadDeliveries(pageData.deliveries);

    //   deliveryViewModel.saveDelivery(newDelivery,pageData.deliveries);
    }

  } else {
    pageData.deliveries = new ObservableArray();
    global.deliveryViewModel.loadDeliveries(pageData.deliveries);
  }
    // pageData = page.navigationContext.update;
    // page.bindingContext = pageData;


}
exports.logout = function(args) {
console.log("logging out");
global.user.logout(pageData.user).catch(function(error) {
    console.log(error);
    dialogsModule.alert({
        message: "Unfortunately we could not logout",
        okButtonText: "OK"
    });
    return Promise.reject();
})
.then(function(data) {

console.log("logged out");
applicationSettings.remove("user");
frames.topmost().navigate({
  moduleName: "login/login"
});
});
}

exports.listViewItemTap = function(args) {
  var index = args.index;
  console.log(index);
  var delivery = pageData.deliveries.getItem(index);
  pageData.deliveries.splice(index,1);
  frames.topmost().navigate({
        moduleName: "delivery-page/delivery-page",
        context: {update: "edit delivery",
                  delivery: delivery,
                  deliveryViewModel: global.deliveryViewModel
      }
});
}