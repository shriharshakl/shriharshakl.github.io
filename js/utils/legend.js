export function showLegend(legends, parent) {
    const template = document.querySelector('#legend-template');

    legends.forEach(legend => {
        const clone = template.content.firstElementChild.cloneNode(true);
        clone.querySelector('span').innerHTML = legend.content;
        clone.querySelector('.circle').classList.add(legend.color);

        parent.appendChild(clone);
    });

    return parent;
}
