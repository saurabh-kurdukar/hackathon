app.controller('navbarController', ['$rootScope', '$scope', '$http','$state', function($rootScope, $scope,$http,$state) {
	$scope.footerData = [];
  $scope.AllfooterData=[];
	$scope.AllNavbarData=[];
	$scope.navbarMenu=[];


	$rootScope.$on('$stateChangeSuccess', function() {
		$scope.state =$state;
		//for bottom footer
		//console.log("state changed");
		if($scope.AllfooterData.length==0)
		{

		$http.get('vendor/footer.json').success(function(data) {
			$scope.AllfooterData=data;

			for(var i=0;i<$scope.AllfooterData.length;i++)
			{
				if($scope.AllfooterData[i].name==$scope.state.current.name)
				{
					$scope.footerData=$scope.AllfooterData[i].footerMenu;

					break;
				}
			}
		}).error(function(data) {

		});
		}
		else{
		  for(var i=0;i<$scope.AllfooterData.length;i++)
			{
				if($scope.AllfooterData[i].name==$scope.state.current.name)
				{
					$scope.footerData=$scope.AllfooterData[i].footerMenu;

					break;
				}
			}
		}
		//for top navbar
		if($scope.AllNavbarData.length==0)
		{

		$http.get('vendor/navbar.json').success(function(data) {
			$scope.AllNavbarData=data;

			for(var i=0;i<$scope.AllNavbarData.length;i++)
			{
				if($scope.AllNavbarData[i].name==$scope.state.current.name)
				{ console.log("$scope.AllNavbarData",$scope.AllNavbarData[i]);
					$scope.navbarMenu=$scope.AllNavbarData[i].navbarMenu;
					$scope.navbarPageName=$scope.AllNavbarData[i].name;
					break;
				}
			}
		}).error(function(data) {
			console.log("navbar menu");
		});
		}
		else{
          for(var i=0;i<$scope.AllNavbarData.length;i++)
			{
				if($scope.AllNavbarData[i].state==$scope.state.current.name)
				{
						//console.log("false");		 
					$scope.navbarMenu=$scope.AllNavbarData[i].navbarMenu;
					$scope.navbarPageName=$scope.AllNavbarData[i].name;
					break;
				}
			}
		}
	});
}]);
