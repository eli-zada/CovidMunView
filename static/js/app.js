 angular.module('myApp', ['ngSanitize'])
     .controller('HomeCtrl', function($scope, $http, $q) {
         $scope.covids = [];
         $scope.covid = ['11121', '222'];
         $scope.covids111 = ['1111', '222'];
         $scope.cities = [];
         $scope.citySelected = { "code": 3000, "name": "ירושלים" };
         $scope.agas = [];
         $scope.agasFiltered = [];
         $scope.agasSelected = '';
         $scope.dataLoading = false;
         $scope.currentDate = new Date();

         $scope.getdata = function() {
             let deferred = $q.defer();
             $scope.error = '';
             $scope.dataLoading = true;
             $http.get('http://covid.moshe742.name/api/' + $scope.citySelected.code + '/')
                 .then(function(data) {
                     deferred.resolve(data);
                     $scope.covids = data.data;
                     $scope.proccessData($scope.covids, $scope);
                     $scope.filterAgas($scope.citySelected.code);
                     $scope.errorMsg = '';
                 }, function(response) {
                     // Second function handles error
                     $scope.covids = [];
                     $scope.dataLoading = false;
                     $scope.errorMsg = "Some error occurred  ***\n";
                     $scope.errorMsg += response.status;
                     $scope.errorMsg += "\n" + response.statusText;
                     console.error(response);
                     deferred.reject('Failure');
                 });

         };

         $scope.cityChanged = function(city) {
             $scope.citySelected = city;
             $scope.getdata();
         }

         $scope.agasChanged = function(agas) {
             $scope.getdata();
         }

         $scope.initEntites = function() {
             $scope.error = '';
             $scope.dataLoading = true;
             let agas_api = $http.get('http://covid.moshe742.name/api/agas_list/');
             let cities_api = $http.get('http://covid.moshe742.name/api/city_list/');
             $q.all([cities_api, agas_api]).then(data => {
                     $scope.cities = data[0].data;
                     $scope.agas = data[1].data;
                     $scope.cityChanged({ "code": 3000, "name": "ירושלים" });
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
             console.log($scope.agasFiltered);

         };

         $scope.proccessData = function(covidArr, $scope) {
             //$scope.covid = [];
             $scope.covid.length = 0;
             $scope.city = covidArr[0].city;
             $scope.date = covidArr[0].date;

             $scope.covid['all'] = {};
             $scope.covid['all'].hospitalized = 0;
             $scope.covid['all'].cases = 0;
             $scope.covid['all'].recoveries = 0;
             $scope.covid['all'].deaths = 0;
             $scope.covid['all'].tested = 0;

             covidArr.forEach(covidObj => {
                 _neibor = covidObj.agas + ' - ' + covidObj.agas_code;
                 if (!(_neibor in $scope.covid)) {
                     $scope.covid[_neibor] = {};
                     $scope.covid[_neibor].hospitalized = 0;
                     $scope.covid[_neibor].cases = 0;
                     $scope.covid[_neibor].recoveries = 0;
                     $scope.covid[_neibor].deaths = 0;
                     $scope.covid[_neibor].tested = 0;
                 }
                 if (covidObj.accumulated_hospitalized > -1) {
                     $scope.covid[_neibor].hospitalized += covidObj.accumulated_hospitalized;
                     $scope.covid['all'].hospitalized += covidObj.accumulated_hospitalized;
                 };
                 if (covidObj.accumulated_cases > -1) {
                     $scope.covid[_neibor].cases += covidObj.accumulated_cases;
                     $scope.covid['all'].cases += covidObj.accumulated_cases;
                 };
                 if (covidObj.accumulated_recoveries > -1) {
                     $scope.covid[_neibor].recoveries += covidObj.accumulated_recoveries;
                     $scope.covid['all'].recoveries += covidObj.accumulated_recoveries;
                 };
                 if (covidObj.accumulated_deaths > -1) {
                     $scope.covid[_neibor].deaths += covidObj.accumulated_deaths;
                     $scope.covid['all'].deaths += covidObj.accumulated_deaths;
                 };
                 if (covidObj.accumulated_tested > -1) {
                     $scope.covid[_neibor].tested += covidObj.accumulated_tested;
                     $scope.covid['all'].tested += covidObj.accumulated_tested;
                 };


             });

         };

         $scope.initEntites();

     });