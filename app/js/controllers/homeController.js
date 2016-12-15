app.controller('homeController', ['$rootScope', '$scope', '$http', '$state', '$stateParams', '$window', function($rootScope, $scope, $http, $state, $stateParams, $window) {


var temp = $window.localStorage.getItem('userDetails');

 $scope.userDetails=JSON.parse(temp);




  //EOF
}]);