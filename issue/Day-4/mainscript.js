
   angular.module("shoppingList",[]);
   angular.module("shoppingList").controller("mainList",function(){
var self = this;
self.shoppingList= [];
self.completedList=[];
self.completeListAdd =function (item) {
    self.completedList.push(item);
    console.log(self.completedList)
}
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
    var newItem={};
    console.log(item);
    console.log(newItem);
    angular.copy(item,newItem)
    self.shoppingList.push(newItem);
    console.log(self.shoppingList);
    self.showForm=false;
}
});
angular.module("shoppingList").directive("entryForm",function () {
    return{
        templateUrl:"form.html",
        restrict:'ECAM',
        replace: true,
    }
})
    angular.module("shoppingList").directive("tableData",function()
    {
     return {
         templateUrl:"table.html",
         scope:{ 
             list: "=",
             addnew:"&"
         }
    };
    })

