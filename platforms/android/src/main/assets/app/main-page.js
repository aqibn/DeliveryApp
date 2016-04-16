var dialogsModule = require("ui/dialogs");
var frames = require("ui/frame");

var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var viewModule = require("ui/core/view");
var page;

var pageData = new Observable({
    deliveries: new ObservableArray([
        { name: "eggs" },
        { name: "bread" },
        { name: "milk" }

    ])
});

exports.loaded = function(args) {
    page = args.object;
    page.bindingContext = pageData;
};


exports.add = function(args) {
  frames.topmost().navigate({
        moduleName: "delivery-page"
});
}

exports.listViewItemTap = function(args) {
  var itemIndex = args.index;
  console.log(JSON.stringify(pageData.deliveries.getItem(itemIndex)));
  frames.topmost().navigate({
        moduleName: "delivery-page",
        context: pageData.deliveries.getItem(itemIndex)
    });
}
