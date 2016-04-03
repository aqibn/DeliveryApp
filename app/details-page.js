var dialogsModule = require("ui/dialogs");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var orientationModule = require('nativescript-screen-orientation');
var viewModule = require("ui/core/view");
var page;



var pageData = new Observable({
    items: new ObservableArray([
        { quality: "eggs",
          weight: 10,
          size: "sizea"},
          { quality: "eggs",
              weight: 10,
              size: "sizea"}


    ]),
    listitemsquality: new ObservableArray(
      ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]),
    listitemssize: new ObservableArray(
        ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]),
    name: "",
    selectedQualityIndex: 2,
    selectedSizeIndex: 2,
    weight: 0
});
//
exports.loaded = function(args) {
    page = args.object;
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
  page.getViewById("weight").dismissSoftInput();
  var squality = pageData.listitemsquality.getItem(pageData.selectedQualityIndex);
  var ssize = pageData.listitemsquality.getItem(pageData.selectedSizeIndex);
  alert(squality);
  pageData.items.push(
    {quality: squality,
    weight: Number(pageData.weight),
    size: ssize});

  // Empty the input field
  pageData.set("weight", 0);
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
