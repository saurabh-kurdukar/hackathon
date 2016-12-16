app.controller('updateKYCController', ['$rootScope', '$scope', '$http', '$state', '$stateParams', '$window', function($rootScope, $scope, $http, $state, $stateParams, $window) {

toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "700",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}


function init()
  {
    $scope.showDetails=false;
	 $scope.aadharNumber='';
     $scope.kycFormData={};
	 $scope.kycFormData.fname='';
	 $scope.kycFormData.lname='';
	 $scope.kycFormData.email='';
	 $scope.kycFormData.phone='';
	 $scope.kycFormData.score='';
	 $scope.kycFormData.aadhar='';
	 $scope.kycFormData.pancard='';
	 $scope.kycFormData.fingerPrint='';
	 $scope.kycFormData.aadharFile='';
	 $scope.kycFormData.pancardFile='';
  };
  init();


$scope.searchByAadhar=function(){



         $scope.loadingVisible = true;
		$scope.showDetails=false;
  $http.get(baseUrl + '/kyc?aadharNo=' + $scope.aadharNumber, {
                headers: {
                   // 'access-token': $rootScope.accessToken
                }
            }).success(function(data) {
               $scope.kycFormData.fname= data.name.split(' ')[0];
               $scope.kycFormData.lname= data.name.split(' ')[1];
               $scope.kycFormData.email= data.email;
               $scope.kycFormData.phone= data.phoneNo;
               $scope.kycFormData.score= data.credit_score;
               $scope.kycFormData.aadhar= data.aadharNo;
               $scope.kycFormData.pancard= data.panNo;
               $scope.kycFormData.fingerPrint= data.fingerprint;
               $scope.kycFormData.aadharFile= data.aadhar_file;
               $scope.kycFormData.pancardFile= data.pan_file;
                $scope.showDetails=true;
                $scope.loadingVisible = false;
            }).error(function(data) {

                  $scope.loadingVisible = false;
            });

};





 $scope.updateKYC=function()
  {
   var fd = new FormData();
            // fd.append("name", $scope.widgetForm.name);
            // fd.append("description", $scope.widgetForm.description);

            var obj = {
              "name": $scope.kycFormData.fname + ' ' + $scope.kycFormData.lname,
              "email": $scope.kycFormData.email,
              "phoneNo": $scope.kycFormData.phone,
              "aadharNo": $scope.kycFormData.aadhar,
              "panNo": $scope.kycFormData.pancard,
              "aadhar_file": $scope.kycFormData.aadharFile,
              "pan_file": $scope.kycFormData.pancardFile,
              "fingerprint": $scope.kycFormData.fingerPrint,
              "credit_score": $scope.kycFormData.score
            };
   $http.put(baseUrl + '/kyc?aadharNo=' + $scope.aadharNumber, obj, {
                headers: {
                    'Content-Type': "application/json",
                   // 'access-token': $rootScope.accessToken
                }
            }).success(function(data) {
                console.log("Update", JSON.stringify(data));
			          toastr.success("KYC updated successfully!!!");
                $state.go("home");
            }).error(function(data) {
                toastr.warning("KYC Not Verified");
            });

  };

  $scope.cancelForm=function(){
   init();
   $state.go('home');
  };



  //EOF
}]);
