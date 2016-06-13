var dialogsModule = require("ui/dialogs");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var orientationModule = require('nativescript-screen-orientation');
var viewModule = require("ui/core/view");
var frames = require("ui/frame");
var moment = require("moment");
var pageModule = require('ui/page');
var fs = require("file-system");
var socialShare = require("nativescript-social-share");

var webViewModule = require("ui/web-view");

var Sqlite = require("nativescript-sqlite");
// var deliveryViewModel = require("./delivery-view-model").createViewModel;
var dialogs = require("ui/dialogs");
var page;

var deliveryViewModel;
var pageData = new Observable({
    lots: new ObservableArray(),
    tap: 0,
    customerName: "",
    createdBy: "",
    name: "Delivery-Page",
    totalWeight: 0,
    deliveryDate: ""
});
//

exports.tapped = function(args) {
  pageData.tap += 1;
}
exports.loaded = function(args) {
    page = args.object;
    // pageData.lots = new ObservableArray();

    page.bindingContext = pageData;
};
exports.add = function(args) {
  frames.topmost().navigate({
        moduleName: "details-page",
        context: {status: "newLot",
                  deliveryViewModel: deliveryViewModel
                }
});
}
exports.pageLoad = function (){

}
exports.goBack = function() {

}
exports.navigatedTo = function(args) {

    console.log("navigatedto");
    var newpage = args.object;
    // console.log(page.navigationContext);
    if (newpage.navigationContext !== undefined) {
      deliveryViewModel = newpage.navigationContext.deliveryViewModel
      if (newpage.navigationContext.update === "new lot") {
      console.log("new lot");
      console.log(newpage.navigationContext.lot.size);
      var newLot = newpage.navigationContext.lot;
      console.log(newLot.totalWeight);
      pageData.lots.push({
                          lotTotalWeight: newLot.totalWeight,
                          lotQuality: newLot.quality,
                          lotSize: newLot.size,
                          lotNumItems: newLot.numItems,
                          items: newLot.items
                        });
    pageData.totalWeight += newLot.totalWeight;
  } else if (newpage.navigationContext.update === "edit delivery") {
    console.log("edit delivery");
    pageData.lots = new ObservableArray();
    pageData.customerName = "";
    pageData.createdBy = "";
    pageData.totalWeight = 0;
    pageData.deliveryDate = "";
    var delivery = newpage.navigationContext.delivery;
    pageData.customerName = delivery.deliveryCustomerName;
    pageData.createdBy = delivery.deliveryCreatedBy;
    pageData.deliveryDate = delivery.deliveryDate;
    pageData.totalWeight = delivery.deliveryTotalWeight;
    pageData.deliveryID = delivery.deliveryID;
    delivery.deliveryLots.forEach(function(data, index, a) {
      console.log(data);
      pageData.lots.push(data);
    });

  } else if (newpage.navigationContext.update === "new delivery") {
    pageData.deliveryDate = moment().format('MMMM Do YYYY, h');

    // pageData.deliveryDate = new Date();
    pageData.customerName = "";
    pageData.createdBy = "";
    pageData.totalWeight = 0;
    pageData.deliveryDate = "";
    pageData.deliveryID = 0;
    pageData.lots = new ObservableArray();

    console.log(pageData.deliveryDate);
}
    // pageData = page.navigationContext.update;
    // page.bindingContext = pageData;

}

}

exports.listViewItemTap = function(args) {
  var index = args.index;
  console.log(index);
  var lot = pageData.lots.getItem(index);
  // console.log("Summary Weight: ", pageData.totalWeight);
  // console.log("Lot weight", lot.lotTotalWeight);

  pageData.totalWeight -= lot.lotTotalWeight;
  pageData.lots.splice(index,1);
  frames.topmost().navigate({
        moduleName: "details-page",
        context: {status: "old_lot",
                  s_lot: lot,
                  deliveryViewModel: deliveryViewModel
      }
});
}

exports.deleteListItem = function(args) {
  dialogs.confirm("Delete this lot?").then(function(result) {
    if (result) {
      var item = args.view.bindingContext;
      var index = pageData.lots.indexOf(item);
      console.log(item.lotTotalWeight);
      console.log(index);
      pageData.lots.splice(index,1);
    }
  });

}

exports.goBack = function(args) {
  frames.topmost().navigate({
        moduleName: "main-page",
});
}
exports.saveDelivery = function(args) {
  if(pageData.lots.length == 0) {
    dialogsModule.alert({
        message: "You have not added any items to this lot",
        okButtonText: "OK"
    });
    return;
  }
  // pageData.deliveryDate = new Date();
  pageData.deliveryDate = moment().format('MM-DD-YYYY, h a');

  console.log("data: ",pageData.deliveryDate );
  frames.topmost().navigate( {
    moduleName: "main-page",
    context: {
      update: "new delivery",
      delivery: {
        deliveryID : pageData.deliveryID,
        lots: pageData.lots,
        customerName: pageData.customerName,
        createdBy: pageData.createdBy,
        totalWeight: pageData.totalWeight,
        deliveryDate: pageData.deliveryDate

      }
    }
  });
}


exports.print = function(args) {
// var factoryFunc = function () {
//     var webView = new webViewModule.WebView();
//     webView.src = "~/index.html";
//     var pageWeb = new pageModule.Page();
//     pageWeb.content = webView;
//     return pageWeb;
//   };
var invoiceHtml = '<!doctype html> <html> <head> <meta charset="utf-8"> <title>A simple, clean, and responsive HTML invoice template</title> <style> /*.invoice-box{ max-width:800px; margin:auto; padding:30px; border:1px solid #eee; box-shadow:0 0 10px rgba(0, 0, 0, .15); font-size:16px; line-height:24px; font-family:Helvetica Neue, Helvetica, Helvetica, Arial, sans-serif; color:#555; }*/ .invoice-box table{ width:100%; line-height:inherit; text-align:left; } .invoice-box table td{ padding:5px; vertical-align:top; } .invoice-box table tr td:nth-child(2){ text-align:right; } .invoice-box table tr.top table td{ padding-bottom:20px; } .invoice-box table tr.top table td.title{ font-size:45px; line-height:45px; color:#333; } .invoice-box table tr.information table td{ padding-bottom:40px; } .invoice-box table tr.heading td{ background:#eee; border-bottom:1px solid #ddd; font-weight:bold; } .invoice-box table tr.details td{ padding-bottom:20px; } .invoice-box table tr.item td{ border-bottom:1px solid #eee; } .invoice-box table tr.item.last td{ border-bottom:none; } .invoice-box table tr.total td:nth-child(2){ border-top:2px solid #eee; font-weight:bold; } @media only screen and (max-width: 600px) { .invoice-box table tr.top table td{ width:100%; display:block; text-align:center; } .invoice-box table tr.information table td{ width:100%; display:block; text-align:center; } } </style> '
+'</head> <body> <div class="invoice-box"> <table cellpadding="0" cellspacing="0"> <tr class="top"> <td colspan="2"> <table> <tr> <td class="title"> <h2 style="width:100%; max-width:300px;">Pak Plast</h2></td> <td> Invoice #: 123<br> Created: January 1, 2015<br> Due: February 1, 2015 </td> </tr> </table> </td> </tr> <tr class="information"> <td colspan="2"> <table> <tr> <td> Next Step Webs, Inc.<br> 12345 Sunny Road<br> Sunnyville, TX 12345 </td> <td> Acme Corp.<br> John Doe<br> john@example.com </td> </tr> </table> </td> </tr> <tr class="heading"> <td> Payment Method </td> <td> Check # </td> </tr> <tr class="details"> <td> Check </td> <td> 1000 </td> </tr> <tr class="heading"> <td> Item </td> <td> Price </td> </tr> <tr class="item"> <td> Website design </td> <td> -300.00 </td> </tr> <tr class="item"> <td> Hosting (3 months) </td> <td> -75.00 </td> </tr> <tr class="item last"> <td> Domain name (1 year) </td> <td> -10.00 </td> </tr> <tr class="total"> <td></td> <td> Total: -385.00 </td> </tr> </table> </div> </body> </html>'
var documents = fs.knownFolders.currentApp();
var file = documents.getFile("invoice.html");
file.writeText(invoiceHtml)
    .then(function () {
        //// Succeeded writing to the file.
        frames.topmost().navigate({
              moduleName: "invoice-page"

            });
    }, function (error) {
        //// Failed to write to the file.
    });


 }

exports.onNavigatingFrom = function(args){
  // console.log("navigatingfrom");
  // orientationModule.orientationCleanup();
}
