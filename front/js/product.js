// Récupère l'id du canap choisi dans la page précédente
let url = document.location.search;
let canapId = new URLSearchParams(url).get("canap");

// Récupère les informations du canap depuis l'API
let apiUrl = "http://localhost:3000/api/products/"
fetch(apiUrl+canapId)
    .then( response => response.json())
    .then(json => afficherCanap(json))
    .catch(err => console.log(err))


// Met à jour la page HTML avec les informations du canap
function afficherCanap(canap) {

    // Création de l'image
    let img = document.createElement('img');
    img.src = canap.imageUrl;
    img.alt = canap.altTxt;
    document.querySelector('.item__img').appendChild(img);

    // Mise à jour de la description
    document.querySelector("h1").innerText = canap.name;
    document.querySelector("#price").innerText = canap.price;
    document.querySelector("#description").innerText = canap.description;

    // Création des options de couleur
    let select = document.querySelector("select");
    for (let color of canap.colors) {
        let option = document.createElement("option");
        option.innerText = color;
        option.value = color;
        select.appendChild(option);
    }

    // Ajout du listener sur le bouton "ajouter au panier"
    document.querySelector("button").addEventListener("click", ajouterAuPanier)
}

// Ajoute le canap choisis par l'utilisateur au panier dans le localStorage
function ajouterAuPanier() {
    // Initialisation du tableau panier
    let panier = [];

    // Si le localStorage contient déjà un panier
    let ls = localStorage.panier;
    if(ls != null) {
        // On le récupère
        panier = JSON.parse(ls);
    }

    // On a rajouté la balise <form> dans le HTML pour permettre la validation
    let form = document.querySelector("form");
    //  checkValidity retourne false
    //  si les saisies utilisateurs ne respectent pas les contraintes
    if (!form.checkValidity()) {
        // reportValidity : les problèmes de validation
        // sont signalés à l'utilisateur avec une infobulle
        form.reportValidity();
    }

    // On récupère le canap choisi par l'utilisateur
    let canap = getInformationsCanap();
    // On vérifie si le canap est déjà présent dans le panier
    let canapIndex = getCanapIndexInCart(panier, canap);

    // Si le canap est déjà présent dans le panier
    if (canapIndex > -1) {
        // On met seuleument à jour la quantité
        updateQuantity(panier, canap, canapIndex);
    } else {
        // Sinon on ajoute tout l'objet canap au panier
        panier.push(canap);
    }

    // On remet le panier à jour dans le localStorage
    localStorage.panier = JSON.stringify(panier);
}

// Créer un objet CANAP d'après les informations saisies par l'utilisateur
function getInformationsCanap() {
    let id = canapId;
    let qte = document.querySelector("#quantity").value;
    let color = document.querySelector("select").value

    return {
        "id": id,
        "color": color,
        "qte": qte
    }
}

// Target : le canap recherché
// Panier : le panier dans lequel on cherche le canap
// Retourne -1 si le canap n'est pas trouvé pas dans le panier
// Retourne l'index du canap si il est trouvé dans le panier
function getCanapIndexInCart(panier, target) {
    // L'ID et la couleur doivent correspondre
    return panier.findIndex( canap => (canap.id == target.id) && (canap.color == target.color))
}

// Additionne la quantité précédente avec la nouvelle
function updateQuantity(panier, canap, index) {
    // parseInt pour transformer les quantités du type STRING => INTEGER
    panier[index].qte = parseInt(panier[index].qte) + parseInt(canap.qte);
    // une addition de string s'appelle une concaténation
    // exemple : "1" + "3" = "13"
}


