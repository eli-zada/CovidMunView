 angular.module('myApp', ['ngSanitize', 'ui.select', 'n3-line-chart'])
     .controller('HomeCtrl', function($scope, $q, covidgraph, RestService, storageService) {
         $scope.covids = [];
         $scope.covid = [];
         $scope.cities = [];
         $scope.model = {};
         $scope.date = {};
         $scope.model.citySelected = { "code": 3000, "name": "ירושלים" };
         $scope.model.agasSelected = { "districts": "מרכז העיר", "agas_code": 842 };
         $scope.agas = [];
         $scope.agasFiltered = [];
         $scope.dataLoading = false;
         $scope.graphData = {};
         $scope.hideGraph = true;
         $scope.graphDaysBack = 45;

         $scope.loadGraphData = function() {
             $scope.dataLoading = true;
             covidgraph.getdatadaysback($scope.model.citySelected.code, $scope.graphDaysBack)
                 .then(function(data) {
                     $scope.graphData = covidgraph.graphData;
                     console.log('Graph Data refershed!');
                     $scope.dataLoading = false;
                 }, function(data) {
                     alert(data);
                     $scope.dataLoading = false;
                 })
         }

         $scope.getdata = function() {
             $scope.error = '';
             $scope.dataLoading = true;
             return RestService.getData($scope.model.citySelected.code).then(
                 function successCallback(data) {
                     $scope.covids = data.data;
                     $scope.proccessData($scope.covids, $scope);
                     $scope.filterAgas($scope.model.citySelected.code);
                     //$scope.setDefaultAgas();
                     $scope.model.agasSelected = { "agas_code": "all", "districts": "כל השכונות" };
                     console.log('getdata ', $scope.model.agasSelected);
                     $scope.dataLoading = false;
                     $scope.errorMsg = '';
                 },
                 function errorCallback(response) {
                     $scope.covids = [];
                     $scope.dataLoading = false;
                     $scope.errorMsg = "Some error occurred  ***\n";
                     $scope.errorMsg += response.status;
                     $scope.errorMsg += "\n" + response.statusText;
                     console.error(response);
                 }
             );
         };

         $scope.setDefaultAgas = function() {
             for (let index = 0; index < $scope.agasFiltered.length; index++) {
                 let agas = $scope.agasFiltered[index];
                 if (agas.districts.toLowerCase() != 'unknown' &&
                     agas.districts != 'אין שם שכונה באזור סטטיסטי זה') {
                     $scope.model.agasSelected = agas;
                     $scope.saveAgasToStorage(agas);
                     break;
                 }
             }
         }

         $scope.cityChanged = function(city) {
             $scope.model.citySelected = city;
             $scope.getdata();
             $scope.loadGraphData();
             $scope.saveCityToStorage(city);
         }

         $scope.agasChanged = function(agas) {
             if (!agas) {
                 agas = { "agas_code": "all", "districts": "כל השכונות" };
             }
             $scope.model.agasSelected = agas;
             $scope.agas_name = agas.districts;
             $scope.saveAgasToStorage(agas);

             console.log('Graph ', $scope.graphData[agas.agas_code]);
             console.log('AGAS ', $scope.covid[agas.agas_code]);
         }

         $scope.initEntites = function() {
             $scope.error = '';
             $scope.dataLoading = true;
             let agas_api = RestService.getAgas();
             let cities_api = RestService.getCities();
             let _agasFromStorage = $scope.loadAgasFromStorage();
             $q.all([cities_api, agas_api]).then(data => {
                     $scope.cities = data[0].data;
                     $scope.agas = data[1].data;
                     $scope.model.citySelected = $scope.loadCityFromStorage();
                     if (!$scope.model.citySelected) {
                         $scope.model.citySelected = { "code": 3000, "name": "ירושלים" };
                     }
                     $scope.loadGraphData();
                     $scope.graphData = covidgraph.graphData;
                     $scope.getdata().then(function(data) {

                         if (!_agasFromStorage) {
                             $scope.model.agasSelected = { "districts": "מרכז העיר", "agas_code": 842 };
                         } else {
                             $scope.model.agasSelected = _agasFromStorage;
                             $scope.saveAgasToStorage(_agasFromStorage);
                         }
                         $scope.dataLoading = false;
                         console.log('init ', $scope.model.agasSelected);
                     }, function(error) {
                         console.error(error);
                         $scope.dataLoading = false;
                     });

                     console.log('init cities and agas', data);


                 })
                 .catch(function(e) {
                     $scope.dataLoading = false;
                     $scope.errorMsg = "Some error occurred  ***\n";
                     $scope.errorMsg += e;
                     console.error(e);
                 });

         };

         $scope.filterAgas = function(citycode) {
             $scope.agasFiltered = $scope.agas.filter(function(itm) {
                 if (itm.city_code == citycode)
                     return itm;
             });
         };

         $scope.checkValue = function(value) {
             return value == -1 ? "<15" : value;
         }

         $scope.proccessData = function(covidArr, $scope) {
             $scope.covid.length = 0;
             $scope.city = $scope.model.citySelected.name;
             //$scope.agas_name = covidArr["agas"][0].agas;
             $scope.date['all'] = covidArr["city"][0].date;

             $scope.covid['all'] = {
                 "hospitalized": $scope.checkValue(covidArr["city"][0].accumulated_hospitalized),
                 "cases": $scope.checkValue(covidArr["city"][0].accumulated_cases),
                 "recoveries": $scope.checkValue(covidArr["city"][0].accumulated_recoveries),
                 "deaths": $scope.checkValue(covidArr["city"][0].accumulated_deaths),
                 "tested": $scope.checkValue(covidArr["city"][0].accumulated_tested)
             };

             covidArr["agas"].forEach(covidObj => {
                 _neibor = covidObj.agas_code;
                 if (!(_neibor in $scope.covid)) {
                     $scope.covid[_neibor] = {
                         "hospitalized": 0,
                         "cases": 0,
                         "recoveries": 0,
                         "deaths": 0,
                         "tested": 0
                     };
                 }
                 $scope.date[_neibor] = covidObj.date;
                 $scope.covid[_neibor].hospitalized = $scope.checkValue(covidObj.accumulated_hospitalized);
                 $scope.covid[_neibor].cases = $scope.checkValue(covidObj.accumulated_cases);
                 $scope.covid[_neibor].recoveries = $scope.checkValue(covidObj.accumulated_recoveries);
                 $scope.covid[_neibor].deaths = $scope.checkValue(covidObj.accumulated_deaths);
                 $scope.covid[_neibor].tested = $scope.checkValue(covidObj.accumulated_tested);

             });

         };

         $scope.options = {
             series: [{
                     axis: "y",
                     dataset: "dataset",
                     key: "case01",
                     label: "סה\"כ מקרים מאומתים",
                     color: "rgb(200, 96, 69)",
                     type: ['line', 'dot', 'area']
                 },
                 {
                     axis: "y",
                     dataset: "dataset",
                     key: "recover01",
                     label: "סה\"כ מחלימים",
                     color: "rgb(126, 181, 63)",
                     type: ['line', 'dot', 'area']
                 }
             ],
             axes: {
                 x: {
                     key: "x",
                     type: 'date',
                     tickFormat: d3.time.format("%d %b")
                 },
                 y: {
                     includeZero: true,
                     min: 0
                 }
             },

             margin: {
                 top: 30
             }
         };

         $scope.unknownFilter = function(agas) {
             if (agas.districts.toLowerCase() == 'unknown') {
                 return false;
             }
             return true;
         }

         $scope.saveCityToStorage = function(city) {
             storageService.set('covid-city', JSON.stringify(city));
             console.log('saveCityToStorage ', 'covid-city: ', city);
         }

         $scope.saveAgasToStorage = function(agas) {
             storageService.set('covid-agas', JSON.stringify(agas));
             console.log('saveAgasToStorage ', 'covid-agas: ', agas);
         }

         $scope.loadCityFromStorage = function() {
             let _city = storageService.get('covid-city');
             if (_city) {
                 return JSON.parse(_city);
             }
             return null;
         }

         $scope.loadAgasFromStorage = function() {
             let _agas = storageService.get('covid-agas');
             if (_agas) {
                 return JSON.parse(_agas);
             }
             return null;
         }

         $scope.initEntites();

     })
     /**
      * AngularJS default filter with the following expression:
      * "person in people | filter: {name: $select.search, age: $select.search}"
      * performs a AND between 'name: $select.search' and 'age: $select.search'.
      * We want to perform a OR.
      */
     .filter('propsFilter', function() {
         return function(items, props) {
             var out = [];

             if (angular.isArray(items)) {
                 items.forEach(function(item) {
                     var itemMatches = false;

                     var keys = Object.keys(props);
                     for (var i = 0; i < keys.length; i++) {
                         var prop = keys[i];
                         var text = props[prop].toLowerCase();
                         if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                             itemMatches = true;
                             break;
                         }
                     }

                     if (itemMatches) {
                         out.push(item);
                     }
                 });
             } else {
                 // Let the output be the input untouched
                 out = items;
             }

             return out;
         }
     });