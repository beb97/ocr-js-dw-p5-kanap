let panier = JSON.parse(localStorage.panier);
let urlApiProduit = "http://localhost:3000/api/products/"
let urlApiCommande = "http://localhost:3000/api/products/order"
let urlPageCommande ="confirmation.html"

let totalQty = 0;
let totalPrice = 0;
let index = 0;

creerPage();

function creerPage() {
    creerCanaps();
    creerFormulaire();
}

/*************
 P A N I E R
 *************/

function creerCanaps() {
    for(let canap of panier) {
        canap.index = index;
        fetch(urlApiProduit+canap.id)
            .then(response => response.json())
            .then(json => {
                canap.data = json;
                totalPrice += canap.data.price * canap.qte;
                totalQty += parseInt(canap.qte);
                afficherCanap(canap);
            })
            .catch(err => console.log(err))
        index++;
    }
// TODO : trier l'ordre des canaps
}


// // On déclenche un fetch pour chaque URL
// Promise.all(panier.map( canap => fetch(apiUrl+canap.id)
//         .then(response => response.json())
//     ))
//     // Quand les fetchs sont tous résolus, on récupére le résultat
//     .then(resultat => {
//         // le resultat est un array contenant chacune des réponses JSON
//         // pour chaque réponse, on affiche la carte correspondante
//         resultat.forEach(canap => afficherCanap(canap))
//         // puis on supprime le template
//         document.querySelector("article").remove();
//     })
//     .catch(err => console.log(err));


function afficherCanap(canap) {
    // console.log(canap);
    let liste = document.querySelector("#cart__items");
    let template = document.querySelector("template");
    // attention pour accéder au contenu du template :
    // template.CONTENT.querySelector()
    let clone = template.content.querySelector("article").cloneNode(true);
    // clone.removeAttribute("style");
    clone.querySelector("h2").innerText = canap.data.name;
    clone.querySelector("img").src = canap.data.imageUrl;

    clone.querySelector("input").value = canap.qte;

    // Calcul du prix
    let price = parseInt(canap.qte) * canap.data.price;
    clone.querySelector(".color").innerText = canap.color;
    clone.querySelector(".price").innerText = formatPrice(price);
    clone.querySelector(".unitPrice").innerText = ` x ${formatPrice(canap.data.price)}`;

    // Listener qty
    clone.querySelector("input").addEventListener("change", function (e) {
        updateQty(e, canap.index)
    });

    // listener supprimer
    clone.querySelector(".deleteItem").addEventListener("click", function () {
        deleteCanap(canap.index)
    });

    liste.appendChild(clone);
    document.querySelector("#totalQuantity").innerText = totalQty;
    document.querySelector("#totalPrice").innerText = formatPrice(totalPrice);
}

function updateQty(event, i) {
    let input = event.target.closest("input");
    if (!input.checkValidity()) {
        input.reportValidity();
        return;
    }
    panier[i].qte = input.value;
    saveCartAndReload();
}

function deleteCanap(i) {
    panier.splice(i,1);
    saveCartAndReload();
}

function saveCartAndReload() {
    localStorage.panier = JSON.stringify(panier);
    window.location.reload();
}

function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR', minimumFractionDigits: 0}).format(price);
}

/*******************
F O R M U L A I R E
*******************/

function creerFormulaire() {
    document.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();
        // e.stopPropagation();

        if(isFormValid()) {
            envoyerForm();
        }
    })
}

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

function afficherPageConfirmation(orderId) {
    window.location.replace(urlPageCommande+"?orderid="+orderId);
}

/** VALIDATION DU FORMULAIRE **/

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

function isInputValid(input, regex, message) {
    if(!regex.test(input.value)) {
        // console.log("invalid", input.name);
        input.nextElementSibling.innerText = message;
        return false;
    } else {
        // console.log("valid", input.name);
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
function creerBody() {
    return {
        contact:getContact(),
        products:getProducts()
    }
}

function getContact() {
    return {
        firstName:document.querySelector("#firstName").value,
        lastName:document.querySelector("#lastName").value,
        address:document.querySelector("#address").value,
        city:document.querySelector("#city").value,
        email:document.querySelector("#email").value,
    }
}

function getProducts() {
    return panier.map(canap => canap.id);

}