var dialogsModule = require("ui/dialogs");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var orientationModule = require('nativescript-screen-orientation');
var viewModule = require("ui/core/view");
var frames = require("ui/frame");
var moment = require("moment");
var pageModule = require('ui/page');
var fs = require("file-system");
var Toast = require("nativescript-toast");
var socialShare = require("nativescript-social-share");
var application = require('application');
var Sqlite = require("nativescript-sqlite");
var createViewModel = require("../view-models/delivery-view-model").createViewModel;
var webViewModule = require("ui/web-view");
var Sqlite = require("nativescript-sqlite");
var dialogs = require("ui/dialogs");
var page;
var nativeView;
var adapter;
var list1;
var deliveryViewModel;
var mongoid = require('mongoid-js');
           

var pageData = new Observable({
    lots: new ObservableArray(),
    tap: 0,
    customerName: "",
    createdBy: "",
    itemType: "",
    name: "Delivery-Page",
    totalWeight: 0,
    deliveryDate: "",
    customers: new ObservableArray(),
    customerIndex:0,
    itemTypes: new ObservableArray(),
    itemIndex: 0,
    soNumber: 0
});
//

exports.tapped = function(args) {
  pageData.tap += 1;
}
exports.loaded = function(args) {
    page = args.object;
    console.log("loaded");

    // pageData.lots = new ObservableArray();
    // var stack = viewModule.getViewById(page,"stack");
    // var autoCompleteTextView = new android.widget.AutoCompleteTextView(page.android);
    // stack.addChild(autoCompleteTextView);
    // if (!Sqlite.exists("populated.db")) {
    //     console.log("ads");
    //     Sqlite.copyDatabase("populated.db");
    // }
    // (new Sqlite("populated.db")).then(db => {
        // database = db;
        // db.resultType(Sqlite.RESULTSASOBJECT);
        // global.deliveryViewModel = createViewModel(db);
        pageData.customers = new ObservableArray();
        pageData.itemTypes = new ObservableArray();
        pageData.itemTypesObject = new ObservableArray();
        global.deliveryViewModel.loadItemTypes(pageData.itemTypesObject,true);

        global.deliveryViewModel.loadCustomers(pageData.customers);
        global.deliveryViewModel.loadItemTypes(pageData.itemTypes);
        pageData.itemIndex = pageData.itemTypes.indexOf(pageData.itemType, false);
        console.log("index", pageData.itemIndex);
        pageData.customers.forEach(function(data){
          list1.add(data.name);
          console.log(data);

        });

        if (application.android) {
            application.android.on(application.AndroidApplication.activityBackPressedEvent, backEvent);
        }
        page.bindingContext = pageData;
    //   });

};

function backEvent(args) {
  args.cancel = true;
}
exports.add = function(args) {

  pageData.customerName = nativeView.getText();
  pageData.itemType = pageData.itemTypes.getItem(pageData.itemIndex);

  frames.topmost().navigate({
        moduleName: "details-page/details-page",
        context: {status: "newLot",
                  deliveryViewModel: deliveryViewModel
                }
});
}
exports.pageLoad = function (){

}
exports.goBack = function() {

}

exports.creatingView = function(args) {
    console.log("creatingView");


    list1 = new java.util.ArrayList();
    nativeView = new android.widget.AutoCompleteTextView(args.context);
    adapter = new android.widget.ArrayAdapter(args.context,android.R.layout.simple_list_item_1,list1)
    // nativeView.setSingleLine(true);
    // nativeView.setEllipsize(android.text.TextUtils.TruncateAt.END);
    nativeView.setText(pageData.customerName);
    nativeView.setAdapter(adapter);
    args.view = nativeView;
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
                          items: newLot.items,
                          qualityID: newLot.qualityID,
                          sizeID: newLot.sizeID
                        });
    pageData.totalWeight += newLot.totalWeight;
    saveDelivery(false); 

    if (newpage.navigationContext.addnew) {
      pageData.customerName = nativeView.getText();

      frames.topmost().navigate({
            moduleName: "details-page/details-page",
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
    pageData.soNumber = 0;
    pageData.deliveryDate = "";
    var delivery = newpage.navigationContext.delivery;
    pageData.customerName = delivery.deliveryCustomerName;
    nativeView.setText(pageData.customerName);
    pageData.itemType = delivery.deliveryItem;
    pageData.createdBy = delivery.deliveryCreatedBy;
    pageData.deliveryDate = delivery.deliveryDate;
    pageData.soNumber = delivery.soNumber;
    pageData.totalWeight = Number(delivery.deliveryTotalWeight.toFixed(2));
    pageData.deliveryID = delivery.deliveryID;
    delivery.deliveryLots.forEach(function(data, index, a) {
      console.log(data);
      pageData.lots.push(data);
    });
  pageData.itemIndex = pageData.itemTypes.indexOf(delivery.deliveryItem);
  // pageData.customerIndex = pageData.customers.indexOf(delivery.CustomernName);

  } else if (newpage.navigationContext.update === "new delivery") {
    console.log("new delivery");
    // pageData.deliveryDate = new Date();
    
    pageData.customerName = "";
    pageData.itemType = "";
    pageData.createdBy = "";
    pageData.totalWeight = 0;
    pageData.deliveryDate = moment().toISOString().toString();
    pageData.deliveryID = mongoid();
    pageData.lots = new ObservableArray();
dialogsModule.prompt({
    title: "SO Number",
    message: "Enter SO Number",
    cancelButtonText: "Cancel",
    okButtonText: "Confirm",
    inputType: dialogsModule.inputType.text

  }).then(function(r) {   
    if (r.result && r.text !== "") {
      pageData.soNumber = r.text;
    }
  });
   console.log("Date",pageData.deliveryDate);
}

  // nativeView.setText(pageData.customerName);



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
  pageData.customerName = nativeView.getText();
  pageData.itemType = pageData.itemTypes.getItem(pageData.itemIndex);
  pageData.lots.splice(index,1);
  frames.topmost().navigate({
        moduleName: "details-page/details-page",
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
  pageData.customerName = nativeView.getText();
  
  pageData.customerName = "";
  frames.topmost().navigate({
        moduleName: "main-page/main-page",
});
}


  var toastSuccessUploaded = Toast.makeText("Succesfully Uploaded");
  var toastFailedUploaded = Toast.makeText("Failed to Upload");


var saveDelivery = function(online) {
  pageData.deliveryDate = moment().toISOString().toString();
  pageData.customerName = nativeView.getText();
  var cID = "";
  pageData.customers.forEach(function(data){
     console.log(" ID \n\n",data._id);
     console.log("CNAME: ",data.name);
    console.log("PNAME: ",pageData.customerName);

    if(data.name == pageData.customerName) {
      console.log("FOUND ID \n\n",data._id);
      cID = data._id;
    }
  });
  var itemID = "";
   pageData.itemTypesObject.forEach(function(data){
     console.log(" ID \n\n",data._id);
     console.log("CNAME: ",data.name);
    var item = pageData.itemTypes.getItem(pageData.itemIndex);
    if(data.name == item) {
      console.log("FOUND ID \n\n",data._id);
      itemID = data._id;
    }
  });
//   console.log("customerName:",pageData.customerName);
//   console.log("data: ",pageData.deliveryDate );
  var delivery = {
        deliveryID : pageData.deliveryID,
        lots: pageData.lots,
        customerName: pageData.customerName,
        customerID: cID,
        itemID: itemID,
        soNumber: pageData.soNumber,
        createdBy: pageData.createdBy,
        totalWeight: pageData.totalWeight,
        deliveryDate: pageData.deliveryDate,
        itemType: pageData.itemTypes.getItem(pageData.itemIndex)
    };
    
   global.deliveryViewModel.saveDelivery(delivery);
if (online) {
 var dispatch = {
  _id: delivery.deliveryID,
  soNumber: pageData.soNumber,
  customer: delivery.customerID,
  date: pageData.deliveryDate
  }; 
dispatch.items = [];
for (var i=0; i<delivery.lots.length; i++) {
  var l = delivery.lots.getItem(i); 
  console.log(JSON.stringify(l.qualityID));

  var lot = {
    quality: l.qualityID,
    size: l.sizeID,
    item: delivery.itemID
  };
  lot.weights = [];
  for (var j=0; j<l.items.length; j++) {
    lot.weights.push(l.items.getItem(j).weight);
  }
  dispatch.items.push(lot);
}

console.log(JSON.stringify(dispatch));
global.apiModel.createDispatch(dispatch).catch(function(){
toastFailedUploaded.show();
 return Promise.reject();

}).then(function(data){
  toastSuccessUploaded.show();
});
}
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
//   pageData.deliveryDate = moment().format('MM-DD-YYYY, h a');
//   pageData.customerName = nativeView.getText();
// //   console.log("customerName:",pageData.customerName);
// //   console.log("data: ",pageData.deliveryDate );
//   var delivery = {
//         deliveryID : pageData.deliveryID,
//         lots: pageData.lots,
//         customerName: pageData.customerName,
//         createdBy: pageData.createdBy,
//         totalWeight: pageData.totalWeight,
//         deliveryDate: pageData.deliveryDate,
//         itemType: pageData.itemTypes.getItem(pageData.itemIndex)
//     };
    
//    global.deliveryViewModel.saveDelivery(delivery);
  saveDelivery(true);

 
  frames.topmost().navigate( {
    moduleName: "main-page/main-page",
    context: {
      update: "new delivery",
      delivery: {
        deliveryID : pageData.deliveryID,
        lots: pageData.lots,
        customerName: pageData.customerName,
        createdBy: pageData.createdBy,
        totalWeight: pageData.totalWeight,
        deliveryDate: pageData.deliveryDate,
        itemType: pageData.itemTypes.getItem(pageData.itemIndex)

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
pageData.customerName = nativeView.getText();
var invoiceNum = pageData.deliveryID;
var deliveryDate = pageData.deliveryDate;
var printDate = moment().format('MM-DD-YYYY, h a');
var company = "Customer";
var customerName = pageData.customerName;
var itemType = pageData.itemTypes.getItem(pageData.itemIndex);
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

dialogsModule.action("Print", "Cancel", ["Summary","Details"]
).then(function(result){

  var invoiceNum = pageData.soNumber;
  var deliveryDate = pageData.deliveryDate;
  var printDate = moment().format('MM-DD-YYYY, h a');
  var company = "Customer";
  var customerName = pageData.customerName;
  var itemType = pageData.itemTypes.getItem(pageData.itemIndex);
  var dispatchItems = "";
  var dispatchDetails = "";
  var totalItems = 0;
  var totalWeight = 0;
  // if (result === "Summary") {
  for (var count=0; count<pageData.lots.length;count++) {
    var data = pageData.lots.getItem(count);
    console.log(data);
    var con = '<tr class="item"> <td> '+data.lotQuality+'</td><td> '+data.lotSize+'</td> <td align="right"> '+data.lotNumItems+'</td><td align="right">'+data.lotTotalWeight+'</td> </tr>';
    // dispatchItems.concat(con);
    var items = "";
    if (result === "Details") {
    for (var i = 0; i<data.items.length; i++) {
    var it = data.items.getItem(i);
    var list = '<tr class="item"> <td> </td><td> </td> <td align="right"> </td><td align="right">'+it.weight+'</td> </tr>';
    items = items + list;
    }
    }
    totalItems += data.lotNumItems;
    totalWeight += data.lotTotalWeight;
    dispatchItems = dispatchItems + con+ items;

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
          pageData.customerName = nativeView.getText();
          pageData.itemType = pageData.itemTypes.getItem(pageData.itemIndex);

          frames.topmost().navigate({
                moduleName: "delivery-page/invoice/invoice-page"

              });
      }, function (error) {
          //// Failed to write to the file.
      });

// } else if (result === "Details") {
console.log(result);
// var items = "";
// for (var count = 0; count<pageData.lots.length; count++) {
//     var lot = pageData.lots.getItem(count);
//     var con = "Quality: "+lot.lotQuality + " Size: " + lot.lotSize + " \n";
//     items = items + con;

//     for (var i = 0; i<lot.items.length; i++) {
//     var it = lot.items.getItem(i);

//     items = items + it.weight + "\n";
    // console.log(items);

    


// dispatchDetails = "Item: " + JSON.stringify(itemType) + "\n" + items;
// console.log(dispatchDetails);
// socialShare.shareText(dispatchDetails);
// }
});


 }

exports.onNavigatingFrom = function(args){
  console.log("navigatingfrom");
  // orientationModule.orientationCleanup();
}
