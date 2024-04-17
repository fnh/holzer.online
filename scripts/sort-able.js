class SortTable extends HTMLTableElement {

    static #KEY_ENTER = 13;
    static #KEY_SPACE = 32;

    static #KEY_ARROW_UP = 38;
    static #KEY_ARROW_DOWN = 40;

    static #DIRECTION_OF_KEY = Object.entries({
        "default": [SortTable.#KEY_ENTER, SortTable.#KEY_SPACE],
        "asc": [SortTable.#KEY_ARROW_UP],
        "desc": [SortTable.#KEY_ARROW_DOWN],
    });

    static #COMPARATOR = {
        asc: (a, b) => a.value.localeCompare(b.value),
        desc: (a, b) => this.#COMPARATOR.asc(b, a)
    }

    //---Custom Element Lifecycle Hooks----------------------------------------

    constructor() {
        super();
    }

    connectedCallback() {
        this.#setUp();
    }

    //---Generic utils---------------------------------------------------------

    #lookup({ inTable, valueOf }) {
        let tableEntry = inTable.find(([returnValue, candidates]) => candidates.includes(valueOf))
        if (tableEntry) {
            return tableEntry[0];
        }
    }

    //---DOM utils-------------------------------------------------------------

    #hasHeaderRow() {
        return this.getElementsByTagName('thead').length !== 0
    }

    #getHeaderRow() {
        return this.tHead?.rows[0];
    }

    #getTableBody() {
        return this.tBodies[0];
    }

    #getHeaderCells() {
        let tr = this.#getHeaderRow();
        return tr ? [...tr.cells] : [];
    }


    //---Setup-----------------------------------------------------------------

    #setUp() {
        this.#ensureHeaderRow();

        this.#getHeaderCells().forEach((th, index) => {
            th.tabIndex = 0;
            th.setAttribute("role", "button");
            th.style.cursor = "pointer";

            this.#on(th, "click", () => this.sortBy(index, "default"))
            const keydownHandler = (direction = "default") => this.sortBy(index, direction)
            this.#on(th, "keydown", (e) => this.#onApplicableKeyDown(e, keydownHandler));
        });
    }

    #ensureHeaderRow() {
        if (!this.#hasHeaderRow()) {
            let headerElement = document.createElement('thead');
            let firstRow = this.rows[0];

            headerElement.appendChild(firstRow);
            this.insertBefore(headerElement, this.firstChild);
        }
    }

    #on(element, eventName, handler) {
        element.addEventListener(eventName, handler, false);
    }

    #onApplicableKeyDown(event, sortBy) {
        const key = event.which;
        const ordering =
            this.#lookup({ valueOf: key, inTable: SortTable.#DIRECTION_OF_KEY });

        if (ordering) {
            event.preventDefault();
            sortBy(ordering);
        }
    }

    //---Sorting---------------------------------------------------------------

    sortBy(column, direction = "asc") {
        let orderedByDirection =
            SortTable.#COMPARATOR[this.#getSortingOrder(direction, column)];

        let tbody = this.#getTableBody();
        let rows = [...tbody.rows];

        let sortedRows = rows.map((row) => {
            return {
                element: row,
                value: this.#getValue(row, column)
            }
        }).sort(orderedByDirection);

        sortedRows.forEach(bag => {
            tbody.appendChild(bag.element);
        })

        let headerCells = this.#getHeaderCells();
        headerCells.forEach((cell, index) => {
            if (index == column) {
                cell.dataset.sortAbleSortOrder = this.#getSortingOrder(direction, column);
            } else {
                delete cell.dataset.sortAbleSortOrder;
            }
        });
    }

    #getSortingOrder(direction, column) {
        if (direction == "default") {
            let currentOrder =
                this.#getHeaderCells()[column].dataset.sortAbleSortOrder;

            if (currentOrder === "asc") {
                return "desc";
            }

            if (currentOrder === "desc") {
                return "asc";
            }

            if (!currentOrder) {
                return "asc";
            }
        }

        return direction;
    }

    #getValue(row, column) {
        return row.cells[column].innerText.trim();
    }

}

customElements.define("sort-able", SortTable, { extends: "table" });