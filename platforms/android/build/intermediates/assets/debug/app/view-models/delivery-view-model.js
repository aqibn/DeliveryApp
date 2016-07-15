var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var Toast = require("nativescript-toast");

var Sqlite = require("nativescript-sqlite");

function createViewModel(database) {

  var delivery = new Observable();


  delivery.deleteDelivery = function(sDelivery) {
    database.execSQL("delete from items where deliveryid="+sDelivery.deliveryID).then(id => {
      console.log("Item Delete RESULT", id);
      database.execSQL("delete from lots where deliveryid="+sDelivery.deliveryID).then(id => {
        console.log("lot Delete RESULT", id);
        database.execSQL("delete from deliveries where deliveryid="+sDelivery.deliveryID).then(id => {
          console.log("delivery Delete RESULT", id);

        }, error => {
          console.log("Delivery Update ERROR", error);

        });
      }, error => {
        console.log("LOT Update ERROR", error);

      });
    }, error => {
      console.log("ITEM Update ERROR", error);

    });

  }


  delivery.saveLot = function(sDelivery) {
    console.log("Deliverid",sDelivery.deliveryID);
    database.execSQL("delete from lots where deliveryid='"+sDelivery.deliveryID+"'").then(id => {
      sDelivery.lots.forEach(function(lot, index, a) {
        database.execSQL("INSERT INTO lots (deliveryid, lotid, size, sizeID, quality, qualityID, totalWeight) VALUES(?,?,?,?,?,?,?)",[sDelivery.deliveryID, (index+1), lot.lotSize,lot.sizeID,lot.lotQuality,lot.qualityID, lot.lotTotalWeight]).then(id => {
          // console.log("LOT Update RESULT", id);
          delivery.saveItems(sDelivery,(index+1));
        }, error => {
          console.log("LOT Update ERROR", error);

        });
      });

    }, error => {
      console.log("LOT DELETE ERROR", error);

    });


  }

  delivery.saveItems = function(sDelivery,lotid) {
    // console.log("lotid:",lotid);
    database.execSQL("delete from items where deliveryid=?",[sDelivery.deliveryID]).then(id => {
      sDelivery.lots.getItem(lotid-1).items.forEach(function(item,index,a) {
        // console.log("itemid",index);
        database.execSQL("INSERT INTO items (deliveryid, lotid, itemid, weight) VALUES(?,?,?,?)",[sDelivery.deliveryID, lotid, (index+1),item.weight]).then(id => {
          // console.log("ITEM Update RESULT", id);
        }, error => {
          console.log("ITEM Update ERROR", error);

        });
      });


    }, error => {
      console.log("LOT DELETE ERROR", error);

    });

  }

  delivery.saveDelivery = function(sDelivery) {
   
    if (sDelivery.deliveryID == 0) {
      console.log("New Delivery");
      database.execSQL("INSERT into deliveries (customername, customerID," +
      "createdby, date, itemtype) VALUES(?,?,?,?,?)",
      [sDelivery.customerName, sDelivery.customerID, sDelivery.createdBy,sDelivery.deliveryDate,sDelivery.itemType]).then(id => {
        // console.log("Update INSERT RESULT", id);
        sDelivery.deliveryID = id;
        delivery.saveLot(sDelivery);
        // deliveries.push({
        //   deliveryID: sDelivery.deliveryID,
        //   deliveryTotalWeight: sDelivery.totalWeight,
        //   deliveryCustomerName: sDelivery.customerName,
        //   deliveryCreatedBy: sDelivery.createdBy,
        //   deliveryDate: sDelivery.deliveryDate,
        //   deliveryLots: sDelivery.lots,
        //   deliveryItem: sDelivery.itemType
        // });
      }, error => {
        console.log("Update ERROR", error);
      });

    } else {
      database.execSQL("REPLACE into deliveries (deliveryid,customername, customerID," +
      "createdby, date,itemtype, itemID) VALUES(?,?,?,?,?,?,?)",
      [sDelivery.deliveryID,sDelivery.customerName, sDelivery.customerID, sDelivery.createdBy,sDelivery.deliveryDate,sDelivery.itemType,sDelivery.itemID]).then(id => {
        // console.log("Update REPLACE RESULT", id);
        delivery.saveLot(sDelivery);
        // deliveries.push({
        //   deliveryID: sDelivery.deliveryID,
        //   deliveryTotalWeight: sDelivery.totalWeight,
        //   deliveryCustomerName: sDelivery.customerName,
        //   deliveryCreatedBy: sDelivery.createdBy,
        //   deliveryDate: sDelivery.deliveryDate,
        //   deliveryLots: sDelivery.lots,
        //   deliveryItem: sDelivery.itemType
        // });
      }, error => {
        console.log("Update ERROR", error);
      });

    }


  }
  var toastSuccessAdded = Toast.makeText("Succesfully Added");
  var toastAddFailed = Toast.makeText("Failed to Add")
  var toastSuccessDeleted = Toast.makeText("Succesfully Deleted");
  var toastDeleteFailed = Toast.makeText("Failed to Delete")


  delivery.deleteAll = function(table, cb) {
      database.execSQL("DELETE FROM "+table).then(function(id, error){
      console.log("Delete Success",id);
    //   toastSuccessDeleted.show();
   
        cb();
    
    //   toastDeleteFailed.show();
     
     
    });
  }
  delivery.addQuality = function(quality) {
    database.execSQL("INSERT into qualitytypes (name, _id) VALUES(?,?)",[quality.name,quality._id]).then(id => {
      // console.log("INSERT Success",id);
    //   toastSuccessAdded.show();
    }, error => {
      toastAddFailed.show();
      console.log("INSEERT failed",error);
    });
  }

  delivery.addCustomer = function(customer) {
    database.execSQL("INSERT into customers (name,_id) VALUES(?,?)",[customer.firstName, customer._id]).then(id => {
      // console.log("INSERT Success",id);
    //   toastSuccessAdded.show();
    }, error => {
      toastAddFailed.show();
      console.log("INSEERT failed",error);
    });
  }
  delivery.addItemType = function(itemType) {
    database.execSQL("INSERT into itemtypes (name, _id) VALUES(?,?)",[itemType.name, itemType._id]).then(id => {
      // console.log("INSERT Success",id);
    //   toastSuccessAdded.show();
    }, error => {
      toastAddFailed.show();
      console.log("INSEERT failed",error);
    });
  }

  delivery.addSize = function(size) {
    database.execSQL("INSERT into sizetypes (name, _id) VALUES(?,?)",[size.name,size._id]).then(id => {
      // console.log("INSERT Success",id);
    //   toastSuccessAdded.show();
    }, error => {
      toastAddFailed.show();
      console.log("INSEERT failed",error);
    });
  }

  delivery.deleteQuality = function(qualityType) {
    database.execSQL("delete from qualitytypes where name=?",[qualityType]).then(id => {
      console.log("Delete Success",id);
      toastSuccessDeleted.show();
    }, error => {
      toastDeleteFailed.show();
      console.log("delete failed",error);
    });
  }

  delivery.deleteCustomer = function(customer) {
    database.execSQL("delete from customers where name=?",[customer]).then(id => {
      console.log("Delete Success",id);
      toastSuccessDeleted.show();
    }, error => {
      toastDeleteFailed.show();
      console.log("delete failed",error);
    });
  }

  delivery.deleteItemType = function(itemType) {
    database.execSQL("delete from itemtypes where type=?",[itemType]).then(id => {
      console.log("Delete Success",id);
      toastSuccessDeleted.show();
    }, error => {
      toastDeleteFailed.show();
      console.log("delete failed",error);
    });
  }
  delivery.deleteSize = function(sizeType) {
    database.execSQL("delete from sizetypes where type=?",[sizeType]).then(id => {
      console.log("Delete Success",id);
      toastSuccessDeleted.show();
    }, error => {
      toastDeleteFailed.show();
      console.log("delete failed",error);
    });
  }

  delivery.search = function(table,attribute,param) {
    database.get("SELECT * FROM "+table+"where "+attribute+"=?",[param], function(err,row){
      console.log("RESULT", JSON.stringify(row));
      return row;
    });
  }
  
  
  delivery.loadSizes = function(listitemssize) {
    database.each("SELECT * FROM sizetypes", function(err,size){
      // console.log("RESULT", JSON.stringify(size));
      listitemssize.push(size);
    });
  }

  delivery.loadCustomers = function(listcustomers) {
    database.each("SELECT * FROM customers", function(err,customer){
      // console.log("RESULT", JSON.stringify(customer));
      listcustomers.push(customer);
    });
  }

  delivery.loadItemTypes = function(listitemtypes, object) {
    database.each("SELECT * FROM itemtypes", function(err,itemtype){
      // console.log("RESULT", JSON.stringify(itemtype));
      if (object) {
        listitemtypes.push(itemtype);
      } else {
        listitemtypes.push(itemtype.name);
 
      }
    });
  }

  delivery.loadQualities = function(listitemsquality) {
    database.each("SELECT * FROM qualitytypes", function(err,quality){
      // console.log("RESULT", JSON.stringify(quality));
      listitemsquality.push(quality);
    });
  }


  delivery.loadDeliveries = function(deliveries) {
    database.each("SELECT * FROM deliveries",function(err,row) {
      // console.log("RESULT", JSON.stringify(row));
      var new_delivery = {
        deliveryID: row.deliveryid,
        deliveryTotalWeight: 0,
        deliveryCustomerName: row.customername,
        customerID: row.customerID,
        deliveryCreatedBy: row.createdby,
        deliveryDate: row.date,
        deliveryItem: row.itemtype,
        itemID: row.itemID
      };
      new_delivery.deliveryLots = new ObservableArray();
      database.each("SELECT * FROM lots where deliveryid=?",[row.deliveryid],function(err,lot) {
        console.log("RESULT", JSON.stringify(lot));

        var new_lot = {
          lotID: lot.lotid,
          lotTotalWeight: 0,
          lotQuality: lot.quality,
          qualityID: lot.qualityID,
          lotSize: lot.size,
          sizeID: lot.sizeID,
          lotNumItems: 0
        };
        new_lot.items = new ObservableArray();
        // console.log("lotid",lot.lotid);
        database.each("SELECT * FROM items where deliveryid=? AND lotid=?",[lot.deliveryid,lot.lotid],function(err,item){

          // console.log("RESULT", JSON.stringify(item));
          var w = Number(item.weight.toFixed(2));
          var new_item = {
            itemID: item.itemid,
            weight: w
          };
          new_lot.lotTotalWeight += new_item.weight;
          new_lot.lotNumItems += 1;
          new_lot.items.push(new_item);

        });
        new_delivery.deliveryTotalWeight += Number(new_lot.lotTotalWeight.toFixed(2));
        new_delivery.deliveryLots.push(new_lot);
      });

      deliveries.push(new_delivery);
    });



  }

  return delivery;
}


exports.createViewModel = createViewModel;
