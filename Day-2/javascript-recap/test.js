var per1= {name:"Shivani",address:"indore"};
console.log(per1);
per1.number=987654321;
console.log(per1);
var createPerson = function(name ,address)
{
    this.name=name;
    this.address=address;
}
var per2= new createPerson("Mayank","Indore");
console.log(per2);
per2.location="web bhumi";
console.log(per2);
console.log(per2.__proto__);
createPerson.prototype.test=function () {
    console.log("test");
}
var per3= new createPerson("Mayank","Indore","test1");
console.log(per3.test);
per3.test();

