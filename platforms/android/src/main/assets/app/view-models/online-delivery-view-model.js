var fetchModule = require("fetch");
var Observable = require("data/observable").Observable;
var config = require("./config");



function createViewModel() {

var viewModel = new Observable();


viewModel.createQuality = function(qualityName) {
    return fetchModule.fetch(config.apiUrl + "qualities", {
          method: "POST",
          body: JSON.stringify({
              name: qualityName
          }),
          headers: {
              "Content-Type": "application/json",
              "authorization": "Bearer "+global.user.userData.accessToken
          }
      })
      .then(handleErrors)
      .then(function(response) {
          return response.json();
      })
      .then(function(data) {
        console.log(JSON.stringify(data));
        // toastSuccessAdded.show();
        return data;
      });
  };

  viewModel.getQualities = function() {
      return fetchModule.fetch(config.apiUrl + "qualities", {
            method: "GET",
            headers: {
                "authorization": "Bearer "+global.user.userData.accessToken
            }
        })
        .then(handleErrors)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
          
          return data;
        });
    };

    viewModel.createItem = function(itemName) {
        return fetchModule.fetch(config.apiUrl + "items", {
              method: "POST",
              body: JSON.stringify({
                  name: itemName
              }),
              headers: {
                  "Content-Type": "application/json",
                  "authorization": "Bearer "+global.user.userData.accessToken
              }
          })
          .then(handleErrors)
          .then(function(response) {
              return response.json();
          })
          .then(function(data) {
            console.log(JSON.stringify(data));
            return data;
          });
      };

      viewModel.getItems = function() {
          return fetchModule.fetch(config.apiUrl + "items", {
                method: "GET",
                headers: {
                    "authorization": "Bearer "+global.user.userData.accessToken
                }
            })
            .then(handleErrors)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
              console.log(JSON.stringify(data));
              return data;
            });
        };

        viewModel.createSize = function(sizeName) {
            return fetchModule.fetch(config.apiUrl + "sizes", {
                  method: "POST",
                  body: JSON.stringify({
                      name: sizeName
                  }),
                  headers: {
                      "Content-Type": "application/json",
                      "authorization": "Bearer "+global.user.userData.accessToken
                  }
              })
              .then(handleErrors)
              .then(function(response) {
                  return response.json();
              })
              .then(function(data) {
                console.log(JSON.stringify(data));
                return data;
              });
          };

          viewModel.getSizes = function() {
              return fetchModule.fetch(config.apiUrl + "sizes", {
                    method: "GET",
                    headers: {
                        "authorization": "Bearer "+global.user.userData.accessToken
                    }
                })
                .then(handleErrors)
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                //   console.log(JSON.stringify(data));
                  return data;
                });
            };
            
            
            
           viewModel.getCustomers = function() {
              return fetchModule.fetch(config.apiUrl + "customers", {
                    method: "GET",
                    headers: {
                        "authorization": "Bearer "+global.user.userData.accessToken
                    }
                })
                .then(handleErrors)
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                 console.log(JSON.stringify(data));
                  return data;
                });
            }; 
            
          return viewModel;
}

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

module.exports = createViewModel;
