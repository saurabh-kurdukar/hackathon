app.controller('verifyController', ['$rootScope', '$scope', '$http', '$state', '$stateParams', '$window', function($rootScope, $scope, $http, $state, $stateParams, $window) {

$scope.showDetails=false;
$scope.aadharNumber='';
$scope.verified=false;

$scope.searchByAadhar=function(){
var kyc = KycDetails.deployed();

         $scope.loadingVisible = true;
		$scope.showDetails=false;
 $http.get(baseUrl + '/kyc?aadharNo=' + $scope.aadharNumber, {
                headers: {
                   // 'access-token': $rootScope.accessToken
                }
            }).success(function(data) {
                console.log(JSON.stringify(data));
                var account_number = data.account_no;
                // kyc.getKycDetails(account_number)
                //   .then(function(result) {
                //     console.log(JSON.stringify(result));
                //     console.log("Acc No", account_number);
                //   });
                $scope.aadharFile = data.aadhar_file;
                $scope.pancardFile = data.pan_file;
                $scope.fingerPrint = data.fingerprint;
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
          alert("Image Uploaded Successfully");
					$scope.uploadedFingerPrint = imageData;

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
 else {
   $scope.loadingVisible = true;
   setTimeout(function() {
     if($scope.fingerPrint === $scope.uploadedFingerPrint) {
       $scope.loadingVisible = false;
       toastr.success("KYC Verified Successfully!!!");
       $state.go("home");
     }
     else {
       $scope.loadingVisible = false;
       toastr.error("KYC Verification Failed");
     }
   }, 2000);
 }
};

  //EOF
}]);
