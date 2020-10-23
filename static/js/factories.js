angular.module('myApp')
    .factory('RestService', function($http) {
        var service = {};
        var urlBase = "/api/";

        service.getData = function(cityId) {
            return $http.get(urlBase + cityId + "/");
        };

        service.getDataByDates = function(cityId, fromDate, toDate) {
            return $http.get(urlBase + cityId + '/' + fromDate + '/' + toDate + '/');
        };

        service.getAgas = function() {
            return $http.get(urlBase + "agas_list/");
        };

        service.getCities = function() {
            return $http.get(urlBase + "city_list/");
        };

        return service;
    })
    .factory('covidgraph', ['RestService', function(RestService) {
        var service = {};
        service.graphData = {};

        service.getdatadaysback = function(citySelectedcode = 3000, daysback = 10) {
            let error = '';
            let today = moment().format("YYYY-MM-DD");
            let fromDate = moment().add(-daysback, 'days').format("YYYY-MM-DD");

            return RestService.getDataByDates(citySelectedcode, fromDate, today)
                .then(function(data) {
                    service.graphData = service.proccessGraphData(data.data);
                    console.log('Factory getDataByDates loaded');
                }, function(response) {
                    // Second function handles error
                    console.error(response);
                });
        };

        service.proccessGraphData = function(covidArr) {
            let _graphData = {};
            covidArr["agas"].forEach(covidObj => {
                _neibor = covidObj.agas_code;
                if (!(_neibor in _graphData)) {
                    _graphData[_neibor] = { "dataset": [] };
                }
                _obj = {
                    "x": new Date(moment(covidObj.date, "DD/MM/YY").format("MM/DD/YY")),
                    "case01": covidObj.accumulated_cases == -1 ? 0 : covidObj.accumulated_cases,
                    "recover01": covidObj.accumulated_recoveries == -1 ? 0 : covidObj.accumulated_recoveries
                };
                _graphData[_neibor].dataset.push(_obj);

            });

            covidArr["city"].forEach(covidObj => {
                _neibor = "all";
                if (!(_neibor in _graphData)) {
                    _graphData[_neibor] = { "dataset": [] };
                }
                _obj = {
                    "x": new Date(moment(covidObj.date, "DD/MM/YY").format("MM/DD/YY")),
                    "case01": covidObj.accumulated_cases == -1 ? 0 : covidObj.accumulated_cases,
                    "recover01": covidObj.accumulated_recoveries == -1 ? 0 : covidObj.accumulated_recoveries
                };
                _graphData[_neibor].dataset.push(_obj);

            });

            return _graphData;
        };

        return service;

    }])
    .factory('storageService', ['$rootScope', function($rootScope) {

        return {
            get: function(key) {
                return localStorage.getItem(key);
            },
            set: function(key, data) {
                localStorage.setItem(key, data);
            }
        };
    }]);