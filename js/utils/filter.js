export function showDiseaseFilter(parent) {
    const template = document.querySelector('#disease-filter-template');
    const filter = template.content.firstElementChild.cloneNode(true);
    parent.appendChild(filter);

    return parent;
}
