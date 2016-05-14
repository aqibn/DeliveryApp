var dialogsModule = require("ui/dialogs");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var orientationModule = require('nativescript-screen-orientation');
var viewModule = require("ui/core/view");
var frames = require("ui/frame");
var page;


var dotPressed;
var lot =  {
  size: "",
  quality: "",
  items: new ObservableArray()

  // new ObservableArray([{weight: 10},{weight: 10},{weight: 10},{weight: 10}])
};
var sizeArray =   ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];
var qualityArray = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];
var pageData = new Observable({

    listitemsquality: new ObservableArray(
      sizeArray),
    listitemssize: new ObservableArray(
        qualityArray),
    name: "New Lot",
    lot: lot,
    selectedQualityIndex: 2,
    selectedSizeIndex: 2,
    weight: 0,
    weightString: "",
    numItems: 0,
    totalWeight:0,
    status: ""
});
//
exports.loaded = function(args) {
    page = args.object;
    pageData.lot.items = new ObservableArray();
    orientationModule.setCurrentOrientation("landscape",function() {
        console.log("landscape orientation set");
      });

    pageData.totalWeight = 0;
    pageData.numItems = 0;
    pageData.weightString = "";
    pageData.weight = 0;
    pageData.status = "";
    dotPressed = false;
    page.bindingContext = pageData;
};

exports.pageLoad = function (){
  orientationModule.setCurrentOrientation("landscape",function() {
    console.log("landscape orientation set");
  });
}

exports.onNavigatingFrom = function(args){
  console.log("navigatingfrom");
  orientationModule.orientationCleanup();
  var page = args.object;
  // page.bindingContext = null;

}

exports.addItem = function(args) {
  if (pageData.weight === 0) {
      dialogsModule.alert({
          message: "Enter Weight",
          okButtonText: "OK"
      });
      return;
  }

  // Dismiss the keyboard
  // page.getViewById("weight").dismissSoftInput();
  // var squality = pageData.listitemsquality.getItem(pageData.selectedQualityIndex);
  // var ssize = pageData.listitemsquality.getItem(pageData.selectedSizeIndex);
  // alert(squality);
  pageData.lot.items.unshift({weight: pageData.weight,
                          id: pageData.numItems});
  // push({weight: pageData.weight,
  //                         id: pageData.numItems});

  pageData.totalWeight += pageData.weight;
  pageData.numItems += 1;
  // Empty the input field
  pageData.weightString = "";
  pageData.weight = 0;
  dotPressed = false;
  return;
}


exports.addDigit = function(args) {
  console.log("Add digit");
  var btn = args.object;
  if(btn.text === ".") {
    console.log("Dot Pressed");
    console.log(dotPressed)
    if (dotPressed) {
      return;
    } else {
      pageData.weightString = (pageData.weightString)+(btn.text);
      dotPressed = true;
      return;
  }
}
  // console.log(weight);
  pageData.weightString = (pageData.weightString)+(btn.text);
  pageData.weight = Number(pageData.weightString);
  // weight = weight.concat(btn.text);
  // var a = "a" + "b";

  console.log(pageData.weightString);
}

exports.clear = function (args) {
pageData.weightString = "";
pageData.weight = 0;
dotPressed = false;
}

exports.listViewItemTap = function(args) {
  // var tappedItemIndex = args.index;
  // var tappedItemView = args.view;
  // var item = args.view.bindingContext;
  // var index = pageData.lot.items.indexOf(item);
  // console.log(item.id);
  // console.log(index);
  // pageData.lot.items.splice(index,1);
  // pageData.numItems -= 1;
  // pageData.totalWeight -= item.weight;



}
exports.deleteListItem = function(args) {
  var item = args.view.bindingContext;
  var index = pageData.lot.items.indexOf(item);
  console.log(item.id);
  console.log(index);
  pageData.lot.items.splice(index,1);
  pageData.numItems -= 1;
  pageData.totalWeight -= item.weight;
}

exports.saveBack = function(args) {
  if(pageData.numItems == 0) {
    dialogsModule.alert({
        message: "You have not added any items to this lot",
        okButtonText: "OK"
    });
    return;
  }
  lot.quality = pageData.listitemsquality.getItem(pageData.selectedQualityIndex);
  lot.size = pageData.listitemssize.getItem(pageData.selectedSizeIndex);
  lot.totalWeight = pageData.totalWeight;
  lot.numItems = pageData.numItems;

  frames.topmost().navigate( {
    moduleName: "delivery-page",
    context: {
      update: "new lot",
      lot: lot
    }
  });
}

exports.addSize = function(args) {
  dialogsModule.action("Size Menu", "Cancel", ["Add new size", "Delete size"]).then(function(result){
    console.log(result);
    if (result === "Add new size") {
    dialogsModule.prompt({
      title: "Add Size",
      okButtonText: "Confirm",
      inputType: dialogsModule.inputType.text

    }).then(function(r) {
      console.log(r.text);
      sizeArray.push(r.text);
      pageData.listitemssize.push(r.text);
      var listpicker = page.getViewById("sizelistpicker");
      listpicker.refresh();
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
      console.log("refresh");
      if(newpage.navigationContext.status === "old_lot") {
        console.log("old lot");
        var newLot = newpage.navigationContext.s_lot;
        pageData.totalWeight = newLot.lotTotalWeight;
        pageData.numItems = newLot.lotNumItems;
        pageData.selectedSizeIndex = pageData.listitemssize.indexOf(newLot.lotSize);
        pageData.selectedQualityIndex = pageData.listitemsquality.indexOf(newLot.lotQuality);

        newLot.items.forEach(function(data, index, a) {
          console.log(data);
          pageData.lot.items.push(data);
        });

        console.log(pageData.lot.items.getItem(0).weight);
        pageData.weightString = "";
        pageData.weight = 0;
      } else if (newpage.navigationContext.status === "newLot") {
        console.log("newLot");
        pageData.status = newpage.navigationContext.status;
      }
    } else {
      console.log("notrefresh");

    }
    // pageData = page.navigationContext.update;
    // page.bindingContext = pageData;
}


// exports.navigatedTo = function(args) {
//   orientationModule.setCurrentOrientation("landscape",function() {
//     console.log("landscape orientation set");
//   });
//     console.log("navigatedto");
//     var page = args.object;
//     console.log(page.navigationContext);
//     pageData.name = page.navigationContext.name;
//     page.bindingContext = pageData;
// }
