// UserIsNotLoggedIn dejará parasar al usuario a la pagina que solicitó solo si este NO está registrado (util para las paginas de authentication)

function userIsNotLoggedIn (req, res, next){
    if (!req.session.currentUser){
        next()
    }
    else{
        console.log("the user is already authenticated")
        res.redirect("/priv")
    }
}

// UserIsLoggedIn dejará parasar al usuario a la pagina que solicitó solo si este está registrado (util para las paginas privadas)

function userIsLoggedIn (req, res, next){

    if (req.session.currentUser){
        next()
    } 

    else {
        console.log("the user is not authenticated")
        res.render("log-in", {errorMessage: "Please, register first."})
    }
}

module.exports = {
    userIsNotLoggedIn,
    userIsLoggedIn
}