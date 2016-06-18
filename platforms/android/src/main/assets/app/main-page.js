var dialogsModule = require("ui/dialogs");
var frames = require("ui/frame");
var appSettings = require("application-settings");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var viewModule = require("ui/core/view");
var fileSystemModule = require("file-system");
var Sqlite = require("nativescript-sqlite");
var createViewModel = require("./delivery-view-model").createViewModel;

var page;
var deliveryViewModel;

var pageData = new Observable({
    deliveries: new ObservableArray()
});

exports.loaded = function(args) {
    page = args.object;
    page.bindingContext = pageData;
};


exports.add = function(args) {
  frames.topmost().navigate({
        moduleName: "delivery-page",
        context: {
          update: "new delivery",
          deliveryViewModel: deliveryViewModel
        }});
}


exports.deleteListItem = function(args) {
  dialogsModule.confirm("Delete this Delivery?").then(function(result) {
    if (result) {
      var item = args.view.bindingContext;
      var index = pageData.deliveries.indexOf(item);
      console.log(index);
      pageData.deliveries.splice(index,1);
      deliveryViewModel.deleteDelivery(item);
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
        deliveryViewModel.addSize(sizeName,sizeWeight);
      }
      });
    }
    });

  } else if(result === "Delete Size") {
  var listitemssize = new Array();
  deliveryViewModel.loadSizes(listitemssize);
  dialogsModule.action({
  message: "Delete Roll Size ",
  cancelButtonText: "Cancel",
  actions: listitemssize
}).then(function (result) {
  console.log("Dialog result: " + result)
  if (result !== "Cancel") {
  deliveryViewModel.deleteSize(result);
}
});
  } else if (result === "Delete Quality") {
    var listitemsquality = new Array();
    deliveryViewModel.loadQualities(listitemsquality);
    dialogsModule.action({
    message: "Delete Quality  ",
    cancelButtonText: "Cancel",
    actions: listitemsquality
  }).then(function (result) {
    if (result !== "Cancel") {
    deliveryViewModel.deleteQuality(result);
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
    deliveryViewModel.addQuality(r.text);
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
  deliveryViewModel.loadItemTypes(listItemTypes);
  dialogsModule.action({
  message: "Delete Item  ",
  cancelButtonText: "Cancel",
  actions: listItemTypes
}).then(function (result) {
  if (result !== "Cancel") {
  deliveryViewModel.deleteItemType(result);
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
      console.log(newpage.navigationContext.delivery.totalWeight);
      var newDelivery = newpage.navigationContext.delivery;
      console.log("Total Weight: ",newDelivery.totalWeight);
      console.log("customerName: ",newDelivery.customerName);
      console.log("Date: ",newDelivery.deliveryDate);

      deliveryViewModel.saveDelivery(newDelivery,pageData.deliveries);



    } else {
      if (!Sqlite.exists("populated.db")) {
          console.log("ads");
          Sqlite.copyDatabase("populated.db");
      }
      (new Sqlite("populated.db")).then(db => {
          // database = db;
          db.resultType(Sqlite.RESULTSASOBJECT);
          deliveryViewModel = createViewModel(db);

          db.execSQL("CREATE TABLE IF NOT EXISTS deliveries (deliveryid INTEGER PRIMARY KEY AUTOINCREMENT, customername TEXT, createdby TEXT, date TEXT, numitems INTEGER)").then(id => {
            console.log("in");
            console.log("in");

            pageData.deliveries = new ObservableArray();
            deliveryViewModel.loadDeliveries(pageData.deliveries);

          // console.log("a",r);
          }, error => {
              console.log("CREATE TABLE ERROR", error);
          });

      }, error => {
          console.log("OPEN DB ERROR", error);
      });
    }
    // pageData = page.navigationContext.update;
    // page.bindingContext = pageData;


}

exports.listViewItemTap = function(args) {
  var index = args.index;
  console.log(index);
  var delivery = pageData.deliveries.getItem(index);
  pageData.deliveries.splice(index,1);
  frames.topmost().navigate({
        moduleName: "delivery-page",
        context: {update: "edit delivery",
                  delivery: delivery,
                  deliveryViewModel: deliveryViewModel
      }
});
}

exports.saveFile = function(args) {


}
