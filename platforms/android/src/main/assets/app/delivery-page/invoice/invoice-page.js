var image = require("ui/image");
var plugin = require("nativescript-screenshot");
var socialShare = require("nativescript-social-share");
var app = require("application");
var fs = require("file-system");
var frames = require("ui/frame");
var Observable = require("data/observable").Observable

var webView;
var page;
var stackLayout;
var img;
var pageData = new Observable({
toMain: false
});
exports.webViewLoaded = function(args){
  webView = args.object
}

// var source = '<!DOCTYPE html><html><head><title>MyTitle</title><meta charset="utf-8" /></head><body><span style="color:red">TestÖ</span></body></html>'

exports.loaded = function(args) {
page = args.object;
page.bindingContext = pageData;
}

exports.navigatedTo = function(args) {
    var newpage = args.object;
    console.log("navigatedto");
    pageData.toMain = newpage.navigationContext.goToMain;
    console.log("toMain: ", pageData.toMain);
}
exports.back = function(args) {
      console.log("toMain: ", pageData.toMain);

  if (pageData.toMain == true) {
     frames.topmost().navigate({
        moduleName: "main-page/main-page"
      });
  } else {
  frames.topmost().navigate({
        moduleName: "delivery-page/delivery-page"
      });
  }
}
exports.stackLoaded = function(args) {
console.log("Loaded");
stackLayout = args.object;
print();
}

exports.final = function(args) {
}


var print = function() {
    var context = android.content.Context;  
    console.log("Context",context);
    var printManager = app.android.foregroundActivity.getSystemService(context.PRINT_SERVICE);

    // Get a print adapter instance
    var printAdapter = webView.android.createPrintDocumentAdapter();

    // Create a print job with name and adapter instance
    var jobName = " Document";
    var printJob = printManager.print(jobName, printAdapter, new android.print.PrintAttributes.Builder().build());

}

exports.print = function(args){

  // img = new image.Image();
  // var imageSource = plugin.getImage(webView);
  // img.imageSource = imageSource;
  // console.log(img);
  // // stackLayout.addChild(img);
  // //
  // socialShare.shareImage(imageSource);
    print();
 
}
