var image = require("ui/image");
var plugin = require("nativescript-screenshot");
var socialShare = require("nativescript-social-share");
var app = require("application");
var fs = require("file-system");

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

exports.stackLoaded = function(args) {
console.log("Loaded");
stackLayout = args.object;
}

exports.final = function(args) {
}

exports.print = function(args){
  img = new image.Image();
  var imageSource = plugin.getImage(webView);
  img.imageSource = imageSource;
  console.log(img);
  // stackLayout.addChild(img);
  //
  socialShare.shareImage(imageSource);
  // var documents = fs.knownFolders.currentApp();
  // var file = documents.getFile('index.html');
  // console.log("documents", documents.path);
  // // var file = fs.File.fromPath("~/index.html");
  // file.readText().then(function (content) {
  //                 //// Successfully read the file's content.
  //                 console.log(content);
  //                 socialShare.shareText(content);
  //             }, function (error) {
  //               console.log(error);
  //                 //// Failed to read from the file.
  //             });

}
