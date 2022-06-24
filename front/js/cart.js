let panier = JSON.parse(localStorage.panier);
let apiUrl = "http://localhost:3000/api/products/"

// let urls = [];
//
// for(let canap of panier) {
//     // On créé la liste des URLs à interroger pour chaque canap
//     urls.push(apiUrl+canap.id);
// }

let totalQty = 0;
let totalPrice = 0;
let index = 0;
for(let canap of panier) {
    canap.index = index;
    fetch(apiUrl+canap.id)
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
    clone.querySelector("p").innerText = formatPrice(price);
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