// Récupère l'id de commande obtenue dans la page précédente
let url = document.location.search;
let orderId = new URLSearchParams(url).get("orderid");

document.querySelector("#orderId").innerHTML = orderId;