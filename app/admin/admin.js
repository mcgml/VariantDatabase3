'use strict';

angular.module('variantdatabase.admin', ['ngRoute', 'ui-notification', 'ui.bootstrap'])

    .controller('AdminCtrl', ['$rootScope', '$scope', 'Notification', '$http', '$uibModal', function ($rootScope, $scope, Notification, $http, $uibModal) {

        //new pathogenicities for authorisation
        function getNewPathogenicitiesForAuthorisation() {
            $http.get('/api/variantdatabase/variant/pathogenicity/pending/auth', {}).then(function(response) {
                $scope.pathogenicitiesForAuthorisation = response.data;
            }, function(response) {
                Notification.error(response.data);
                console.log("ERROR: " + response.data);
            })
        }

        function getNewTranscriptPreferencesForAuthorisation() {
            $http.get('/api/variantdatabase/feature/preference/pending/auth', {}).then(function(response) {
                $scope.transcriptPreferencesForAuthorisation = response.data;
            }, function(response) {
                Notification.error(response.data);
                console.log("ERROR: " + response.data);
            })
        }

        function getNewAnalysesForAuthorisation() {
            $http.get('/api/variantdatabase/dataset/qc/pending/auth', {})
                .then(function(response) {
                $scope.datasetsForAuthorisation = response.data;
            }, function(response) {
                Notification.error(response.data);
                console.log("ERROR: " + response.data);
            })
        }

        $scope.authorise = function(eventNodeId, addOrRemove){
            $http.post('/api/variantdatabase/event/auth', {
                    eventNodeId : eventNodeId,
                    email : $rootScope.user.properties.email,
                    addOrRemove : addOrRemove
                }).then(function(response) {
                    Notification('Operation successful');
                    getNewPathogenicitiesForAuthorisation();
                    getNewTranscriptPreferencesForAuthorisation();
                    getNewAnalysesForAuthorisation();
                }, function(response) {
                    Notification.error(response.data);
                    console.log("ERROR: " + response.data);
                });
        };

        $scope.openVariantAnnotationModal = function (variant) {

            $http.post('/api/variantdatabase/variant/annotation',
                {
                    'variantId' : variant.properties.variantId
                })
                .then(function(response) {
                    variant.annotation = response.data;
                }, function(response) {
                    Notification.error(response.data);
                    console.log("ERROR: " + response.data);
                });

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'templates/VariantAnnotationModal.html',
                controller: 'VariantAnnotationCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    items: function () {
                        return variant;
                    }
                }
            });
        };

        $scope.openVariantOccurrenceModal = function (variantId) {
            $http.post('/api/variantdatabase/variant/observations',
                {
                    'variantId' : variantId
                })
                .then(function(response) {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'templates/VariantOccurrenceModal.html',
                        controller: 'VariantOccurrenceCtrl',
                        windowClass: 'app-modal-window',
                        resolve: {
                            items: function () {
                                return {
                                    variantId: variantId,
                                    content: response.data
                                };
                            }
                        }
                    });
                }, function(response) {
                    Notification.error(response.data);
                    console.log("ERROR: " + response.data);
                });
        };

        $scope.setSelected = function (idSelected) {
            $scope.idSelected = idSelected;
        };

        //load widgets on page load
        getNewPathogenicitiesForAuthorisation();
        getNewTranscriptPreferencesForAuthorisation();
        getNewAnalysesForAuthorisation();

    }]);