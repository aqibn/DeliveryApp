var dialogsModule = require("ui/dialogs");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var orientationModule = require('nativescript-screen-orientation');
var viewModule = require("ui/core/view");
var frames = require("ui/frame");
var dialogs = require("ui/dialogs");
var page;



var pageData = new Observable({
    lots: new ObservableArray(),
    tap: 0,
    customerName: "",
    createdBy: "",
    name: "Delivery-Page",
    totalWeight: 0,
    deliveryDate: ""

});
//

exports.tapped = function(args) {
  pageData.tap += 1;
}
exports.loaded = function(args) {
    page = args.object;
    // pageData.lots = new ObservableArray();
    pageData.customerName = "";
    pageData.createdBy = "";
    pageData.totalWeight = 0;
    pageData.deliveryDate = "";
    page.bindingContext = pageData;
};

exports.add = function(args) {
  frames.topmost().navigate({
        moduleName: "details-page",
        context: {status: "newLot"}
});
}
exports.pageLoad = function (){

}
exports.navigatedTo = function(args) {

    console.log("navigatedto");
    var newpage = args.object;
    console.log(args.object)
    // console.log(page.navigationContext);
    if (newpage.navigationContext !== undefined) {
      if (newpage.navigationContext.update === "new lot") {
      console.log("new lot");
      console.log(newpage.navigationContext.lot.size);
      var newLot = newpage.navigationContext.lot;
      console.log(newLot.totalWeight);
      pageData.lots.push({
                          lotTotalWeight: newLot.totalWeight,
                          lotQuality: newLot.quality,
                          lotSize: newLot.size,
                          lotNumItems: newLot.numItems,
                          items: newLot.items
                        });


  } else if (newpage.navigationContext.update === "edit delivery") {
    console.log("edit delivery");
    pageData.lots = new ObservableArray();

    var delivery = newpage.navigationContext.delivery;
    pageData.customerName = delivery.deliveryCustomerName;
    pageData.createdBy = delivery.deliveryCreatedBy;
    pageData.deliveryDate = delivery.deliveryDate;
    pageData.totalWeight = delivery.deliveryTotalWeight;
    delivery.deliveryLots.forEach(function(data, index, a) {
      console.log(data);
      pageData.lots.push(data);
    });

  }
} else {
pageData.deliveryDate = new Date();
console.log(pageData.deliveryDate);
}
    // pageData = page.navigationContext.update;
    // page.bindingContext = pageData;
}

exports.listViewItemTap = function(args) {
  var index = args.index;
  console.log(index);
  var lot = pageData.lots.getItem(index);
  pageData.lots.splice(index,1);
  frames.topmost().navigate({
        moduleName: "details-page",
        context: {status: "old_lot",
                  s_lot: lot
      }
});
}

exports.deleteListItem = function(args) {
  dialogs.confirm("Delete this lot?").then(function(result) {
    if (result) {
      var item = args.view.bindingContext;
      var index = pageData.lots.indexOf(item);
      console.log(item.lotTotalWeight);
      console.log(index);
      pageData.lots.splice(index,1);
    }
  });

}


exports.saveDelivery = function(args) {
  if(pageData.lots.length == 0) {
    dialogsModule.alert({
        message: "You have not added any items to this lot",
        okButtonText: "OK"
    });
    return;
  }

  frames.topmost().navigate( {
    moduleName: "main-page",
    context: {
      update: "new delivery",
      delivery: {
        lots: pageData.lots,
        customerName: pageData.customerName,
        createdBy: pageData.createdBy,
        totalWeight: pageData.totalWeight

      }
    }
  });
}

exports.onNavigatingFrom = function(args){
  // console.log("navigatingfrom");
  // orientationModule.orientationCleanup();
}
