(function() {
    'use strict';
    angular
        .module('DemoApp')
        .controller('DemoController', ['$scope', '$http', DemoController]);

    function DemoController($scope, $http) {
        var vm = this;

        vm.name = 'Deepak';
        vm.testDropdown = {
            bankPlaceHolder: 'Start typing name',
            url: '',
            list: [],
            error: false,
            autoLoad: false
        };

        $http({
            method: 'GET',
            url: 'http://jsonplaceholder.typicode.com' + '/todos',
            data: {}
        }).then(function (response) {
            console.log(response);
        }, function (response) {
            console.log(response);
        });

    }

})();




