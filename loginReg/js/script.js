var app = angular.module("myModule",["ngRoute"]);

app.config(function($routeProvider){


$routeProvider.when("/",{
    templateUrl:"tempaltes/login.html",
    controller:function($scope,$location,saveData){
        $scope.login= function()
        {
            saveData.username=$scope.username;
            saveData.password=$scope.password;
            console.log($scope.username);
            console.log($scope.password);
            $location.url("home");
        }
    }
});
$routeProvider.when("/home",{
    templateUrl:"tempaltes/home.html",
    controller:function($scope,saveData)
    {
        $scope.password=saveData.password;
        $scope.username=saveData.username;
    }
});
$routeProvider.when("/reg",{});
$routeProvider.when("/error",{});


});
app.service("saveData",function(){
    return {};
})