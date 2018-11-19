var app = angular.module('myApp', ['ngRoute']);


// app.config(function ($routeProvider) {
             
//     $routeProvider.when('/', {
//         templateUrl: '/login.html',
//         controller: 'loginController'
//     }).when('/register', {
//         templateUrl: '/register.html',
//         controller: 'registerController'
//     }).when('/user_page/:firstName/:lastName/:mail_id', {
//         templateUrl: '/home.html',
//         controller: 'homeController'
//     }).otherwise({
//         redirectTo: "/404"
//     });
// });
    
// app.controller("loginController", function ($scope, $http, $location) {

//     $scope.loadRegister = function(){
//         $location.path("/register");
//     }
       
//     $scope.user={'email_id':'','password':''};
    
//     $scope.showError = false; // set Error flag
//     $scope.showSuccess = false; // set Success Flag
//     $scope.authenticate = function (){
        
//         var postPersonData = {
//             method: 'POST',
//             url: 'http://localhost:4000/login',
//             data: $scope.user 
//         };
//         console.log(`POST:${$scope.user}`);
//         $http(postPersonData).then(function mySuccess(response) {
//             console.log("Fetching user details from server is successful!!");
//             let firstName = response.data.first_name;
//             let lastName = response.data.last_name;
//             let mail_id = response.data.email_id;
//             console.log(response);
//             $scope.showError = false;
//             $scope.showSuccess = true;
//             allowNavigation = true;
//             $location.path(`/user_page/${firstName}/${lastName}/${mail_id}`);
//         },
//         function myError(response) {
//             console.log(response.data);
//             $scope.showError = true;
//             $scope.showSuccess = false;
//             //$scope.signInFailed = true;
//         })
//     }    
// });

// app.controller("registerController", function ($scope, $http, $location) {

//     $scope.user={'first_name':'','last_name':'','email_id':'','password':''};
//     $scope.showError = false; // set Error flag
//     $scope.showSuccess = false; // set Success Flag
//     $scope.errorMessage = "";
//     var postPersonData = {
//         method: 'POST',
//         url: 'http://localhost:4000/register',
//         data: $scope.user 
//     };
//     console.log($scope.user);
//     $scope.userRegister = function(){
//         console.log("Registering....")
//         $http(postPersonData).then(function mySuccess(response) {
//             console.log("User Registered!!");
//             console.log(response);
//             $scope.showError = false;
//             $scope.showSuccess = true;
//             $location.path("/");
//         },
//         function myError(response) {
//             console.log("User Registeration failed!!");
//             console.log(response.data);
//             $scope.showError = true;
//             $scope.showSuccess = false;
//             $scope.errorMessage = response.data;
//         })
//     }

//     $scope.loadLogin = function(){
//         $location.path("/");
//     }
// });

// app.controller('homeController', function($scope, $routeParams, $location) {
//     $scope.userName = `${$routeParams.firstName} ${$routeParams.lastName}`;
//     $scope.signOut = function() {
//         console.log("SignOut button is pressed. Redirecting to /" );
//         $location.path('/');
//     }
// })


app.config(function ($routeProvider) {
             
    $routeProvider.when('/', {
        templateUrl: '/login.html',
        controller: 'loginController'
    }).when('/register', {
        templateUrl: '/register.html',
        controller: 'registerController'
    }).when('/user_page/:firstName/:lastName/:mail_id', {
        templateUrl: '/home.html',
        controller: 'homeController',
        authorize: true
    }).otherwise({
        redirectTo: "/404"
    });
});

app.run(function($rootScope, $location){
    // keys
    //$rootScope.base64Key = CryptoJS.enc.Base64.parse("2b7e151628aed2a6abf7158809cf4f3c");
    //$rootScope.iv = CryptoJS.enc.Base64.parse("3ad77bb40d7a3660a89ecaf32466ef97");
    // logging helper
    function getPath(route) {
        if (!!route && typeof(route.originalPath) === "string")
            return "'" + route.originalPath + "'";
        return "[unknown route, using otherwise]";
    }
    
    $rootScope.$on("$routeChangeStart", function(evt, to, from){
        console.log("Route change start from", getPath(from), "to", getPath(to));
        
        if (to.authorize === true)
        {
            to.resolve = to.resolve || {};
            if (!to.resolve.authorizationResolver)
            {
                to.resolve.authorizationResolver = function(authService) {
                    console.log("Resolving authorization.");
                    return authService.authorize();
                };
            }
        }
    });
    
    $rootScope.$on("$routeChangeError", function(evt, to, from, error){
        console.log("Route change ERROR from", getPath(from), "to", getPath(to), error);
        if (error instanceof AuthorizationError)
        {
            console.log("Redirecting to login");
            $location.path("/").search("returnTo", to.originalPath);
        }
    });
    
    // NOT needed in authorization / logging purposes only
    $rootScope.$on("$routeChangeSuccess", function(evt, to, from){
        console.log("Route change success from", getPath(from), "to", getPath(to));
    });
});


app.controller("loginController", function ($rootScope, $scope, $http, $location, authService) {

    $scope.loadRegister = function(){
        $location.path("/register");
    }
       
    $scope.user={'email_id':'','password':''};
    
    $scope.showError = false; // set Error flag
    $scope.showSuccess = false; // set Success Flag
    


    $scope.authenticate = function (){
        
        // var encrypted = CryptoJS.AES.encrypt(
        //     $scope.user.password,
        //     $rootScope.base64Key,
        //     { iv: $rootScope.iv }
        // );
        // console.log(encrypted);
        // $scope.ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
        // console.log('ciphertext = ' + $scope.ciphertext);

        // var cipherParams = CryptoJS.lib.CipherParams.create({
        //     ciphertext: CryptoJS.enc.Base64.parse($scope.ciphertext)
        // });
        // console.log(cipherParams);

        // var decrypted = CryptoJS.AES.decrypt(
        //     cipherParams,
        //     $rootScope.base64Key,
        //     { iv: $rootScope.iv });
        //     $scope.descrString = decrypted.toString(CryptoJS.enc.Utf8);
        // console.log('decrypted='+$scope.descrString);
        
        // console.log('ciphertext = ' + $scope.ciphertext);
        // $scope.user.password = $scope.ciphertext;

        var postPersonData = {
            method: 'POST',
            url: 'http://localhost:4000/login',
            data: $scope.user 
        };
        console.log(`POST:${$scope.user}`);
        $http(postPersonData).then(function mySuccess(response) {
            console.log("Fetching user details from server is successful!!");
            let firstName = response.data.first_name;
            let lastName = response.data.last_name;
            let mail_id = response.data.email_id;
            console.log(response);
            $scope.showError = false;
            $scope.showSuccess = true;
            authService.authenticated = true;
            $location.path(`/user_page/${firstName}/${lastName}/${mail_id}`);
        },
        function myError(response) {
            console.log(response.data);
            $scope.showError = true;
            $scope.showSuccess = false;
            //$scope.signInFailed = true;
        })
    }    
});

app.controller("registerController", function ($scope, $http, $location) {

    $scope.user={'first_name':'','last_name':'','email_id':'','password':''};
    $scope.showError = false; // set Error flag
    $scope.showSuccess = false; // set Success Flag
    $scope.errorMessage = "";
    var postPersonData = {
        method: 'POST',
        url: 'http://localhost:4000/register',
        data: $scope.user 
    };
    console.log($scope.user);
    $scope.userRegister = function(){
        console.log("Registering....")
        $http(postPersonData).then(function mySuccess(response) {
            console.log("User Registered!!");
            console.log(response);
            $scope.showError = false;
            $scope.showSuccess = true;
            $location.path("/");
        },
        function myError(response) {
            console.log("User Registeration failed!!");
            console.log(response.data);
            $scope.showError = true;
            $scope.showSuccess = false;
            $scope.errorMessage = response.data;
        })
    }

    $scope.loadLogin = function(){
        $location.path("/");
    }
});

app.controller('homeController', function($scope, $routeParams, $location, authService) {
    $scope.userName = `${$routeParams.firstName} ${$routeParams.lastName}`;
    $scope.signOut = function() {
        console.log("SignOut button is pressed. Redirecting to /" );
        authService.authenticated = false;
        $location.path('/');
    }
})


app.service("authService", function($q, $timeout){
    console.log("Instantiating auth service");
    var self = this;
    this.authenticated = false;
    this.authorize = function() {
        return this
            .getInfo()
            .then(function(info){
                console.log("Checking authentication status", info);
                if (info.authenticated === true)
                    return true;
                // anonymous
                throw new AuthorizationError();
            });
    };
    this.getInfo = function() {
        console.log("Acquiring authentication info");
        return $timeout(function(){
            console.log("Authorization info acquired");
            return self;
        }, 1000);
    };
});

// Custom error type
function AuthorizationError(description) {
    this.message = "Forbidden";
    this.description = description || "User authentication required.";
}

AuthorizationError.prototype = Object.create(Error.prototype);
AuthorizationError.prototype.constructor = AuthorizationError;