import { data } from '../utils/common.js';
import { DIMENSIONS, SELECTORS } from '../utils/constants.js';

export function showDiseasesChart({ weight, filter }) {
    const { chartData } = makeChartData({ weight, filter });

    // Chart dimensions and other constants.
    const { size, margin } = DIMENSIONS;

    const tooltip = d3.select(SELECTORS.tooltip);

    // Create the SVG container.
    const svg = d3.select(SELECTORS.scene3_1Svg).attr('width', size).attr('height', size);

    const angleGen = d3
        .pie()
        .sort((a, b) => a.disease - b.disease)
        .value(d => d.value)
        .padAngle(0.01);
    const arcGen = d3
        .arc()
        .innerRadius(size / 4 - margin)
        .outerRadius(size / 2 - margin);

    svg.append('g')
        .attr('transform', `translate(${size / 2}, ${size / 2})`)
        .selectAll('.pie')
        .data(angleGen(chartData))
        .enter()
        .append('path')
        .attr('d', arcGen)
        .attr('class', ({ data }) => (data.disease ? 'col3' : 'col4'))
        .on('mouseover', handleMouseOver)
        .on('mouseleave', handleMouseLeave);

    svg.append('g')
        .attr('transform', `translate(${size / 2}, ${size / 2})`)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text('Diseases')
        .attr('font-size', '18px')
        .attr('font-weight', '500');

    /**
     * Highlights the bar and displays the tooltip.
     */
    function handleMouseOver(e, { data: pie }) {
        d3.select(this).classed('highlight', true);
        const perc = pie.value / pie.total;

        tooltip
            .html(
                `<table>
                    <tr>
                        <td>% of people</td>
                        <td><strong>${(perc * 100).toFixed(2)}%</strong></td>
                    </tr>
                </table>`
            )
            .classed('hidden', 0)
            .style('left', e.clientX + 10 + 'px')
            .style('top', e.clientY + 'px');
    }

    /**
     * Removes the highlight style and hides the tooltip.
     */
    function handleMouseLeave() {
        d3.select(this).classed('highlight', false);
        tooltip.classed('hidden', 1);
    }

    return svg;
}

function makeChartData({ weight, filter }) {
    const filteredData = data.filter(d => {
        if (!weight) {
            return true;
        }

        const w = weight.split('-').map(parseFloat);
        const dw = parseFloat(d['Weight_(kg)']);

        return dw >= w[0] && dw < w[1];
    });
    let withDiseaseCount = 0;
    filteredData.forEach(d => {
        if (filter.some(f => d[f] === 'Yes')) {
            withDiseaseCount += 1;
        }
    });
    const withoutDiseaseCount = filteredData.length - withDiseaseCount;

    return {
        chartData: [
            { total: filteredData.length, value: withDiseaseCount, disease: true },
            { total: filteredData.length, value: withoutDiseaseCount, disease: false },
        ],
    };
}
