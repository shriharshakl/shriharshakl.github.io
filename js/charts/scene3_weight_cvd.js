import { data } from '../utils/common.js';
import { showDiseaseFilter } from '../utils/filter.js';
import { showLegend } from '../utils/legend.js';
import { SELECTORS, DIMENSIONS, TRANSITION_DURATION } from '../utils/constants.js';

export function showWeightCvdChart({ onBarSelect, onUnselect }) {
    const legends = [
        { content: 'People with at least one disease', color: 'col3' },
        { content: 'People with no diseases', color: 'col4' },
    ];
    showLegend(legends, document.querySelector(SELECTORS.scene3_1).querySelector('.legend'));
    showDiseaseFilter(document.querySelector(SELECTORS.scene3_1Filter));
    const { xDomain, yDomain, chartData } = makeChartData();

    // Chart dimensions and other constants.
    const { width, height, marginTop, marginBottom, marginLeft, marginRight } = DIMENSIONS;

    const tooltip = d3.select(SELECTORS.tooltip);

    // X scale.
    const x = d3
        .scaleBand()
        .paddingInner(0.25)
        .domain(xDomain)
        .range([marginLeft, width - marginRight]);

    // Y scale.
    const y = d3
        .scaleLog()
        .domain(yDomain)
        .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    const svg = d3.select(SELECTORS.scene3Svg).attr('width', width).attr('height', height).on('click', handleClickAway);

    // Add the x-axis.
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${height - marginBottom})`)
        .call(d3.axisBottom(x));

    // Add the x-axis label.
    svg.append('g')
        .attr('class', 'axis label')
        .attr('transform', `translate(${width / 2}, ${height - 5})`)
        .append('text')
        .attr('text-anchor', 'middle')
        .text('Weight in kg');

    // Add the y-axis.
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${marginLeft}, 0)`).call(d3.axisLeft(y));

    // Add the y-axis label.
    svg.append('g')
        .attr('class', 'axis label')
        .attr('transform', `translate(10, ${height / 2}) rotate(-90)`)
        .append('text')
        .attr('text-anchor', 'middle')
        .text('No. of people (Logarithmic)');

    // Add the bars.
    svg.append('g')
        .attr('transform', `translate(0, ${-marginBottom})`)
        .selectAll('.bar')
        .data(xDomain)
        .enter()
        .append('rect')
        .on('mouseover', handleMouseOver)
        .on('mouseleave', handleMouseLeave)
        .on('click', handleClick)
        .attr('class', 'bar col1')
        .attr('x', weight => x(weight))
        .attr('y', () => height - 10)
        .attr('width', x.bandwidth())
        .attr('height', 10)
        .transition()
        .ease(d3.easeExpOut)
        .duration(TRANSITION_DURATION)
        .delay((d, i) => i * 10)
        .attr('y', weight => marginBottom + y(chartData[weight].weightCount))
        .attr('height', weight => height - marginBottom - y(chartData[weight].weightCount));

    showChartAnnotations();

    /**
     * Highlights the bar and displays the tooltip.
     */
    function handleMouseOver(e, weight) {
        const perc = chartData[weight].weightCount / chartData[weight].totalCount;

        d3.select(this).classed('highlight', true);
        tooltip
            .html(
                `
            <table>
                <tr>
                    <td>% of people in [${weight}]</td>
                    <td><strong>${(perc * 100).toFixed(3)}%</strong></td>
                </tr>
                <tr>
                    <td>Total no. of people</td>
                    <td><strong>${chartData[weight].weightCount}</strong></td>
                </tr>
            </table>
            `
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

    /**
     * Selects a bar by highlighting it and passing the weight group
     * to consumer
     */
    function handleClick(e, weight) {
        e.stopPropagation();
        onBarSelect(e, weight);
        e.target.parentElement
            .querySelectorAll('.bar')
            .forEach(bar => (bar === this ? bar.classList.remove('unfocus') : bar.classList.add('unfocus')));
    }

    /**
     * Unselects all bars
     */
    function handleClickAway(e) {
        onUnselect(e);
        e.target.querySelectorAll('.bar').forEach(bar => bar.classList.remove('unfocus'));
    }

    return svg;
}

function makeChartData() {
    const chartData = {};
    let maxWeightCount = 0;
    data.forEach(d => {
        const start = Math.floor(parseFloat(d['Weight_(kg)']) / 20) * 20;
        const key = `${start}-${start + 20}`;

        if (!(key in chartData)) {
            chartData[key] = {
                weightCount: 0,
                totalCount: data.length,
            };
        }

        chartData[key].weightCount += 1;
        maxWeightCount = Math.max(maxWeightCount, chartData[key].weightCount);
    });

    return {
        chartData,
        yDomain: [0.5, maxWeightCount],
        xDomain: Object.keys(chartData).sort((a, b) => parseInt(a.split('-')) - parseInt(b.split('-'))),
    };
}

function showChartAnnotations() {
    const annotations = [
        {
            note: {
                wrap: 250,
                label: 'Select these weight groups to see the trend in pie chart. Optionally, modify pie chart filters.',
            },
            dy: -120,
            dx: -60,
            y: 200,
            x: 800,
            color: 'inherit',
            connector: { end: 'arrow' },
        },
        {
            dy: -120,
            dx: 60,
            y: 196,
            x: 500,
            color: 'inherit',
            type: d3.annotationCalloutCircle,
            subject: { radius: 2 },
            connector: { end: 'arrow' },
        },
    ];

    const makeAnnotations = d3.annotation().notePadding(15).type(d3.annotationCalloutElbow).annotations(annotations);

    d3.select(SELECTORS.scene3Svg)
        .append('g')
        .attr('class', 'annotation-group')
        .call(makeAnnotations)
        .append('path')
        .attr('stroke', 'inherit')
        .attr('stroke-width', '2px')
        .attr('d', 'M310 40 L600 280');
}
