var dialogsModule = require("ui/dialogs");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var orientationModule = require('nativescript-screen-orientation');
require( "nativescript-orientation" );
var viewModule = require("ui/core/view");
var frames = require("ui/frame");
var page;
var application = require('application');
var Sqlite = require("nativescript-sqlite");
var createViewModel = require("../view-models/delivery-view-model").createViewModel;

var dotPressed;
var lot =  {
  size: "",
  quality: "",
  items: new ObservableArray()

  // new ObservableArray([{weight: 10},{weight: 10},{weight: 10},{weight: 10}])
};
// var sizeArray =   ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];
// var qualityArray = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];
var listSize;
var nativeViewSize;
var adapterSize;
var listQuality;
var nativeViewQuality;
var adapterQuality;

var pageData = new Observable({

    listitemsquality: new ObservableArray(),
    listitemssize: new ObservableArray(),
    name: "New Lot",
    lot: lot,
    selectedQuality: "",
    selectedSize: "",
    weight: 0,
    weightString: "",
    numItems: 0,
    totalWeight:0,
    status: "",
    old_lot: null
});
//

// var deliveryViewModel;

exports.loaded = function(args) {
    page = args.object;
    pageData.lot.items = new ObservableArray();
    console.log(application.getOrientation());
    var orientation = application.getOrientation();
    pageData.old_lot = null;
    orientationModule.setCurrentOrientation(orientation,function() {
        console.log(" orientation set");
      });
    //   if (!Sqlite.exists("populated.db")) {
    //       console.log("ads");
    //       Sqlite.copyDatabase("populated.db");
    //   }
    //   (new Sqlite("populated.db")).then(db => {
          // database = db;
        //   db.resultType(Sqlite.RESULTSASOBJECT);
        //   global.deliveryViewModel = createViewModel(db);
     
          pageData.listitemssize = new ObservableArray();
          pageData.listitemsquality = new ObservableArray();
          global.deliveryViewModel.loadQualities(pageData.listitemsquality);
          global.deliveryViewModel.loadSizes(pageData.listitemssize);
          pageData.listitemssize.forEach(function(data){
            listSize.add(data.name);
          });
          pageData.listitemsquality.forEach(function(data) {
            listQuality.add(data.name);
          });
          page.bindingContext = pageData;

        // });
    //          var id = mongoid();   
    //      console.log("ID: ", id);
    // pageData.totalWeight = 0;
    // pageData.numItems = 0;
    // pageData.weightString = "";
    // pageData.weight = 0;
    // pageData.status = "";
    // dotPressed = false;
    // if (application.android) {
    //     application.android.on(application.AndroidApplication.activityBackPressedEvent, backEventa);
    // }
};

exports.creatingViewSize = function(args) {
    console.log("creatingView");


    listSize = new java.util.ArrayList();
    nativeViewSize = new android.widget.AutoCompleteTextView(args.context);
    adapterSize = new android.widget.ArrayAdapter(args.context,android.R.layout.simple_list_item_1,listSize)
    // nativeView.setSingleLine(true);
    // nativeView.setEllipsize(android.text.TextUtils.TruncateAt.END);
    nativeViewSize.setText(pageData.selectedSize);
    nativeViewSize.setAdapter(adapterSize);
    args.view = nativeViewSize;
}

exports.creatingViewQuality = function(args) {
    console.log("creatingView");


    listQuality = new java.util.ArrayList();
    nativeViewQuality = new android.widget.AutoCompleteTextView(args.context);
    adapterQuality = new android.widget.ArrayAdapter(args.context,android.R.layout.simple_list_item_1,listQuality)
    // nativeView.setSingleLine(true);
    // nativeView.setEllipsize(android.text.TextUtils.TruncateAt.END);
    nativeViewQuality.setText(pageData.selectedQuality);
    nativeViewQuality.setAdapter(adapterQuality);
    args.view = nativeViewQuality;
}
// function backEventa(args) {
//   args.cancel = true;
// }

exports.pageLoad = function (){
  // orientationModule.setCurrentOrientation("landscape",function() {
  //   console.log("landscape orientation set");
  // });
}

exports.onNavigatingFrom = function(args){
  console.log("navigatingfrom");
  orientationModule.orientationCleanup();
  var page = args.object;
  if (pageData.status !== "save") {
    args.object.navigationContext = null;
  }
  // page.bindingContext = null;

}

exports.addItem = function(args) {
  if (pageData.weight === 0) {
      dialogsModule.alert({
          message: "Enter Weight",
          okButtonText: "OK"
      });
      return;
  }

  // Dismiss the keyboard
  // page.getViewById("weight").dismissSoftInput();
  // var squality = pageData.listitemsquality.getItem(pageData.selectedQualityIndex);
  // var ssize = pageData.listitemsquality.getItem(pageData.selectedSizeIndex);
  // alert(squality);
  var w = Number(pageData.weight.toFixed(2));
  pageData.lot.items.unshift({weight: w,
                          itemid: pageData.numItems});
  // push({weight: pageData.weight,
  //                         id: pageData.numItems});

  pageData.totalWeight += w;
  pageData.numItems += 1;
  // Empty the input field
  pageData.totalWeight = Number(pageData.totalWeight.toFixed(2));
  pageData.weightString = "";
  pageData.weight = 0;
  dotPressed = false;
  return;
}


exports.addDigit = function(args) {
  console.log("Add digit");
  var btn = args.object;
  if(btn.text === ".") {
    console.log("Dot Pressed");
    console.log(dotPressed)
    if (dotPressed) {
      return;
    } else {
      pageData.weightString = (pageData.weightString)+(btn.text);
      dotPressed = true;
      return;
  }
}
  // console.log(weight);
  pageData.weightString = (pageData.weightString)+(btn.text);
  pageData.weight = Number(pageData.weightString);

  // weight = weight.concat(btn.text);
  // var a = "a" + "b";

  console.log(pageData.weightString);
}

exports.clear = function (args) {
pageData.weightString = "";
pageData.weight = 0;
dotPressed = false;
}

exports.listViewItemTap = function(args) {
  // var tappedItemIndex = args.index;
  // var tappedItemView = args.view;
  // var item = args.view.bindingContext;
  // var index = pageData.lot.items.indexOf(item);
  // console.log(item.id);
  // console.log(index);
  // pageData.lot.items.splice(index,1);
  // pageData.numItems -= 1;
  // pageData.totalWeight -= item.weight;



}
exports.deleteListItem = function(args) {
  var item = args.view.bindingContext;
  var index = pageData.lot.items.indexOf(item);
  console.log(item.id);
  console.log(index);
  pageData.lot.items.splice(index,1);
  pageData.numItems -= 1;
  pageData.totalWeight -= item.weight;
  pageData.totalWeight = Number(pageData.totalWeight.toFixed(2));
}

exports.addNew = function(args) {
  if(pageData.numItems == 0) {
    dialogsModule.alert({
        message: "You have not added any items to this lot",
        okButtonText: "OK"
    });
    return;
  }
  lot.quality = nativeViewQuality.getText();
  lot.size = nativeViewSize.getText();


    var qualityID = "";
  pageData.listitemsquality.forEach(function(data){
     console.log(" ID \n\n",data._id);
     console.log("CNAME: ",data.name);
    if(data.name == lot.quality) {
      console.log("FOUND ID \n\n",data._id);
      qualityID = data._id;
    }
  }); 

   var sizeID = "";
  pageData.listitemssize.forEach(function(data){
     console.log(" ID \n\n",data._id);
     console.log("CNAME: ",data.name);
    if(data.name == lot.size) {
      console.log("FOUND ID \n\n",data._id);
      sizeID = data._id;
    }
  }); 

  lot.qualityID = qualityID;
  lot.sizeID = sizeID;
  lot.totalWeight = pageData.totalWeight;
  lot.numItems = pageData.numItems;
  pageData.selectedSize = "";
  pageData.selectedQuality = "";
  pageData.status = "save";
  frames.topmost().navigate( {
    moduleName: "delivery-page/delivery-page",
    context: {
      update: "new lot",
      lot: lot,
      addnew: true
    }
  });

}

exports.saveBack = function(args) {
  if(pageData.numItems == 0) {
    dialogsModule.alert({
        message: "You have not added any items to this lot",
        okButtonText: "OK"
    });
    return;
  }
  lot.quality = nativeViewQuality.getText();
  lot.size = nativeViewSize.getText();

  var qualityID = "";
  pageData.listitemsquality.forEach(function(data){
     console.log(" ID \n\n",data._id);
     console.log("CNAME: ",data.name);
    if(data.name == lot.quality) {
      console.log("FOUND ID \n\n",data._id);
      qualityID = data._id;
    }
  }); 

   var sizeID = "";
  pageData.listitemssize.forEach(function(data){
     console.log(" ID \n\n",data._id);
     console.log("CNAME: ",data.name);
    if(data.name == lot.size) {
      console.log("FOUND ID \n\n",data._id);
      sizeID = data._id;
    }
  }); 

  lot.qualityID = qualityID;
  lot.sizeID = sizeID;
  lot.totalWeight = pageData.totalWeight;
  lot.numItems = pageData.numItems;
  pageData.selectedSize = "";
  pageData.selectedQuality = "";
  pageData.status = "save";
  frames.topmost().navigate( {
    moduleName: "delivery-page/delivery-page",
    context: {
      update: "new lot",
      lot: lot,
      addnew: false
    }
  });
}

// exports.addSize = function(args) {
//   dialogsModule.action("Size Menu", "Cancel", ["Add new size", "Delete size"]).then(function(result){
//     console.log(result);
//     if (result === "Add new size") {
//     dialogsModule.prompt({
//       title: "Add Size",
//       okButtonText: "Confirm",
//       inputType: dialogsModule.inputType.text
//
//     }).then(function(r) {
//       console.log(r.text);
//       sizeArray.push(r.text);
//       pageData.listitemssize.push(r.text);
//       var listpicker = page.getViewById("sizelistpicker");
//       listpicker.refresh();
//     });
//
//   } else if(result === "Delete size") {
//     console.log("here");
//     dialogsModule.action("Delete Size","Cancel", sizeArray).then(function(result) {
//       console.log(result);
//     });
//   }
//   });
// }


 exports.navigatedTo = function(args) {

    console.log("navigatedto");
    var newpage = args.object;
    console.log(args.object)
    // console.log(page.navigationContext);
    if (newpage.navigationContext !== undefined) {
      console.log("refresh");
      // deliveryViewModel = newpage.navigationContext.deliveryViewModel;


      if(newpage.navigationContext.status === "old_lot") {
        console.log("old lot");
        var newLot = newpage.navigationContext.s_lot;
        pageData.old_lot = newLot;
        pageData.totalWeight = newLot.lotTotalWeight;
        pageData.numItems = newLot.lotNumItems;
        pageData.selectedSize= newLot.lotSize;
        pageData.selectedQuality = newLot.lotQuality;
        nativeViewSize.setText(pageData.selectedSize);
        nativeViewQuality.setText(pageData.selectedQuality);

        newLot.items.forEach(function(data, index, a) {
          console.log(data);
          pageData.lot.items.push(data);
        });

        // console.log(pageData.lot.items.getItem(0).weight);
        pageData.weightString = "";
        pageData.weight = 0;
      } else if (newpage.navigationContext.status === "newLot") {
        console.log("newLot");
         
        pageData.totalWeight = 0;
        pageData.numItems = 0;
        pageData.weightString = "";
        pageData.weight = 0;
        pageData.status = "";
         dotPressed = false;
        pageData.status = newpage.navigationContext.status;
      }

      // deliveryViewModel.loadSizes(pageData.listitemssize);
      // deliveryViewModel.loadQualities(pageData.listitemsquality);
    } else {
      console.log("notrefresh");

    }
    // pageData = page.navigationContext.update;
    // page.bindingContext = pageData;
}

exports.goBack = function(args) {
  pageData.selectedSize = "";
  pageData.selectedQuality = ""; 
  if (pageData.old_lot !== null) {


  var cancledLot = {
    totalWeight: pageData.old_lot.lotTotalWeight,
    numItems: pageData.old_lot.lotNumItems,
    size: pageData.old_lot.lotSize,
    quality: pageData.old_lot.lotQuality,
    items: pageData.old_lot.items
};

  frames.topmost().navigate({
        moduleName: "delivery-page/delivery-page",
        context: {
          update: "new lot",
          lot: cancledLot
        }
});
  } else {
    frames.topmost().navigate({
          moduleName: "delivery-page/delivery-page"
        });
  }
}
// exports.navigatedTo = function(args) {
//   orientationModule.setCurrentOrientation("landscape",function() {
//     console.log("landscape orientation set");
//   });
//     console.log("navigatedto");
//     var page = args.object;
//     console.log(page.navigationContext);
//     pageData.name = page.navigationContext.name;
//     page.bindingContext = pageData;
// }
