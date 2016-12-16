app.controller('newKYCController', ['$rootScope', '$scope', '$http', '$state', '$stateParams', '$window', function ($rootScope, $scope, $http, $state, $stateParams, $window) {

			//vega widget start:File Style40

	$scope.loadingVisible=false;
			$(":file").filestyle({
				icon : false
			});
			//vega widget end:File Style40
			function init() {
				$scope.kycFormData = {};
        $scope.kycFormData.fname = 'Nikhil';
        $scope.kycFormData.lname = 'Joshi';
        $scope.kycFormData.email = 'nikhil_joshi@abc.com';
        $scope.kycFormData.phone = 022586417;
        $scope.kycFormData.score = 100;
        $scope.kycFormData.aadhar = 1562485296583259;
        $scope.kycFormData.pancard = 'HKGY548N';
				$scope.kycFormData.fingerPrint = '';
				$scope.kycFormData.aadharFile = '';
				$scope.kycFormData.pancardFile = '';
			};
			init();

			$scope.uploadFile = function (file, type) {
				if (type == 'pancard') {
					$scope.kycFormData.pancard = file.files[0];
				}
				if (type == 'aadharCard') {
					$scope.kycFormData.aadharFile = file.files[0];
				}
				if (type == 'fingerPrint') {
					$scope.kycFormData.fingerPrint = file.files[0];
				}

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
				// callPostApi(imageData);
				alert(imageData);
				if ($scope.type == 'pancard') {
					$scope.kycFormData.pancardFile = imageData;
				}
				if ($scope.type == 'aadharCard') {
					$scope.kycFormData.aadharFile = imageData;
				}
				if ($scope.type == 'fingerPrint') {
					$scope.kycFormData.fingerPrint = imageData;
				}
			};

			function onCamFail(message) {
				alert('Failed because: ' + message);
			};

			var l = 0;
			$scope.addNewKYC = function () {

				var accounts = [];
				if(!web3) {
					web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
				}
			    web3.eth.getAccounts(function(err, accs) {
			      if (err != null) {
			        alert("There was an error fetching your accounts.");
			        return;
			      }

			      if (accs.length == 0) {
			        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
			        return;
			      }
			      accounts = accs;
						console.log(JSON.stringify(accounts));
						var kyc = KycDetails.deployed();
						$scope.loadingVisible=true;
						kyc.createKycData(
							accounts[l],
							$scope.kycFormData.fname + ' ' + $scope.kycFormData.lname,
							$scope.kycFormData.email,
							$scope.kycFormData.phone,
							$scope.kycFormData.aadhar,
							$scope.kycFormData.pancard,
							$scope.kycFormData.aadharFile,
							$scope.kycFormData.pancardFile,
							$scope.kycFormData.fingerPrint,
							$scope.kycFormData.score,
							{from: accounts[l]}
						)
						.then(function(result) {
							console.log(JSON.stringify(result));
							// $scope.loadingVisible=false;
							var data = {
								"aadhar_no": $scope.kycFormData.aadhar,
								"account_no": accounts[l++]
							};
							console.log(JSON.stringify(data));
							$http.post(baseUrl + '/accounts', data, {
								headers : {
									'Content-Type' : "application/json",
									// 'access-token': $rootScope.accessToken
								}
							}).success(function (data) {
								toastr.success("KYC Created Successfully!!!");
								$scope.loadingVisible=false;
								init();
								$state.go('home');
							}).error(function (data) {

							$scope.loadingVisible=false;
							});
						})
						.catch(function(e) {
							console.log(e);
						});
			    });
				// var fd = new FormData();
				// fd.append("name", $scope.kycFormData.name);
				// fd.append("description", $scope.kycFormData.description);
				// fd.append("description", $scope.kycFormData.description);
				// fd.append("description", $scope.kycFormData.description);
				// fd.append("description", $scope.kycFormData.description);
				// fd.append("description", $scope.kycFormData.description);
				// fd.append("description", $scope.kycFormData.description);
				// fd.append("description", $scope.kycFormData.description);
				// fd.append("description", $scope.kycFormData.description);
				// fd.append("description", $scope.kycFormData.description);

			};


			$scope.cancelForm = function () {
				init();
				$state.go('home');
			};

			//EOF
		}
	]);
