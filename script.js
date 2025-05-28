const INITBEANS = 4;
const MAXHOUSES = 6;
document.documentElement.style.setProperty('--n-houses', MAXHOUSES);

// beanspread animation
const FPS = 2;
const delay = () => {
    return new Promise((resolve) => {
        setTimeout(() => {resolve();}, 1000/FPS);
    });
};
let BLOCKED = false; // for blocking clicks while beanspreading

// html elements
const Afield = document.getElementById("A-field");
const Bfield = document.getElementById("B-field");
const Astore = document.getElementById("A-store");
const Bstore = document.getElementById("B-store");
const textbox = document.getElementById("message");

// classes
class House {
    constructor(houseID, beans) {
        this.ID=houseID;
        this.beans=beans;
        this.next=null;
    }
}

class HouseList {
    constructor() {
        this.first = null;
    }

    getLastHouse() {
        if (this.first) {
            let house = this.first;
            while (house.next) {
                house = house.next;
            }
            return house;
        } else {
            return;
        }
    }

    getHouseById(houseID) {
        let house = this.first;
        let i = 0;
        while (house.ID != houseID) {
            i++;
            house = house.next;
            if (i == 50) {
                textbox.textContent = `infinite loop! houseID: ${houseID}`;
                return;
            }
        }
        return house;
    }

    addHouse(houseID) {
        let newHouse = new House(houseID, INITBEANS);
        let house = this.getLastHouse();
        if (house) {
            house.next = newHouse;
        } else {
            this.first = newHouse;
        }
        const houseElement = document.createElement("div");
        houseElement.className = "house";
        houseElement.id = newHouse.ID;
        houseElement.value = newHouse.beans;
        houseElement.textContent = newHouse.beans;

        // debugline
        // houseElement.textContent = newHouse.ID;

        return houseElement;
    }

    addStore(field) {
        let newStore = new House(field.id, 0);
        let house = this.getLastHouse();
        if (house) {
            house.next = newStore;
        } else {
            this.first = newStore;
        }
        field.value = newStore.beans;
        field.textContent = newStore.beans;
    }

    async beanSpread(e) {
        if (BLOCKED) {
            return;
        }
        const clickedHouse = e.target;

        BLOCKED = true;

        let house = this.getHouseById(clickedHouse.id);
        let mrBeans = house.beans;
        textbox.textContent = mrBeans;

        // empty house
        house.beans = 0;
        clickedHouse.value = 0;
        clickedHouse.textContent = 0;

        // spread the beans
        while (mrBeans) {
            await delay();
            house = house.next;
            house.beans++;
            mrBeans--;

            const houseEl = document.getElementById(house.ID);
            houseEl.value = house.beans;
            houseEl.textContent = house.beans;
            textbox.textContent = mrBeans;
        }
        
        BLOCKED = false;
    }
}

function reset() {
    Afield.innerHTML = "";
    Bfield.innerHTML = "";
    textbox.textContent = "-";
    main();
}

// main program
function main() {
    // creates divs for houses and inserts to A and B html field elements
    //
    // houses and stores saved as looped linked list (HouseList) 
    // for easy beanspreading:
    //     Astore -> Bhouses -> Bstore -> Ahouses -> Astore
    //
    const board = new HouseList();
    board.addStore(Astore);
    for (let i=0; i < MAXHOUSES; i++) {
        const newhouse = board.addHouse(`B${i}`);
        newhouse.addEventListener("click", (e) => {
            board.beanSpread(e);
        });

        Bfield.appendChild(newhouse);
    }

    board.addStore(Bstore);
    for (let i=0; i < MAXHOUSES; i++) {
        const newhouse = board.addHouse(`A${i}`);
        newhouse.addEventListener("click", (e) => {
            board.beanSpread(e);
        });
        // A houses in reverse order so links rotate counterclockwise on board
        Afield.insertBefore(newhouse, Afield.childNodes[0]);
    }
    // linked list to linked loop
    board.getLastHouse().next = board.first;
}

main();
