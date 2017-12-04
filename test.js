var someObject = {
    myProperty : 'Foo',
    myMethod : function(prefix, postfix) {
    console.log(prefix + this.myProperty + postfix+test);
    }
    };
    someObject.myMethod('**', '**'); // alerts '<Foo>'
    var someOtherObject  = {
    myProperty : 'Bar'
    };
    someObject.myMethod.call(someOtherObject, '@@@', '###'); // alerts '<Bar>'
    someObject.myMethod.apply(someOtherObject, ['<', '>']); // alerts '<Bar>'
    var tt= {
        myProperty:"amey"
    }
    someObject.myMethod.call(tt,'---','---');