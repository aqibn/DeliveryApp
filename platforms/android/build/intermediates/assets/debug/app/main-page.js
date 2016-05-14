var dialogsModule = require("ui/dialogs");
var frames = require("ui/frame");
var appSettings = require("application-settings");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var viewModule = require("ui/core/view");
var page;

var pageData = new Observable({
    deliveries: new ObservableArray()
});

exports.loaded = function(args) {
    page = args.object;
    page.bindingContext = pageData;
};


exports.add = function(args) {
  frames.topmost().navigate({
        moduleName: "delivery-page"});
}

exports.listViewItemTap = function(args) {
  var itemIndex = args.index;
  // console.log(JSON.stringify(pageData.deliveries.getItem(itemIndex)));
  frames.topmost().navigate({
        moduleName: "delivery-page",
        context: pageData.deliveries.getItem(itemIndex)
    });
}


exports.showSettings = function(args) {
  dialogsModule.action("Settings", "Cancel", ["Add new size", "Delete size","Add new Quality", "Delete Quality"]).then(function(result){
    console.log(result);
    if (result === "Add new size") {
    dialogsModule.prompt({
      title: "Add Size",
      okButtonText: "Confirm",
      inputType: dialogsModule.inputType.text

    }).then(function(r) {
      console.log(r.text);
      var stringValue = appSettings.getString("listitemssize");
      if (stringValue === undefined) {
        console.log("undefined");
        appSettings.setString("listitemssize", r.text);
      } else {
        console.log("defined");
        stringValue = stringValue + " " + r.text;
      }
    });

  } else if(result === "Delete size") {
    console.log("here");
    dialogsModule.action("Delete Size","Cancel", sizeArray).then(function(result) {
      console.log(result);
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
      pageData.deliveries.push({
                          deliveryTotalWeight: newDelivery.totalWeight,
                          deliveryCustomerName: newDelivery.customerName,
                          deliveryCreatedBy: newDelivery.createdBy,
                          deliveryDate: newDelivery.deliveryDate,
                          deliveryLots: newDelivery.lots
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
                  delivery: delivery
      }
});
}
