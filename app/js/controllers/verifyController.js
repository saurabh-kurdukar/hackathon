app.controller('verifyController', ['$rootScope', '$scope', '$http', '$state', '$stateParams', '$window', function($rootScope, $scope, $http, $state, $stateParams, $window) {

$scope.showDetails=false;
$scope.aadharNumber='';
$scope.verified=false;

$scope.searchByAadhar=function(){


         $scope.loadingVisible = true;
		$scope.showDetails=true;
 $http.get(baseUrl + '/widget', {
                headers: {
                   // 'access-token': $rootScope.accessToken
                }
            }).success(function(data) {
                $scope.showDetails=true;
                $scope.loadingVisible = false;
            }).error(function(data) {
			
                  $scope.loadingVisible = false;
            });

};

$scope.saveImage = function (type) {
				$scope.type = type;
				navigator.camera.getPicture(onCamSuccess, onCamFail, {
					quality : 50,
					sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
					destinationType : Camera.DestinationType.DATA_URL
				});
			};

			function onCamSuccess(imageData) {
			
					$scope.kycFormData.fingerPrint = imageData;

			};

			function onCamFail(message) {
				alert('Failed because: ' + message);
			};

         $scope.cancelForm = function () {
				
				$state.go('home');
			};

$scope.verifyUser=function(){
 if(!$scope.verified)
 {
  alert("Select verified Checkbox");
  return;
 }
  
 
 
 

};

  //EOF
}]);