const INITBEANS = 4;
const MAXHOUSES = 6;
const Afield = document.getElementById("A-field");
const Bfield = document.getElementById("B-field");
const Astore = document.getElementById("A-store");
const Bstore = document.getElementById("B-store")

document.documentElement.style.setProperty('--n-houses', MAXHOUSES);

class House {
    constructor(houseID) {
        this.name=houseID;
        this.value=INITBEANS;
        this.next=null;
    }
}

class Store {
    constructor(storeID) {
        this.name=storeID;
        this.value=0;
        this.next=null;
    }
}


class HouseList {
    constructor() {
        this.first=null;
    }

    getLastHouse() {
        if (this.first) {
            let house = this.first;
            while(house.next) { 
            house = house.next; 
            }
            return house;
        } else {
            return;
        }
    }

    addHouse(houseID, field) {
        let newHouse = new House(houseID);
        let house = this.getLastHouse();
        if(house) {
            house.next = newHouse;
        } else {
            this.first = newHouse;
        }
        const houseElement = document.createElement("div");
        houseElement.className="house";
        field.appendChild(houseElement);
        houseElement.textContent=`${newHouse.value}`;
    }

    addStore(storeID, field) {
        let newStore = new Store(storeID);
        let house = this.getLastHouse();
        if(house) {
            house.next = newStore;
        } else {
            this.first = newStore;
        }
        field.textContent = `${newStore.value}`;

    }

}

function initBoard() {
    const board = new HouseList();
    Afield.innerHTML = "";
    Bfield.innerHTML = "";
    board.addStore('Astore', Astore);
    for (let i=0; i < MAXHOUSES; i++) {
        board.addHouse(`B${i}`, Bfield);
    }

    board.addStore('Bstore', Bstore);
    for (let i=0; i < MAXHOUSES; i++) {
        board.addHouse(`A${i}`, Afield);
    }

    let lastHouse = board.getLastHouse();
    if (lastHouse) {
        lastHouse.next = board.first;
    }
}

initBoard();
