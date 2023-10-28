class SortTable extends HTMLTableElement {

    static KEY_ENTER = 13;
    static KEY_SPACE = 32;

    static KEY_ARROW_UP = 38;
    static KEY_ARROW_DOWN = 40;

    static DIRECTION_OF_KEY = Object.entries({
        "default": [SortTable.KEY_ENTER, SortTable.KEY_SPACE],
        "asc": [SortTable.KEY_ARROW_UP],
        "desc": [SortTable.KEY_ARROW_DOWN],
    });

    //---Custom Element Lifecycle Hooks----------------------------------------

    constructor() {
        super();
    }

    connectedCallback() {
        this.setUp();
    }

    //---Generic utils---------------------------------------------------------

    lookup({ inTable, valueOf }) {
        let tableEntry = inTable.find(([returnValue, candidates]) => candidates.includes(valueOf))
        if (tableEntry) {
            return tableEntry[0];
        }
    }

    //---DOM utils-------------------------------------------------------------

    hasHeaderRow() {
        return this.getElementsByTagName('thead').length !== 0
    }

    getHeaderRow() {
        return super.tHead?.rows[0];
    }

    getTableBody() {
        return this.tBodies[0];
    }

    getHeaderCells() {
        let tr = this.getHeaderRow();
        return tr ? [...tr.cells] : [];
    }


    //---Setup-----------------------------------------------------------------

    setUp() {
        this.prepareHeader();
    }

    prepareHeader() {
        this.ensureHeaderRow();

        this.getHeaderCells().forEach((th, index) => {
            th.tabIndex = 0;
            this.role = "button";
            this.style.cursor = "pointer";
            this.on(th, "click", () => this.sortBy(index, "default"))

            const keydownHandler = (direction = "default") => this.sortBy(index, direction)
            this.on(th, "keydown", (e) => this.onApplicableKeyDown(e, keydownHandler));
        });
    }

    on(element, eventName, handler) {
        element.addEventListener(eventName, handler, false);
    }

    onApplicableKeyDown(event, sortBy) {
        const key = event.which;
        const ordering =
            this.lookup({ valueOf: key, inTable: SortTable.DIRECTION_OF_KEY });

        ordering && sortBy(ordering);
    }

    ensureHeaderRow() {
        if (!this.hasHeaderRow()) {
            let headerElement = document.createElement('thead');
            let firstRow = this.rows[0];

            headerElement.appendChild(firstRow);
            this.insertBefore(headerElement, this.firstChild);
        }
    }

    //---Sorting---------------------------------------------------------------

    sortBy(column, direction = "asc") {

        let tbody = this.getTableBody();
        let rows = [...tbody.rows];

        if (direction == "default") {
            let currentOrder =
                this.getHeaderCells()[column].dataset.sortAbleSortOrder;

            if (currentOrder === "asc") {
                direction = "desc";
            }

            if (currentOrder === "desc") {
                direction = "asc";
            }

            if (!currentOrder) {
                direction = "asc";
            }
        }

        let comparator =
            (a, b) => a.value.localeCompare(b.value);

        let orderedBy =
            direction === "desc"
                ? (a, b) => comparator(b, a)
                : comparator;

        let sortedRows = rows.map((row) => {
            return {
                element: row,
                value: this.getValue(row, column)
            }
        }).sort(orderedBy);

        sortedRows.forEach(bag => {
            tbody.appendChild(bag.element);
        })

        let headerCells = this.getHeaderCells();

        headerCells.forEach((cell, index) => {
            console.log({ cell, index, column })
            if (index == column) {
                cell.dataset.sortAbleSortOrder = direction;
            } else {
                delete cell.dataset.sortAbleSortOrder;
            }
        });
    }

    getValue(row, column) {
        return row.cells[column].innerText.trim();
    }

}


customElements.define("sort-able", SortTable, { extends: "table" });
