export default async function hitCounter({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let relativePath = 
        page.filename.replace(page.inputDirectory, "");
    
    let template = `<object data="/api/hit-counter${relativePath}" style="display: none;"></object>`
    
    pluginElement.insertAdjacentHTML("afterend", template);
    pluginElement.remove();
}