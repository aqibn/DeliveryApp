var dialogsModule = require("ui/dialogs");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var orientationModule = require('nativescript-screen-orientation');
var viewModule = require("ui/core/view");
var page;



var pageData = new Observable({
    items: new ObservableArray([
        { name: "eggs" },
        { name: "bread" },
        { name: "milk" }

    ]),
    listitems: new ObservableArray(
      ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]),
    name: ""
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
