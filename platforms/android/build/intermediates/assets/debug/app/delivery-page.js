var dialogsModule = require("ui/dialogs");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var orientationModule = require('nativescript-screen-orientation');
var viewModule = require("ui/core/view");
var frames = require("ui/frame");

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
    customerName: "",
    createdBy: "",
    name: "Delivery-Page"

});
//
exports.loaded = function(args) {
    page = args.object;

    page.bindingContext = pageData;
};

exports.add = function(args) {
  frames.topmost().navigate({
        moduleName: "details-page"
});
}
exports.pageLoad = function (){

}

exports.onNavigatingFrom = function(){
}
