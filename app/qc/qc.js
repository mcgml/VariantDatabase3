'use strict';

angular.module('variantdatabase.qc', ['ngResource', 'ngRoute', 'ui-notification', 'ui.bootstrap'])

    .controller('QcCtrl', ['$rootScope', '$scope', '$http', '$location', 'Notification', function($rootScope, $scope, $http, $location, Notification) {

        $scope.addQc = function(sampleId, worklistId, seqId, passOrFail, evidence){

            $http.post('/api/variantdatabase/dataset/qc/add',
                {
                    sampleId: sampleId,
                    worklistId:worklistId,
                    seqId:seqId,
                    email : $rootScope.user.properties.email,
                    passOrFail : passOrFail,
                    evidence : evidence
                })
                .then(function(response) {
                    getPendingQc();
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response.data);
                    console.log("ERROR: " + response.data);
                });
        };

        function getPendingQc(){
            $http.get('/api/variantdatabase/dataset/qc/pending', {})
                .then(function(response) {
                    $scope.datasets = response.data;
                }, function(response) {
                    Notification.error(response.data);
                    console.log("ERROR: " + response.data);
                });
        }

        getPendingQc();

    }]);