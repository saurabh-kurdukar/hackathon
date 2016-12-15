app.controller('defaultController', ['$rootScope', '$scope', '$http', '$state', '$stateParams', '$window', function($rootScope, $scope, $http, $state, $stateParams, $window) {

  //vega widget start:Login Page00


  function loadLoginPage() {
    $scope.loginData = {};
    $scope.loginData.title = 'Login';
    $scope.loginData.request = {};
    $scope.loginData.login = {
      submit: function() {
        $scope.account.username = 'rohit_ranade';
        $scope.account.password = 'rohit';
	  $scope.authMsg='';
        $http.post(
          baseUrl+'/users/auth', {
            'username': $scope.account.username,
            'password': $scope.account.password
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*'
            }
          }).success(function(data, status, headers, config) {

          $window.localStorage.setItem('userDetails', JSON.stringify(data));
          // redirect user to default route
          $state.go('home');

        }).error(function(data) {
          $scope.authMsg = 'Invalid UserName or Password';
        });
      }
    };

  };
  loadLoginPage();

  //vega widget end:Login Page00

  //EOF
}]);
