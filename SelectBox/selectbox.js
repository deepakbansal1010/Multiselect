(function () {
    'use strict';
    angular
        .module('DemoApp')
        .directive('selectBox', ['$document', '$sce', '$compile', 'DataService', dropdown]);

    function dropdown($document, $sce, $compile, $http, DataService) {
        function link(scope, elements, attrs, ngModelCtrl) {
            scope.apiURL = scope.apiurl;
            scope.autoLoad = scope.autoload==="false" ? false: true;
            scope.placeHolder = scope.placeholder;
            scope.hideList = true;
            scope.loadingData = false;
            scope.errorOccuered = scope.error;
            scope.searchString = '';
            scope.selectedItems = [];
            scope.memo = {};
            var pageSize = 6;
            var currentSearchTerm = '';
            var list_container = elements[0].getElementsByClassName("infinite-scroll")[0];
            var previousY = 0;
            scope.ngModel = scope.selectedItems;

            scope.showList = function () {
                if(scope.hideList){
                    scope.hideList = !scope.hideList;
                }
            }

            function onLoadBind(callback) {
               /* var len = scope.dropList.length;
                for(var i=0;i<len;i++) {
                    if(scope.dropList[i]['itemValue'] === scope.placeHolder) {
                        callback(scope.dropList[i]);
                    }
                }*/
                if(scope.autoLoad){
                    fetchData('@@EMPTY@@');  //@@EMPTY@@ = convention for empty or default string
                }
            }

            scope.handleClick = function(item){
                if(item.selected){
                    scope.unselectItem(item);
                }
                else{
                    scope.selectItem(item);
                }
            }

            scope.selectItem = function (item) {
                scope.selectedItems.push(item);
                _.find(scope.dropList, {id: item.id})['selected'] = true;
                scope.errorOccuered = false;
                scope.callback({
                    'identifier': scope.identifier,
                    'item': item.itemValue,
                    'index': scope.index,
                    'id': item.id
                });
                return false;
            }

            scope.unselectItem = function(item){
                scope.selectedItems.splice(_.findIndex(scope.selectedItems, item), 1);
                var x = _.find(scope.dropList, {id: item.id});
                if(x){
                    x['selected'] = false;
                }
            };

            scope.$watch('searchString', function(newVal, oldVal){
                if(newVal.length> 0){
                    currentSearchTerm = newVal.toLowerCase();
                    fetchData(currentSearchTerm);
                }
            });

            scope.$watch('error', function (newVal, oldVal) {
                scope.errorOccuered = newVal;
            });

            function resetList() {
                scope.hideList = true;
                scope.errorOccuered = scope.error;
            }
            function updateDroplist(data){
                var temp = _.cloneDeep(data);
                if(!scope.selectedItems.length>0){
                    scope.dropList = temp;
                }
                else{
                    _.map(scope.selectedItems, function(item){
                         var x = _.find(temp, {id: item.id})
                         if(x){
                            x['selected'] = true;
                         }
                    });
                    scope.dropList = temp;
                }
            }

            function fetchData(searchTerm){

                if(scope.memo.hasOwnProperty(searchTerm)){// Serve result from memo
                    updateDroplist(scope.memo[searchTerm].data);
                }
                else{ //serve result from API call and update memo
                    var data = {
                        searchTerm: searchTerm,
                        start: 0,
                        pageSize: pageSize
                    };
                    scope.loadingData = true;
                    DataService
                    .promiseDataService(scope.apiURL)
                    .get(data)
                    .then(function(data, error){
                        if(data.successful){
                            updateDroplist(data.payload);
                            scope.memo[searchTerm] = { data: data.payload, more: true };  //updating memo object
                            if(data.payload.length < pageSize){
                                scope.memo[searchTerm].more = false; //To avoid unnecessary api calls while scrolling
                            }
                            console.log(scope.memo);
                        }
                        scope.loadingData = false;
                    })
                    .catch(function(error){
                        scope.errorOccuered = true;
                        scope.loadingData = false;
                    });
                }
            }

            function fetchDataForScrolling(searchTerm){
                if(!scope.memo.hasOwnProperty(searchTerm)){
                    return;
                }
                if(!scope.memo[searchTerm].more){
                    return; //no more data at server so don't make an api call
                }
                var data = {
                    searchTerm: searchTerm,
                    start: scope.memo[searchTerm].data.length,
                    pageSize: pageSize
                };
                scope.loadingData = true;
                DataService
                .promiseDataService(scope.apiURL)
                .get(data)
                .then(function(data, error){
                    if(data.successful){
                        scope.memo[searchTerm].data.push.apply(scope.memo[searchTerm].data, data.payload);
                        updateDroplist(scope.memo[searchTerm].data);
                        if(data.payload.length < pageSize){
                            scope.memo[searchTerm].more = false; //To avoid unnecessary api calls while scrolling
                        }
                        console.log(scope.memo);
                    }
                    scope.loadingData = false;
                })
                .catch(function(error){
                    scope.errorOccuered = true;
                    scope.loadingData = false;
                });
            }

            list_container.addEventListener("scroll", function(event){
                var containerHeight = list_container.clientHeight;
                if((previousY-list_container.scrollTop<0) && list_container.scrollTop >= list_container.scrollHeight-containerHeight){
                    fetchDataForScrolling(currentSearchTerm);
                }
                previousY = list_container.scrollTop;
            });

            var documentClicked = function (event) {
                var childElement = elements[0].contains(event.target);
                var selfElement = elements[0] == event.target;

                var isInside = childElement || selfElement;
                if (!isInside) {
                    scope.$applyAsync(function () {
                        scope.hideList = true;
                        scope.searchString = '';
                    });
                }
            };
            $document.on('click', documentClicked);
            onLoadBind(scope.selectItem);
        }

        return {
            restrict: 'E',
            link: link,
            require: 'ngModel',
            scope: {
                placeholder: "@",
                identifier: "@",
                callback: "&",
                error: "=",
                index: "@?",
                apiurl: "@",
                autoload: "@",
                ngModel: "="
            },
             templateUrl: function (elem, attrs) {
                return attrs.templateUrl || 'SelectBox/selectbox.html';
            }
        };
    }
}());