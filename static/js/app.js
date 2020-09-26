 angular.module('myApp', [])
     .controller('HomeCtrl', function($scope, $http, $q) {

         $scope.dataLoading = false;
         $scope.covid = {};
         $scope.getdata = function() {
             let deferred = $q.defer();
             $scope.error = '';
             $scope.dataLoading = true;
             $http.get('http://covid.moshe742.name/api/')
                 .then(function(data) {
                     deferred.resolve(data);
                     $scope.covids = data.data;
                     $scope.proccessData($scope.covids)
                 }, function(response) {
                     // Second function handles error
                     $scope.covids = null;
                     $scope.dataLoading = false;
                     $scope.errorMsg = "Some error occurred  ***\n";
                     $scope.errorMsg += response.status;
                     $scope.errorMsg += "\n" + response.statusText;
                     console.error(response);
                 });

             return deferred.promise;
         };

         $scope.proccessData = function(covidArr) {
             $scope.covid.hospitalized = 0;
             $scope.covid.cases = 0;
             $scope.covid.recoveries = 0;
             $scope.covid.deaths = 0;
             $scope.covid.tested = 0;
             $scope.city = covidArr[0].city;
             $scope.date = covidArr[0].date;

             covidArr.forEach(covidObj => {
                 if (covidObj.accumulated_hospitalized > -1) {
                     $scope.covid.hospitalized += covidObj.accumulated_hospitalized;
                 };
                 if (covidObj.accumulated_cases > -1) {
                     $scope.covid.cases += covidObj.accumulated_cases;
                 };
                 if (covidObj.accumulated_recoveries > -1) {
                     $scope.covid.recoveries += covidObj.accumulated_recoveries;
                 };
                 if (covidObj.accumulated_deaths > -1) {
                     $scope.covid.deaths += covidObj.accumulated_deaths;
                 };
                 if (covidObj.accumulated_tested > -1) {
                     $scope.covid.tested += covidObj.accumulated_tested;
                 };


             });
         };

         $scope.getdata();


     });