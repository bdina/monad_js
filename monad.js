const doMonad = function ( monad ) {
    const args = arguments, scope = {}
    function iterator (i) {
        if ( args.length === i + 1 ) {
            return monad.unit(args[i](scope))
        }
        const varName = args[i]
        const fn = args[i + 1]
        const value = fn(scope)
        return monad.bind(value, function (value) {
            scope[varName] = value
            return iterator(i + 2)
        })
    }
    return iterator(1)
}

const identityMonad = {
    bind: function ( value, fn ) {
        return fn(value)
    },
    unit: function ( value ) {
        return value
    }
}

const maybeMonad = {
    bind: function ( value, fn ) {
        if ( value === null )
            return null
        else
            return fn ( value )
    },
    unit: function ( value ) {
        return value
    }
}

const arrayMonad = {
    bind: function ( value, fn ) {
        var accum = []
        value.forEach ( function ( elem ) {
            accum = accum.concat( fn ( elem ) )
        } )
        return accum
    },
    unit: function ( value ) {
        return [value]
    }
}

const stateMonad = {
    bind: function ( value, fn ) {
        return function ( state ) {
            const compute = value(state)
            const v = compute[0]
            const newState = compute[1]
            return fn ( v ) ( newState )
        }
    },
    unit: function ( value ) {
        return function ( state ) {
            return [value, state]
        }
    }
}

const identity_result = doMonad ( identityMonad,
    "a", function () {
        return 2
    },
    "b", function ( scope ) {
        with ( scope ) {
            return a * 3
        }
    },
    function ( scope ) {
        with ( scope ) {
            return a + b
        }
    }
)

const maybe_result = doMonad ( maybeMonad,
    "a", function () {
        return 3
    },
    "b", function () {
        return 2
    },
    function ( scope ) {
        with ( scope ) {
            return a + b
        }
    }
)

const array_result = doMonad ( arrayMonad,
    "a", function () {
        return [1, 2]
    },
    "b", function () {
        return [3, 4]
    },
    function ( scope ) {
        with ( scope ) {
            return a + b
        }
    }
)

const push = function ( value ) {
    return function ( state ) {
        const newstate = [value]
        return [undefined, newstate.concat(state)]
    }
}

const pop = function () {
    return function ( state ) {
        const newstate = state.slice(1)
        return [state[0], newstate]
    }
}

const state_result = doMonad ( stateMonad,
    "a", function ( scope ) {
             return push(5)
         },
    "b", function ( scope ) {
             with ( scope ) {
                 return push(10)
             }
         },
    "c", function ( scope ) {
             with ( scope ) {
                 return push(20)
             }
         },
    "d", function ( scope ) {
             with ( scope ) {
                 return pop()
             }
         },
    function ( scope ) {
        with ( scope ) {
            return d
        }
    }
)

const rmf = function () {
    return function ( state ) {
        const len = state.length
        return [undefined,state.substring(1,len)]
    }
}

const rml = function () {
    return function ( state ) {
        const len = state.length - 1
        return [undefined,state.substring(0,len)]
    }
}

const remove_first_and_last = function (s) {
    const apply = doMonad ( stateMonad,
        "a", function () { return rmf() },
        "b", function () { return rml() },
        function ( scope ) { with ( scope ) { return b } }
    )
    return apply(s)[1]
}

console.log('IDENTITY:          ' + identity_result)
console.log('MAYBE:             ' + maybe_result)
console.log('ARRAY:             ' + array_result)
console.log('STATE:             ' + state_result([]))
console.log('NO FIRST AND LAST: ' + remove_first_and_last('bryan'))
