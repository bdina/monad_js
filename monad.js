const doMonad = function ( monad ) {
    const args = arguments, scope = {};
    function iterator(i) {
        if (args.length === i + 1) {
            return monad.mReturn(args[i](scope));
        }
        const varName = args[i];
        const fn = args[i + 1];
        const value = fn(scope);
        return monad.mBind(value, function (value) {
            scope[varName] = value;
            return iterator(i + 2);
        });
    }
    return iterator(1);
};

const identityMonad = {
    mBind: function ( value, fn ) {
        return fn(value)
    },
    mReturn: function ( value ) {
        return value
    }
};

const maybeMonad = {
    mBind: function ( value, fn ) {
        if (value === null)
            return null;
        else
            return fn ( value );
    },
    mReturn: function ( value ) {
        return value;
    }
};

const arrayMonad = {
    mBind: function ( value, fn ) {
        var accum = [];
        value.forEach ( function ( elem ) {
            accum = accum.concat( fn ( elem ) );
        } );
        return accum;
    },
    mReturn: function ( value ) {
        return [value];
    }
};

const identity_result = doMonad ( identityMonad,
    "a", function () {
        return 2
    },
    "b", function ( scope ) {
        with ( scope ) {
            return a * 3;
        }
    },
    function ( scope ) {
        with ( scope ) {
            return a + b;
        }
    }
);

const maybe_result = doMonad ( maybeMonad,
    "a", function () {
        return 3;
    },
    "b", function () {
        return 2;
    },
    function (scope) {
        with(scope) {
            return a + b;
        }
    }
);

const array_result = doMonad ( arrayMonad,
    "a", function () {
        return [1, 2];
    },
    "b", function () {
        return [3, 4];
    },
    function (scope) {
        with(scope) {
            return a + b;
        }
    }
);

console.log("IDENTITY: " + identity_result);
console.log("MAYBE:    " + maybe_result);
console.log("ARRAY:    " + array_result);
