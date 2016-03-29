var dialogsModule = require("ui/dialogs");

var Observable = require("data/observable").Observable;
var viewModule = require("ui/core/view");
var page;

var pageData = new Observable({
  name: "milk"
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
    pageData = page.navigationContext;
    page.bindingContext = pageData;
}
