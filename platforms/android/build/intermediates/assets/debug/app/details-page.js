var dialogsModule = require("ui/dialogs");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var orientationModule = require('nativescript-screen-orientation');
var viewModule = require("ui/core/view");
var page;


var dotPressed;

var pageData = new Observable({

    listitemsquality: new ObservableArray(
      ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]),
    listitemssize: new ObservableArray(
        ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]),
    name: "",
    selectedQualityIndex: 2,
    selectedSizeIndex: 2,
    weight: 0,
    weightString: "",
    lot: {
      size: "",
      quality: "",
      items: new ObservableArray()
      // new ObservableArray([{weight: 10},{weight: 10},{weight: 10},{weight: 10}])
    },
    numItems: 0,
    totalWeight:0
});
//
exports.loaded = function(args) {
    page = args.object;
    dotPressed=false;
    orientationModule.setCurrentOrientation("landscape",function() {
        console.log("landscape orientation set");
      });
    page.bindingContext = pageData;
};

exports.pageLoad = function (){
  orientationModule.setCurrentOrientation("landscape",function() {
    console.log("landscape orientation set");
  });
}

exports.onNavigatingFrom = function(){
  orientationModule.orientationCleanup();
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
  pageData.lot.items.push({weight: pageData.weight});
  pageData.totalWeight += pageData.weight;
  pageData.numItems += 1;
  // Empty the input field
  pageData.weightString = "";
  pageData.weight = 0;
}


exports.addDigit = function(args) {
  console.log("Add digit");
  var btn = args.object;
  if(btn.text === ".") {
    console.log("Dot Pressed");

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

}

exports.listViewItemTap = function(args) {
  var tappedItemIndex = args.index;
  var tappedItemView = args.view;
  var item = args.view.bindingContext;
  var index = pageData.lot.items.indexOf(item);
  console.log(item);
  console.log(index);

  
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
