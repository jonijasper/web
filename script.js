// TODO:
// - when landing on empty house on homefield, get opponents
//   beans from opposite house
// - handle player turns and prevent clicking opponents houses (done?)

const DEBUG = true;
const INITBEANS = 4;
const MAXHOUSES = 6;
document.documentElement.style.setProperty('--n-houses', MAXHOUSES);
document.documentElement.style.setProperty('--aspect-ratio', MAXHOUSES+2);

let BLOCKED = false; // for blocking clicks while beanspreading
let ATURN = true; // player turn

// html elements
const Afield = document.getElementById("A-field");
const Bfield = document.getElementById("B-field");
const Astore = document.getElementById("AS");
const Bstore = document.getElementById("BS");
const textbox = document.getElementById("turn");
const beantext = document.getElementById("mrbeans");

// beanspread animation
const FPS = 2;
const delay = () => {
    return new Promise((resolve) => {
        setTimeout(() => {resolve();}, 1000/FPS);
    });
};

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
            if (i >= 50) {
                beantext.textContent = `infinite loop! houseID: ${houseID}`;
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
        if (DEBUG) {
            houseElement.textContent += ` / ${newHouse.ID}`;
        }

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

        // debugline
        if (DEBUG) {
            field.textContent += ` / ${newStore.ID}`;
        }
    }

    async beanSpread(e) {
        if (BLOCKED) { return; }
        BLOCKED = true;

        const clickedHouse = e.target;

        if (ATURN && clickedHouse.id.startsWith("B")) {
            beantext.textContent = "NOT YOUR TURN MRS BEANS";
        } else if (!ATURN && clickedHouse.id.startsWith("A")) {
            beantext.textContent = "NOT YOUR TURN MR BEANS";
        } else {
            let house = this.getHouseById(clickedHouse.id);
            let mrBeans = house.beans;

            if (mrBeans > 0) {
                beantext.textContent = mrBeans;

                // empty the house
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

                    // debugline
                    if (DEBUG) {
                        houseEl.textContent += ` / ${house.ID}`;
                    }

                    beantext.textContent = mrBeans;

                }

                ATURN = !ATURN;
                if (ATURN) {
                    textbox.textContent = "MR Beans: ";
                } else {
                    textbox.textContent = "MRS Beans: ";
                }

            } else {
                beantext.textContent = "NO BEANS :(";
            }
        }

        BLOCKED = false;
    }
}

function reset() {
    Afield.innerHTML = "";
    Bfield.innerHTML = "";
    beantext.textContent = "-";
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
