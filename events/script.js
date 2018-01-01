(function(angular) {
  'use strict';

var app = angular.module('app', []);

app.controller('MainController', function($scope, $rootScope) {
  $scope.mainData = {
    logs: ''
  };
  
  $scope.$on('eventEmitedName', function(event, data) {
    $scope.mainData.logs = $scope.mainData.logs + '\nMainController - receive EVENT "' + event.name + '" with message = "' + data.message + '"';
  });
  
  $rootScope.$on('eventEmitedName', function(event, data) {
    $scope.mainData.logs = $scope.mainData.logs + '\n$rootScope - receive EVENT "' + event.name + '" with message = "' + data.message + '"';
  });

  $scope.$on('eventBroadcastedName', function(event, data) {
    $scope.mainData.logs = $scope.mainData.logs + '\nmainController with scope - receive EVENT "' + event.name + '" with message = "' + data.message + '"';
  });

  $rootScope.$on('eventBroadcastedName', function(event, data) {
    $scope.mainData.logs = $scope.mainData.logs + '\nmainController with rootScope - receive EVENT "' + event.name + '" with message = "' + data.message + '"';
  });
});

app.controller('ParentController', function($scope) {
  $scope.parentData = {
    message: 'messageAAA'
  };
  
  $scope.broadcastEvent = function() {
    $scope.$broadcast('eventBroadcastedName', $scope.parentData);
  };
  
  $scope.$on('eventEmitedName', function(event, data) {
    $scope.mainData.logs = $scope.mainData.logs + '\nParentController - receive EVENT "' + event.name + '" with message = "' + data.message + '"';
  });
});

app.controller('ChildController', function($scope) {
  $scope.childData = {
    message: 'messageBBB'
  };
  
  $scope.emitEvent = function() {
    $scope.$emit('eventEmitedName', $scope.childData);
  };
  
  $scope.$on('eventBroadcastedName', function(event, data) {
    $scope.mainData.logs = $scope.mainData.logs + '\nChildController - receive EVENT "' + event.name + '" with message = "' + data.message + '"';
  });
});
  
})(window.angular);