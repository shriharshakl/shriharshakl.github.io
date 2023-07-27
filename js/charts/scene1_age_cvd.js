import { DIMENSIONS, TRANSITION_DURATION, SELECTORS } from '../utils/constants.js';
import { positive, data } from '../utils/common.js';

export function showAgeCvdChart() {
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
        .scaleLinear()
        .domain(yDomain)
        .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    const svg = d3.select(SELECTORS.scene1Svg).attr('width', width).attr('height', height);

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
        .text('Age group');

    // Add the y-axis.
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${marginLeft}, 0)`).call(d3.axisLeft(y));

    // Add the y-axis label.
    svg.append('g')
        .attr('class', 'axis label')
        .attr('transform', `translate(10, ${height / 2}) rotate(-90)`)
        .append('text')
        .attr('text-anchor', 'middle')
        .text('No. of people with heart disease');

    // Add the bars.
    svg.append('g')
        .attr('transform', `translate(0, ${-marginBottom})`)
        .selectAll('.bar')
        .data(xDomain)
        .enter()
        .append('rect')
        .on('mouseover', handleMouseOver)
        .on('mouseleave', handleMouseLeave)
        .attr('class', 'bar col1')
        .attr('x', category => x(category))
        .attr('y', () => height - 10)
        .attr('width', x.bandwidth())
        .attr('height', 10)
        .transition()
        .ease(d3.easeExpOut)
        .duration(TRANSITION_DURATION)
        .delay((d, i) => i * 10)
        .attr('y', category => marginBottom + y(chartData[category].heartDiseaseCount))
        .attr('height', category => height - marginBottom - y(chartData[category].heartDiseaseCount));

    showChartAnnotations();

    /**
     * Highlights the bar and displays the tooltip.
     */
    function handleMouseOver(e, category) {
        const num = chartData[category].heartDiseaseCount;
        const perc = chartData[category].heartDiseaseCount / chartData[category].totalCount;

        d3.select(this).classed('highlight', true);
        tooltip
            .html(
                `
            <table>
                <tr>
                    <td>No. of people</td>
                    <td><strong>${num}</strong></td>
                </tr>
                <tr>
                    <td>% of people in [${category}]</td>
                    <td><strong>${(perc * 100).toFixed(2)}%</strong></td>
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

    return svg;
}

/**
 * Returns data grouped by Age group and sorted
 */
function makeChartData() {
    const chartData = {};
    let maxHeartDiseaseCount = 0;
    data.forEach(d => {
        if (!(d.Age_Category in chartData)) {
            chartData[d.Age_Category] = {
                heartDiseaseCount: 0,
                totalCount: 0,
            };
        }

        chartData[d.Age_Category].heartDiseaseCount += positive(d, 'Heart_Disease');
        chartData[d.Age_Category].totalCount += 1;
        maxHeartDiseaseCount = Math.max(maxHeartDiseaseCount, chartData[d.Age_Category].heartDiseaseCount);
    });

    return {
        chartData,
        yDomain: [0, maxHeartDiseaseCount],
        xDomain: Object.keys(chartData).sort((a, b) => parseInt(a.substring(0, 2)) - parseInt(b.substring(0, 2))),
    };
}

function showChartAnnotations() {
    const annotations = [
        {
            note: {
                wrap: 250,
                label: 'Increasing risk of heart disease in higher age groups',
            },
            dy: -20,
            dx: -60,
            y: 208,
            x: 458,
            color: 'inherit',
            subject: { radius: 2 },
            connector: { end: 'arrow' },
        },
    ];

    const makeAnnotations = d3.annotation().notePadding(15).type(d3.annotationCalloutCircle).annotations(annotations);

    d3.select(SELECTORS.scene1Svg)
        .append('g')
        .attr('class', 'annotation-group')
        .call(makeAnnotations)
        .append('path')
        .attr('stroke', 'inherit')
        .attr('stroke-width', '2px')
        .attr('d', 'M320 400 L600 10');
}
