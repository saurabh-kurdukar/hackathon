app.controller('sidebarController', ['$rootScope', '$scope', '$http','$state', function($rootScope, $scope,$http,$state) {

 $http.get('vendor/sidebar_menu.json').success(function(data) {
               $scope.allMenus=data;
            }).error(function(data) {
               console.log("Sidebar Failed");
            });
}]);