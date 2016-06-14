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
var application = require('application');
var Sqlite = require("nativescript-sqlite");
var createViewModel = require("./delivery-view-model").createViewModel;

var dotPressed;
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
    deliveryDate: "",
    customers: new ObservableArray(),
    customerIndex:0,
    itemTypes: new ObservableArray(),
    itemIndex: 0
});
//

exports.tapped = function(args) {
  pageData.tap += 1;
}
exports.loaded = function(args) {
    page = args.object;
    // pageData.lots = new ObservableArray();
    if (!Sqlite.exists("populated.db")) {
        console.log("ads");
        Sqlite.copyDatabase("populated.db");
    }
    (new Sqlite("populated.db")).then(db => {
        // database = db;
        db.resultType(Sqlite.RESULTSASOBJECT);
        deliveryViewModel = createViewModel(db);
        pageData.customers = new ObservableArray();
        pageData.itemTypes = new ObservableArray();
        pageData.customerIndex  = 1;
        pageData.itemIndex = 1;
        deliveryViewModel.loadCustomers(pageData.customers);
        deliveryViewModel.loadItemTypes(pageData.itemTypes);
        page.bindingContext = pageData;

      });
    if (application.android) {
        application.android.on(application.AndroidApplication.activityBackPressedEvent, backEvent);
    }
    page.bindingContext = pageData;
};

function backEvent(args) {
  args.cancel = true;
}
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
      // deliveryViewModel = newpage.navigationContext.deliveryViewModel;

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
    if (newpage.navigationContext.addnew) {
      frames.topmost().navigate({
            moduleName: "details-page",
            context: {status: "newLot",
                      deliveryViewModel: deliveryViewModel
                    }
    });
    }
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
var invoiceNum = 100;
var deliveryDate = pageData.deliveryDate;
var printDate = moment().format('MM-DD-YYYY, h a');
var company = "Customer";
var customerName = pageData.customerName;
var itemType = "Rolls";
var dispatchItems = "";
var totalItems = 0;
var totalWeight = 0;
for (var count=0; count<pageData.lots.length;count++) {
  var data = pageData.lots.getItem(count);
  console.log(data);
  var con = '<tr class="item"> <td> '+data.lotQuality+'</td><td> '+data.lotSize+'</td> <td align="right"> '+data.lotNumItems+'</td><td align="right">'+data.lotTotalWeight+'</td> </tr>';
  // dispatchItems.concat(con);
  totalItems += data.lotNumItems;
  totalWeight += data.lotTotalWeight;
  dispatchItems = dispatchItems + con;
}
console.log("dispatch items", dispatchItems);
var invoiceHtml = '<!doctype html> <html> <head> <meta charset="utf-8"> <title>A simple, clean, and responsive HTML invoice template</title> <style>  .invoice-box table{ width:100%; line-height:inherit; text-align:left; } .invoice-box table td{  vertical-align:top; } .invoice-box table tr td:nth-child(2){ text-align:right; } .invoice-box table tr.top table td{  } .invoice-box table tr.top table td.title{ color:#333; } .invoice-box table tr.information table td{} .invoice-box table tr.heading td{ background:#eee; border-bottom:1px solid #ddd; font-weight:bold; } .invoice-box table tr.details td{ padding-bottom:20px; } .invoice-box table tr.item td{ border-bottom:1px solid #eee; align:center} .invoice-box table tr.item.last td{ border-bottom:none; } .invoice-box table tr.total td:nth-child(4){ border-top:2px solid #eee; font-weight:bold; } @media only screen and (max-width: 600px) { .invoice-box table tr.top table td{ width:100%; display:block; text-align:center; } .invoice-box table tr.information table td{ width:100%; display:block; text-align:center; } } </style> '
+'</head> <body> <div class="invoice-box"> <table cellpadding="0" cellspacing="0"> <tr class="top"> <td colspan="4"> <table> <tr> <td class="title"> <h2 style="width:100%; max-width:300px;">Pak Plast</h2><h4>PE ROLLS - POLYBAGS - TUNNEL <br> & MULCH FILM</h4></td> <td> Invoice #:'+invoiceNum
+'<br> Printed:'+ printDate+'<br> Due: '+deliveryDate+'</td> </tr> </table> </td> </tr> <tr class="information"> <td colspan="4"> <table> <tr> <td> Novapack Pvt, Ltd.<br> Sheikupura Road<br> Lahore </td> <td> '+company
+'<br> '+customerName+'<br></td> </tr> </table> </td> </tr> <tr class="heading"> <td colspan="4"> Item Type </td>  </tr> <tr class="details"> <td> '+itemType
+'</td> <td >  </td> </tr> <tr class="heading"> <td colspan="4"align="center"> Dispatch Summary </td>  </tr><tr class="heading"> <td > Quality </td><td > Size </td><td align="right" > Num Items </td><td align="right"> Weight (Kgs) </td>  </tr>'
+dispatchItems+'<tr class="item"> <td colspan="2"></td> <td> Total: '+totalItems+' </td> <td align="right">'+totalWeight+'</td></tr></table> </div> </body> </html>';
// console.log(invoiceHtml);
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
