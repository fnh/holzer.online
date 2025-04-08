function isNakedCssDay() {
    let year = new Date().getFullYear();
    let begin = new Date(`${year}-04-09 00:00 UTC+14:00`);
    let end   = new Date(`${year}-04-10 00:00 UTC-12:00`);
    let now = new Date();
    return now >= begin && now <= end;
}

function removeStyling() {
    document.querySelector("link[rel=stylesheet]").remove();
    document.querySelectorAll("style").forEach(style => style.remove());
    document.querySelectorAll("*").forEach(el => el.style.cssText = "");
}

setTimeout(() => {
    if (isNakedCssDay()) {
        removeStyling();
    } 
});