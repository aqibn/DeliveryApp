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
          console.log(JSON.stringify(data));

            config.token = data.accessToken;
        });
    };

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
