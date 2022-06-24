let apiUrl = "http://localhost:3000/api/products/"

fetch(apiUrl)
    .then( response => response.json() )
    .then( json => afficherCanaps(json))
    .catch( err => console.log(err))

function afficherCanaps(canaps) {
    for(let canap of canaps) {
        afficherCanap(canap);
    }
}

function afficherCanap(canap) {
    let a = document.createElement("a");
    a.href = "product.html?canap="+canap._id;
    document.querySelector("#items").appendChild(a);

    let article = document.createElement("article");
    a.appendChild(article);

    let img = document.createElement("img");
    img.src = canap.imageUrl;
    img.alt = canap.altTxt;
    article.appendChild(img);

    let h3 = document.createElement("h3");
    h3.classList.add("productName");
    h3.innerHTML = canap.name;
    article.appendChild(h3);

    let p = document.createElement("p");
    p.classList.add("productDescription");
    p.innerHTML = canap.description;
    article.appendChild(p);
}

