'use strict';

angular.module('variantdatabase.account', ['ngRoute', 'ui-notification'])

    .controller('AccountCtrl', ['$rootScope', '$scope', '$http', 'Notification', function ($rootScope, $scope, $http, Notification) {

        $scope.updatePassword = function(){
            $http.post('/api/variantdatabase/user/update/password',
                {
                    email : $rootScope.user.properties.email,
                    password : $scope.newPassword
                })
                .then(function(response) {
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response.data);
                    console.log("ERROR: " + response.data);
                });
            $scope.newPassword = '';
        };

    }]);