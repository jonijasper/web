const spandex = document.getElementById("id2");

function dostuff() {
    spandex.textContent = "pöö";
}

buttonwithid = document.getElementById("button1");
buttonwithid.addEventListener("click",undostuff);

function undostuff() {
    spandex.textContent = "";
}

