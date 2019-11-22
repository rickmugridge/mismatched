export function loadCustomRenderers() {
    const fileName = "./mismatchedCustomRenderers";
    return import(fileName)
        .then(() => console.log("loaded " + fileName))
        .catch(e => console.log("Rejected: " + e));
}