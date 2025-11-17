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

    updateHouseElement(house, handBeans) {
        const houseEl = document.getElementById(house.ID);
        houseEl.value = house.beans;
        houseEl.textContent = house.beans;
        beantext.textContent = handBeans;

        // debugline
        if (DEBUG) {
            houseEl.textContent += ` / ${house.ID}`;
        }
    }

    async beanSpread(e) {
        if (BLOCKED) { return; }
        BLOCKED = true;

        let house = this.getHouseById(e.target.id);
        let mrBeans = house.beans;

        if (mrBeans > 0) {
            // empty the house
            house.beans = 0;
            this.updateHouseElement(house, mrBeans);

            // spread the beans
            while (mrBeans) {
                await delay();
                house = house.next;
                house.beans++;
                mrBeans--;

                this.updateHouseElement(house, mrBeans);
            }

            if ( (ATURN && house.ID.startsWith("B")) || (!ATURN && house.ID.startsWith("A")) ) {
                ATURN = !ATURN;
            } else {
                const houseNumber = house.ID.slice(-1);
                if (houseNumber != 'S') {
                    if (house.beans == 1) {
                        // empty the house
                        await delay();
                        mrBeans = house.beans;
                        house.beans = 0;
                        this.updateHouseElement(house, mrBeans);

                        // check if player gets to steal beans from opposite house
                        const oppositeNum = MAXHOUSES - houseNumber - 1;
                        let oppositeHouse = null;
                        let home = null;
                        if (ATURN) {
                            oppositeHouse = this.getHouseById(`B${oppositeNum}`);
                            home = this.getHouseById("AS");
                        } else {
                            oppositeHouse = this.getHouseById(`A${oppositeNum}`);
                            home = this.getHouseById("BS");
                        }
                        if (oppositeHouse.beans > 0) {
                            // empty the opposite house
                            await delay();
                            mrBeans += oppositeHouse.beans;
                            oppositeHouse.beans = 0;
                            this.updateHouseElement(oppositeHouse, mrBeans);
                        }
                        // move beans to the store
                        await delay();
                        home.beans += mrBeans;
                        mrBeans = 0;
                        this.updateHouseElement(home, mrBeans);
                    }
                    ATURN = !ATURN;
                }
            }
        } else {
            beantext.textContent = "NO BEANS :(";
        }

        if (ATURN) {
            textbox.textContent = "MR Beans: ";
        } else {
            textbox.textContent = "MRS Beans: ";
        }
        BLOCKED = false;
    }
}

function reset() {
    if (BLOCKED) { return; }
    Afield.innerHTML = "";
    Bfield.innerHTML = "";
    beantext.textContent = "-";
    ATURN = true;
    textbox.textContent = "MR Beans: ";
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
            if (!ATURN) {
                board.beanSpread(e);
            } else {
                beantext.textContent = "NOT YOUR TURN MRS BEANS";
            }
        });

        Bfield.appendChild(newhouse);
    }

    board.addStore(Bstore);

    for (let i=0; i < MAXHOUSES; i++) {
        const newhouse = board.addHouse(`A${i}`);
        newhouse.addEventListener("click", (e) => {
            if (ATURN) {
                board.beanSpread(e);
            } else {
                beantext.textContent = "NOT YOUR TURN MR BEANS";
            }
        });
        // A houses in reverse order so links rotate counterclockwise on board
        Afield.insertBefore(newhouse, Afield.childNodes[0]);
    }
    // linked list to linked loop
    board.getLastHouse().next = board.first;
}

main();
