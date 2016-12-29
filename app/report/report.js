'use strict';

//todo add fields and output for SHIRE import
//todo add mutation taster
//todo splicing

angular.module('variantdatabase.report', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'ui-notification', 'nvd3' ,'ngFileSaver', 'mgo-angular-wizard'])

    .controller('ReportCtrl', ['$rootScope', '$scope', '$http', 'Notification', '$uibModal', '$window','framework', '$anchorScroll','FileSaver', 'Blob', function ($rootScope, $scope, $http, Notification, $uibModal, $window, framework, $anchorScroll, FileSaver, Blob) {
        
        $scope.selectedVariantFilter = -1;
        $scope.idSelected = null;
        $scope.itemsPerPage = 25;
        $scope.currentPage = 0;
        var savedVariantFilters = {};

        $scope.values = ["Benign Variant","Likely Benign Variant","Unclassified Variant","Likely Pathogenic Variant", "Pathogenic Variant"];

        $scope.variantPathogenicity = {
            templateUrl: 'templates/AddVariantPathogenicityPopover.html',
            add : function(variantId,classification,evidence) {

                if (classification === undefined){
                    Notification.error("Select classification");
                    return;
                }

                classification += 1; //convert 0-based to 1-based

                $http.post('/api/variantdatabase/variant/pathogenicity/add',
                    {
                        variantId: variantId,
                        email: $rootScope.user.properties.email,
                        classification: classification,
                        evidence: evidence
                    })
                    .then(function (response) {
                        Notification("Class " + classification + " successfully added");
                    }, function (response) {
                        Notification.error(response.data);
                        console.log("ERROR: " + response.data);
                    });
            }
        };

        $scope.range = function() {
            var rangeSize = 10;
            var ret = [];
            var start;

            start = $scope.currentPage;
            if ( start > $scope.pageCount-rangeSize ) {
                start = $scope.pageCount-rangeSize+1;
            }

            for (var i=start; i<start+rangeSize; i++) {
                if (i >=0)
                    ret.push(i);
            }
            return ret;
        };

        $scope.setSelected = function (idSelected) {
            $scope.idSelected = idSelected;
        };

        $scope.checkAll = function () {
            for (var element in $scope.filteredVariants.variants) {
                if ($scope.filteredVariants.variants.hasOwnProperty(element) && $scope.filteredVariants.variants[element].filter === $scope.selectedVariantFilter) {
                    $scope.filteredVariants.variants[element].variant.properties.selected = $scope.selectedAll;
                }
            }

        };

        $scope.setPage = function(n) {
            $scope.currentPage = n;
            $anchorScroll('donutChart');
        };

        $scope.prevPage = function() {
            if ($scope.currentPage > 0) {
                $scope.currentPage--;
                $anchorScroll('donutChart');
            }
        };

        $scope.prevPageDisabled = function() {
            return $scope.currentPage === 0 ? "disabled" : "";
        };

        $scope.nextPage = function() {
            if ($scope.currentPage < $scope.pageCount) {
                $scope.currentPage++;
                $anchorScroll('donutChart');
            }
        };

        $scope.nextPageDisabled = function() {
            return $scope.currentPage === $scope.pageCount ? "disabled" : "";
        };

        $scope.donutChartOptions = {
            chart: {
                type: 'pieChart',
                donut: true,
                height : 250,
                showLabels: false,
                color : function (d, i) { var key = i === undefined ? d : i; return d.color || framework.getScaledCat20(key); },
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                pie: {
                    dispatch: {
                        elementClick: function(e) {
                            $scope.selectedVariantFilter = e.index;
                            $scope.currentPage = 0;
                            $scope.pageCount = Math.ceil($scope.filteredVariants.filters[$scope.selectedVariantFilter]["y"] / $scope.itemsPerPage) - 1;
                            $scope.selectedAll = false;
                            $scope.$apply();
                        }
                    }
                }
            }
        };

        $scope.getFilteredVariants = function () {

            //reset piechart filter
            $scope.selectedVariantFilter = -1;

            $http.post('/api/variantdatabase/workflow' + $scope.selectedWorkflow.path, {
                sampleId: $scope.selectedDataset.sample.properties.sampleId,
                worklistId :$scope.selectedDataset.dataset.properties.worklistId,
                seqId :$scope.selectedDataset.dataset.properties.seqId
            }
            ).then(function(response) {
                    $scope.filteredVariants = response.data;
                    $scope.donutChartOptions.chart.title = response.data.total;
                    Notification('Operation successful');
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

        $scope.openVariantSelectionModal = function () {

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'templates/VariantSelectionModal.html',
                controller: 'VariantSelectionCtrl',
                size: 'lg',
                resolve: {
                    items: function () {
                        return $scope.analyses;
                    }
                }
            }).result.then(function(result) {
                savedVariantFilters = result;
            });

        };

        $scope.exportSelected = function (){
            var variants = [];

            angular.forEach($scope.filteredVariants.variants, function(element) {
                if (element.variant.properties.selected){
                    variants.push(element.variant.properties.variantId);
                }
            });

            //get annotations
            $http.post('/api/variantdatabase/report', {

                email : $rootScope.user.userNodeId,
                sampleId: $scope.selectedDataset.sample.properties.sampleId,
                worklistId :$scope.selectedDataset.dataset.properties.worklistId,
                seqId :$scope.selectedDataset.dataset.properties.seqId,
                variants : variants,
                workflowName : $scope.selectedWorkflow.name

            }).then(function(response) {

                var data = new Blob([response.data], { type: 'text/plain;charset=utf-8' });
                FileSaver.saveAs(data, $scope.selectedAnalysis.sampleId + '_' + $scope.selectedAnalysis.worklistId + '.tsv');

            }, function(response) {
                Notification.error(response.data);
                console.log("ERROR: " + response.data);
            });

        };

        $scope.openEnsemblVariantLink = function(variant){
            $window.open(framework.getEnsemblRangeLink() + framework.convertVariantToRange(variant), '_blank');
        };
        $scope.openUCSCVariantLink = function(variant){
            $window.open(framework.getUCSCRangeLink() + framework.convertVariantToRange(variant), '_blank');
        };
        $scope.openIGVLink = function(remoteBamPath, variant){
            $window.open(framework.getIGVLink(remoteBamPath, framework.convertVariantToRange(variant)), '_blank');
        };
        $scope.open1kgVariantLink = function(variant){
            $window.open(framework.get1kgRangeLink() + framework.convertVariantToRange(variant), '_blank');
        };
        $scope.openExACVariantLink = function(variant){
            $window.open(framework.getExACVariantLink() + framework.convertVariantToExAC(variant), '_blank');
        };
        $scope.openDbSNPIdVariantLink = function(dbSnpId){
            $window.open(framework.getDbSNPIdVariantLink() + dbSnpId, '_blank');
        };

        //populate typeaheads on pageload
        $http.get('/api/variantdatabase/dataset/qc/passed', {

        }).then(function(response) {
            $scope.datasets = response.data;
        }, function(response) {
            Notification.error(response.data);
            console.log("ERROR: " + response.data);
        });

        $http.get('/api/variantdatabase/workflow/info', {})
            .then(function (response) {
            $scope.workflows = response.data;
        }, function (response) {
            Notification.error(response.data);
            console.log("ERROR: " + response.data);
        });

    }]);