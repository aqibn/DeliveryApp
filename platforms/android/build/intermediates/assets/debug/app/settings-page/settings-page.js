var dialogsModule = require("ui/dialogs");
var frames = require("ui/frame");
var appSettings = require("application-settings");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var viewModule = require("ui/core/view");
var applicationSettings = require("application-settings");
var Toast = require("nativescript-toast");

var toastSuccessAdded = Toast.makeText("Succesfully Added");

var page;
var deliveryViewModel;

var loadItems = function() {
      pageData.items = new ObservableArray();

     if (pageData.settingType === "Quality") { 
        global.deliveryViewModel.loadQualities(pageData.items);   
   } else if (pageData.settingType === "Size") {
        global.deliveryViewModel.loadSizes(pageData.items);   
   } else if (pageData.settingType === "Customer") {
        global.deliveryViewModel.loadCustomers(pageData.items);   
   } else if (pageData.settingType === "Item") {
       global.deliveryViewModel.loadItemTypes(pageData.items,true);
   }
}

var pageData = new Observable({
    items: new ObservableArray([{name: "Item 1"},{name: "Item 2"}]),
    settingType: ""
});

exports.loaded = function(args) {
    page = args.object;
    page.bindingContext = pageData;
};




exports.navigatedTo = function(args) {
    console.log("navigatedto");
    var newpage = args.object;
    
   pageData.settingType = newpage.navigationContext;
   loadItems();

  
    
}

var handleError = function() {
  dialogsModule.alert({
             message: "Unfortunately we could not connect to server.",
             okButtonText: "OK"
         });
         return Promise.reject();
}

exports.addItem = function(args) {
 if (global.user.userData.role.name === "ADMIN") {
 dialogsModule.prompt({
    title: "Add " + pageData.settingType,
    message: "Enter "+pageData.settingType+" Name",
    cancelButtonText: "Cancel",
    okButtonText: "Confirm",

    inputType: dialogsModule.inputType.text

  }).then(function(r) {
    if (r.result && r.text !== "") {   
    var name = r.text;  
      console.log(name); 
     if (pageData.settingType === "Quality") {
       global.apiModel.createQuality(r.text).catch(handleError).then(function(quality) {
        global.deliveryViewModel.addQuality(quality); 
        loadItems();
        toastSuccessAdded.show()
         });   
          
      } else if (pageData.settingType === "Size") {
      global.apiModel.createSize(r.text).catch(handleError).then(function(size) {
        global.deliveryViewModel.addSize(size); 
        loadItems();
        toastSuccessAdded.show()

         });      
         
   } else if (pageData.settingType === "Customer") {
            var customer = {
              name: name,
              address: "",
              number: ""
            };
            dialogsModule.prompt({
                title: "Add " + pageData.settingType,
                message: "Enter "+pageData.settingType+" address",
                cancelButtonText: "Cancel",
                okButtonText: "Confirm",

                inputType: dialogsModule.inputType.text

              }).then(function(r) {
            if (r.result && r.text !== "") {       
            customer.address = r.text; 
            dialogsModule.prompt({
                title: "Add " + pageData.settingType,
                message: "Enter "+pageData.settingType+" number",
                cancelButtonText: "Cancel",
                okButtonText: "Confirm",

                inputType: dialogsModule.inputType.text

              }).then(function(r) {
                      if (r.result && r.text !== "") {       
                
             customer.number = r.text;

            global.apiModel.createCustomer(customer).catch(handleError).then(function(cust) {
            global.deliveryViewModel.addCustomer(cust); 
            loadItems();
            toastSuccessAdded.show()
            });
           
                      }
                     }); 
            } 
      });  
              
              
          } else if (pageData.settingType === "Item") {
        global.apiModel.createItem(r.text).catch(handleError).then(function(item) {
            global.deliveryViewModel.addItemType(item); 
            loadItems();
            toastSuccessAdded.show()

         });   
           }
   loadItems();  
}
  }); 
 } else {
   dialogsModule.alert({
    title: "Not Allowed",
    message: "Only Admin can add new "+pageData.settingType,
    okButtonText: "Confirm"
  }).then(function(r) {
 });
 
}
}

exports.deleteListItem = function(args) {
    var dialogMessage = "Delete this " + pageData.settingType + " ?"; 
    dialogsModule.confirm(dialogMessage).then(function(result) {
    if (result) {
      var item = args.view.bindingContext;
      var index = pageData.items.indexOf(item);
      console.log(index);
    //   pageData.items.splice(index,1);
      if (pageData.settingType === "Quality") {
        global.deliveryViewModel.deleteQuality(item.name); 
        global.apiModel.deleteAPI("qualities",item._id);  
   } else if (pageData.settingType === "Size") {
        global.deliveryViewModel.deleteSize(item.name); 
        global.apiModel.deleteAPI("sizes",item._id);  
   } else if (pageData.settingType === "Customer") {
        global.deliveryViewModel.deleteCustomer(item.name);  
        global.apiModel.deleteAPI("customers",item._id);  
 
   } else if (pageData.settingType === "Item") {
        global.deliveryViewModel.deleteItemType(item.name);
        global.apiModel.deleteAPI("items",item._id);  
   
   }
   loadItems()
 }
  });
    
}

exports.goBack = function(args) {
     frames.goBack();
}
