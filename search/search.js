let prebuiltIndex = await fetch("/search/site-index.js");

let { lunrIndex, idToTitle } = await prebuiltIndex.json();

let searchIndex = lunr.Index.load(lunrIndex);

searchField.addEventListener("input", (event) => {
    let query = event.target.value;

    if (query) {
        let result = searchIndex.search(query);
        let results = result.map(r => {
            return { href: r.ref, title: idToTitle[r.ref] }
        });
        
        searchResults.innerHTML = "";

        if (results.length == 0) {
            searchResults.innerHTML = `No results for ${query}`;
        }

        let list = document.createElement("ul");
        results.forEach((result) => {

            let link = document.createElement("a");
            let linkText = document.createTextNode(result.title || result.href);
            link.setAttribute("href", result.href);
            link.appendChild(linkText);
            let item = document.createElement("li");
            item.appendChild(link);
            list.appendChild(item);
        })
        searchResults.appendChild(list);

    }
});