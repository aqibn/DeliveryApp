var image = require("ui/image");
var plugin = require("nativescript-screenshot");
var socialShare = require("nativescript-social-share");
var app = require("application");
var fs = require("file-system");
var frames = require("ui/frame");

var webView;
var page;
var stackLayout;
var img;
exports.webViewLoaded = function(args){
  webView = args.object
}

// var source = '<!DOCTYPE html><html><head><title>MyTitle</title><meta charset="utf-8" /></head><body><span style="color:red">TestÖ</span></body></html>'

exports.loaded = function(args) {
page = args.object;
// page.bindingContext = source;
}

exports.back = function(args) {
  frames.topmost().navigate({
        moduleName: "delivery-page/delivery-page"
      });
}
exports.stackLoaded = function(args) {
console.log("Loaded");
stackLayout = args.object;
}

exports.final = function(args) {
}

exports.print = function(args){

  // img = new image.Image();
  // var imageSource = plugin.getImage(webView);
  // img.imageSource = imageSource;
  // console.log(img);
  // // stackLayout.addChild(img);
  // //
  // socialShare.shareImage(imageSource);
var context = application.android.context;  
var printManager = app.android.foregroundActivity.getSystemService(context.PRINT_SERVICE);

    // Get a print adapter instance
    var printAdapter = webView.android.createPrintDocumentAdapter();

    // Create a print job with name and adapter instance
    var jobName = " Document";
    var printJob = printManager.print(jobName, printAdapter, new android.print.PrintAttributes.Builder().build());

    // Save the job object for later status checking
    // mPrintJobs.add(printJob);
 
}
