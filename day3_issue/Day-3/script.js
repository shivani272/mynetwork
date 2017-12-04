(function(){
angular.module("shoppingList",[]);
var mainList= "mainList";
angular.module("shoppingList").controller("mainList",function(){
var self = this;
self.shoppingList= [];
self.editClicked=function(){
	self.edit=true;
	
	}
self.saveClicked=function(){
	self.edit=false;
	self.save=true;
	}	
self.deleteClicked=function(item){
	self.shoppingList.splice(self.shoppingList.indexOf(item),1);
	}	
	
	
self.showForm=false;
self.addItem=function (item) {	
    var newItem=[];
    angular.copy(item,newItem)
    self.shoppingList.push(newItem);
    self.showForm=false;
    
}
})
})();
angular.module("shoppingList").directive("tableData",function(){
	return{
		scope:{
			list:"=list"
			},
		templateUrl :  "table.html"
		
			
		}
	
	});
angular.module("shoppingList").directive("form",function(){
	return{
		templateUrl :  "form.html"
		}
	
	});
