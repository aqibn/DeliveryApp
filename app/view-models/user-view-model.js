var config = require("./config");
var fetchModule = require("fetch");
var Observable = require("data/observable").Observable;
var validator = require("email-validator");

function User(info) {
    info = info || {};

    // You can add properties to observables on creation
    var viewModel = new Observable({
        email: info.email || "",
        password: info.password || ""
    });

    viewModel.login = function() {
        return fetchModule.fetch(config.apiUrl + "account/login", {
            method: "POST",
            body: JSON.stringify({

                loginType: viewModel.get("email"),
                password: viewModel.get("password")
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(handleErrors)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
        //   console.log(JSON.stringify(data));
            viewModel.userData = data;
            config.token = data.accessToken;
            return data;
        });
    };

    viewModel.logout = function(user) {
        return fetchModule.fetch(config.apiUrl + "account/logout", {
            method: "PUT",
            headers: {
                "authorization": "Bearer "+global.user.userData.accessToken
            }
        })
        .then(handleErrors)
        .then(function(response) {
        viewModel.userData == null;
        console.log("success");
        });
    };

    viewModel.changePassword = function(oldPassword, newPassword) {
      return fetchModule.fetch(config.apiUrl + "account/changePassword", {
          method: "PUT",
          body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword,
          newConfirmPassword: newPassword
          }),
          headers: {
              "authorization": "Bearer "+viewModel.userData.accessToken,
              "Content-Type": "application/json"

          }
      })
      .then(handleErrors)
      .then(function(response) {
      console.log("success", response);
      });
    }


    viewModel.register = function() {
        return fetchModule.fetch(config.apiUrl + "Users", {
            method: "POST",
            body: JSON.stringify({
                Username: viewModel.get("email"),
                Email: viewModel.get("email"),
                Password: viewModel.get("password")
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(handleErrors);
    };
    viewModel.isValidEmail = function() {
    var email = this.get("email");
    return validator.validate(email);
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

module.exports = User;
