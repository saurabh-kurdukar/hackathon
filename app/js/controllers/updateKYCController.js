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





 $scope.updateKYC=function()
  {
   var fd = new FormData();
            fd.append("name", $scope.widgetForm.name);
            fd.append("description", $scope.widgetForm.description);
			
   $http.post(baseApiUrl + '/widget', fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                   // 'access-token': $rootScope.accessToken
                }
            }).success(function(data) {
               
			   toastr.success("KYC verified");
			   
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