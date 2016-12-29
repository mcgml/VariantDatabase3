'use strict';

angular.module('variantdatabase.login', ['ngResource', 'ngRoute', 'ui-notification'])

    .controller('LoginCtrl', ['$rootScope', '$scope', '$http', '$location', 'Notification', function($rootScope, $scope, $http, $location, Notification) {

        $scope.login = function(){
            $http.post('/login', {
                username: $scope.username,
                password: $scope.password
            }).then(function(response) {
                $rootScope.user = response.data.user;
                $location.url('/report');
                Notification('Welcome ' + $rootScope.user.properties.fullName);
            }, function(response) {
                Notification.error(response.data);
                console.log("ERROR: " + response.data);
            });
        };

    }]);