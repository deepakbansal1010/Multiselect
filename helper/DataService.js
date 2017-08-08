(function () {
    'use strict';
    angular
        .module('DemoApp')
        .service('DataService', ['$q', '$http', dataService]);

    function dataService($q, $http) {
        var self = this;
        self.promiseDataService = function (url) {

            // A small example of object
            var fetchData = {

                // Method that performs the ajax request
                ajax: function (method, url, args, config) {
                    var defer = $q.defer();
                    $http({
                        method: method,
                        url: url,
                        data: (method === 'POST' || method === 'PUT') ? args : {},
                        params: (method === 'GET' || method === 'DELETE') ? args : {},
                        headers: config ? config : ''
                    }).then(function (response) {
                        defer.resolve(response.data);
                    }, function (response) {
                        defer.reject(response);
                    });
                    return defer.promise;
                }
            };

            // Adapter pattern
            return {
                get: function (args, config) {
                    return fetchData.ajax('GET', url, args, config);
                },
                post: function (args, config) {
                    return fetchData.ajax('POST', url, args, config);
                },
                put: function (args, config) {
                    return fetchData.ajax('PUT', url, args, config);
                },
                delete: function (args, config) {
                    return fetchData.ajax('DELETE', url, args, config);
                }
            };
        };
    };
}());