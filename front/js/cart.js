let urlApiProduit = "http://localhost:3000/api/products/"
let urlApiCommande = "http://localhost:3000/api/products/order"
let urlPageCommande ="confirmation.html"
let panier = JSON.parse(localStorage.panier);

// On créé la page
creerPage();

// Créé l'ensemble des éléments de la page
function creerPage() {
    // Créé les éléments canap
    creerCanaps();
    // Créé les éléments du formulaire
    creerFormulaire();
}

/*************
 P A N I E R
 *************/

function creerCanaps() {
    let promesses = [];

    // Pour chaque canap du panier
    for(let canap of panier) {
        // On vient récupérer dans l'API les informations (name, desc, price ....) du canap
        promesses.push(getCanapInfo(canap));
    }

    // On attend la résolution de toutes les promesses
    Promise.all(promesses)
        // Quand les promesses sont résolus, on récupère un tableau de canapés enrichis
        .then(canaps => { canaps
                // On tri le tableau de canaps
                .sort(trierCanap)
                // Pour chaque canap du tableau
                .map( (canap, index)  => {
                    // On récupére l'index du canap (pour usage ultérieur dans la méthode updateQty)
                    canap.index = index;
                    // On vient l'afficher dans la page HTML
                    afficherCanap(canap);
                });
            // Pour finir on créé les totaux qte et price
            creerTotaux(canaps);
        }).catch(logError);
}

// La fonction de comparaison pour la méthode sort
// Tri d'abord sur le name puis sur la couleur
function trierCanap(a, b) {
    if(a.name > b.name) {return 1;}
    if(a.name < b.name) {return -1;}
    if(a.color > b.color) {return 1;}
    if(a.color < b.color) {return -1;}
    return 0;
}

// Calcul et affiche les totaux
function creerTotaux(canaps) {
    // On utilise la méthode array.reduce pour accumuler les valeurs
    let totalQty = canaps.reduce((total, canap) => total + parseInt(canap.qte), 0 );
    let totalPrice = canaps.reduce((total, canap) => total + parseInt(canap.qte) * canap.price, 0 );

    // Puis on affiche dans le HTML
    document.querySelector("#totalQuantity").innerText = totalQty;
    document.querySelector("#totalPrice").innerText = formatPrice(totalPrice);
}

// Récupére dans l'API les informations (name, desc, price ....) du canap
function getCanapInfo(canap) {
    return fetch(urlApiProduit+canap.id)
        .then(response => response.json())
        .then(canapInfo => {
            // Combine ensuite les informations récupérées avec les infos (qte, color)
            return {...canapInfo, ...canap}
        })
        .catch(logError)
}

function logError(err) {
    console.error(err);
}

// Manipule le DOM pour afficher les résultats
function afficherCanap(canap) {
    let liste = document.querySelector("#cart__items");
    // On utilise la balise TEMPLATE plutôt que de recréer tout l'article avec createElement()
    let template = document.querySelector("template");
    // On clone l'article qui nous sert de modèle.
    let clone = template.content.querySelector("article").cloneNode(true);
    // attention pour accéder au contenu du template : template.CONTENT.querySelector()

    // On renseigne les informations classiques
    clone.querySelector("h2").innerText = canap.name;
    clone.querySelector("img").src = canap.imageUrl;
    clone.querySelector("input").value = canap.qte;

    // [facultatif] On ajoute des data-*, pour usage ultérieur de la méthode deleteCanap()
    clone.dataset.id = canap.id;
    clone.dataset.color = canap.color;

    // Calcul et affichage du prix
    let price = parseInt(canap.qte) * canap.price;
    clone.querySelector(".color").innerText = canap.color;
    clone.querySelector(".price").innerText = formatPrice(price);
    clone.querySelector(".unitPrice").innerText = ` x ${formatPrice(canap.price)}`;

    // Listener qty : methode avec l'index panier
    clone.querySelector("input").addEventListener("change", function (e) {
        updateQty(e, canap.index)
    });

    // listener supprimer : methode avec les data-*
    clone.querySelector(".deleteItem").addEventListener("click", function (e) {
        deleteCanap(e)
    });

    // Enfin on attache notre clone a la page
    liste.appendChild(clone);
}

// Met a jour la quantité du canap dans le panier
function updateQty(event, i) {
    // On vérifie d'abord la validié de l'input
    let input = event.target.closest("input");
    if (!input.checkValidity()) {
        input.reportValidity();
        return;
    }
    // Puis si l'input est valide, on récupère la quantité
    panier[i].qte = input.value;
    // On utilise l'index du panier préalablement stocké
    saveCartAndReload();
}

// Supprime le canap dans le panier
function deleteCanap(e) {
    // Pour trouver l'index du canap dans le panier
    let data = e.target.closest("article").dataset;
    // On utilise les informations ID et COLOR stockées dans data-*
    let index = panier.findIndex( canap => (canap.id == data.id) && (canap.color == data.color));
    // Puis on supprime du panier
    panier.splice(index,1);
    saveCartAndReload();
}

// sauvegarde le panier et rafraichit la page
function saveCartAndReload() {
    localStorage.panier = JSON.stringify(panier);
    window.location.reload();
}

// formate le prix en € avec séparateur de milliers
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR', minimumFractionDigits: 0}).format(price);
}

/*******************
F O R M U L A I R E
*******************/

// Créé les contrôles sur le formulaire de commande
function creerFormulaire() {
    document.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();

        if(isFormValid()) {
            envoyerForm();
        }
    })
}

// créé une commande valide et l'envoi à l'API
function envoyerForm() {
    console.log(creerBody());
    fetch(urlApiCommande, {
        method: 'post',
        headers: {"Content-type": "application/json"},
        body: JSON.stringify(creerBody())
    })
        .then(response => response.json())
        .then(json => afficherPageConfirmation(json.orderId))
        .catch(err => console.log(err))
}

// Redirige vers la page 4 avec l'orderId en param url
function afficherPageConfirmation(orderId) {
    window.location.replace(urlPageCommande+"?orderid="+orderId);
}

/** VALIDATION DU FORMULAIRE **/

// Retourne true si les 5 champs du formulaire sont valides
// Retourne false sinon et affiche les messages d'erreurs
function isFormValid() {
    let regexNom = /^[A-Za-zÀ-ÿ]+$/;
    let regexAdresse = /^[a-zA-Z0-9\s,'-]+$/;
    let regexVille = /^[a-zA-Z]+(?:[\\s-][a-zA-Z]+)*$/;
    let regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    let firstName = document.querySelector("#firstName");
    let lastName = document.querySelector("#lastName");
    let address = document.querySelector("#address");
    let city = document.querySelector("#city");
    let email = document.querySelector("#email");

    let isFormValid = true;
    isFormValid &= isInputValid(firstName, regexNom, "prénom incorrect");
    isFormValid &= isInputValid(lastName, regexNom, "nom incorrect");
    isFormValid &= isInputValid(address, regexAdresse, "adresse incorrecte");
    isFormValid &= isInputValid(city, regexVille, "ville incorrecte");
    isFormValid &= isInputValid(email, regexEmail, "email incorrect");

   return isFormValid;
}

// Retourne true si la saisie utilisateur est conforme à la regex
// Retourne false sinon, et affiche un message sous l'input
function isInputValid(input, regex, message) {
    // Si la saisie ne correspond pas à la regex
    if(!regex.test(input.value)) {
        // On affiche le message
        input.nextElementSibling.innerText = message;
        return false;
    }
    // Sinon si la saisie est valide
    else {
        // On efface les message précedents eventuels
        input.nextElementSibling.innerText = "";
        return true;
    }
}

/** CREATION DE LA REQUETE POST **/
/*
Exemple de body :
{
    "contact": {
        "firstName":"pierre",
        "lastName":"bebon",
        "address":"3 rue moulin",
        "city":"nantes",
        "email":"monemail@email.com"
    },
    "products": ["415b7cacb65d43b2b5c1ff70f3393ad1", "107fb5b75607497b96722bda5b504926"]
}
 */

// Génére l'ensemble du body pour la requête
function creerBody() {
    return {
        contact:getContact(),
        products:getProducts()
    }
}

// Génére l'objet contact
function getContact() {
    return {
        firstName:document.querySelector("#firstName").value,
        lastName:document.querySelector("#lastName").value,
        address:document.querySelector("#address").value,
        city:document.querySelector("#city").value,
        email:document.querySelector("#email").value,
    }
}

// Génére le tableau d'ID produit
function getProducts() {
    return panier.map(canap => canap.id);
}