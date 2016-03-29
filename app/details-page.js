var dialogsModule = require("ui/dialogs");

var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;

var viewModule = require("ui/core/view");
var page;


var pageData = new Observable({
    items: new ObservableArray([
        { name: "eggs" },
        { name: "bread" },
        { name: "milk" }

    ]),
    name: ""
});
//
// exports.loaded = function(args) {
//     page = args.object;
//     page.bindingContext = pageData;
// };

exports.navigatedTo = function(args) {
    console.log("navigatedto");
    var page = args.object;
    console.log(page.navigationContext);
    pageData.name = page.navigationContext.name;
    page.bindingContext = pageData;
}
