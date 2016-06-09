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
    database.execSQL("delete from lots where deliveryid="+sDelivery.deliveryID).then(id => {
      sDelivery.lots.forEach(function(lot, index, a) {
        database.execSQL("INSERT INTO lots (deliveryid, lotid, size, quality, totalWeight) VALUES(?,?,?,?,?)",[sDelivery.deliveryID, (index+1), lot.lotSize,lot.lotQuality,lot.lotTotalWeight]).then(id => {
          console.log("LOT Update RESULT", id);
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
    console.log("lotid:",lotid);
    database.execSQL("delete from items where deliveryid=?",[sDelivery.deliveryID]).then(id => {
      sDelivery.lots.getItem(lotid-1).items.forEach(function(item,index,a) {
        console.log("itemid",index);
        database.execSQL("INSERT INTO items (deliveryid, lotid, itemid, weight) VALUES(?,?,?,?)",[sDelivery.deliveryID, lotid, (index+1),item.weight]).then(id => {
          console.log("ITEM Update RESULT", id);
        }, error => {
          console.log("ITEM Update ERROR", error);

        });
      });


    }, error => {
      console.log("LOT DELETE ERROR", error);

    });

  }

  delivery.saveDelivery = function(sDelivery,deliveries) {

    if (sDelivery.deliveryID == 0) {
      console.log("New Delivery");
      database.execSQL("INSERT into deliveries (customername, " +
      "createdby, date) VALUES(?,?,?)",
      [sDelivery.customerName, sDelivery.createdBy,sDelivery.deliveryDate]).then(id => {
        console.log("Update INSERT RESULT", id);
        sDelivery.deliveryID = id;
        delivery.saveLot(sDelivery);
        deliveries.push({
          deliveryID: sDelivery.deliveryID,
          deliveryTotalWeight: sDelivery.totalWeight,
          deliveryCustomerName: sDelivery.customerName,
          deliveryCreatedBy: sDelivery.createdBy,
          deliveryDate: sDelivery.deliveryDate,
          deliveryLots: sDelivery.lots
        });
      }, error => {
        console.log("Update ERROR", error);
      });

    } else {
      database.execSQL("REPLACE into deliveries (deliveryid,customername, " +
      "createdby, date) VALUES(?,?,?,?)",
      [sDelivery.deliveryID,sDelivery.customerName, sDelivery.createdBy,sDelivery.deliveryDate]).then(id => {
        console.log("Update REPLACE RESULT", id);
        delivery.saveLot(sDelivery);
        deliveries.push({
          deliveryID: sDelivery.deliveryID,
          deliveryTotalWeight: sDelivery.totalWeight,
          deliveryCustomerName: sDelivery.customerName,
          deliveryCreatedBy: sDelivery.createdBy,
          deliveryDate: sDelivery.deliveryDate,
          deliveryLots: sDelivery.lots
        });
      }, error => {
        console.log("Update ERROR", error);
      });

    }


  }
  var toastSuccessAdded = Toast.makeText("Succesfully Added");
  var toastAddFailed = Toast.makeText("Failed to Add")
  var toastSuccessDeleted = Toast.makeText("Succesfully Deleted");
  var toastDeleteFailed = Toast.makeText("Failed to Delete")


  delivery.addQuality = function(qualityType) {
    database.execSQL("INSERT into qualitytypes (type) VALUES(?)",[qualityType]).then(id => {
      console.log("INSERT Success",id);
      toastSuccessAdded.show();
    }, error => {
      toastAddFailed.show();
      console.log("INSEERT failed",error);
    });
  }

  delivery.addSize = function(sizeType,sizeWeight) {
    database.execSQL("INSERT into sizetypes (type, weight) VALUES(?,?)",[sizeType,sizeWeight]).then(id => {
      console.log("INSERT Success",id);
      toastSuccessAdded.show();
    }, error => {
      toastAddFailed.show();
      console.log("INSEERT failed",error);
    });
  }

  delivery.deleteQuality = function(qualityType) {
    database.execSQL("delete from qualitytypes where type=?",[qualityType]).then(id => {
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

  delivery.loadSizes = function(listitemssize) {
    database.each("SELECT * FROM sizetypes", function(err,size){
      console.log("RESULT", JSON.stringify(size));
      listitemssize.push(size.type);
    });
  }

  delivery.loadQualities = function(listitemsquality) {
    database.each("SELECT * FROM qualitytypes", function(err,quality){
      console.log("RESULT", JSON.stringify(quality));
      listitemsquality.push(quality.type);
    });
  }


  delivery.loadDeliveries = function(deliveries) {
    database.each("SELECT * FROM deliveries",function(err,row) {
      console.log("RESULT", JSON.stringify(row));
      var new_delivery = {
        deliveryID: row.deliveryid,
        deliveryTotalWeight: 0,
        deliveryCustomerName: row.customername,
        deliveryCreatedBy: row.createdby,
        deliveryDate: row.date
      };
      new_delivery.deliveryLots = new ObservableArray();
      database.each("SELECT * FROM lots where deliveryid=?",[row.deliveryid],function(err,lot) {
        console.log("RESULT", JSON.stringify(lot));

        var new_lot = {
          lotID: lot.lotid,
          lotTotalWeight: 0,
          lotQuality: lot.quality,
          lotSize: lot.size,
          lotNumItems: 0
        };
        new_lot.items = new ObservableArray();
        console.log("lotid",lot.lotid);
        database.each("SELECT * FROM items where deliveryid=? AND lotid=?",[lot.deliveryid,lot.lotid],function(err,item){

          console.log("RESULT", JSON.stringify(item));
          var new_item = {
            itemID: item.itemid,
            weight: item.weight
          };
          new_lot.lotTotalWeight += new_item.weight;
          new_lot.lotNumItems += 1;
          new_lot.items.push(new_item);

        });
        new_delivery.deliveryTotalWeight += new_lot.lotTotalWeight;
        new_delivery.deliveryLots.push(new_lot);
      });

      deliveries.push(new_delivery);
    });



  }

  return delivery;
}


exports.createViewModel = createViewModel;
