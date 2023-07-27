import { DIMENSIONS, TRANSITION_DURATION, SELECTORS } from '../utils/constants.js';
import { data, positive } from '../utils/common.js';
import { showLegend } from '../utils/legend.js';

export function showExerciseCheckupHealthChart({ filter } = {}) {
    const legends = [
        { content: 'People who do not exercise', color: 'col2' },
        { content: 'People who exercise', color: 'col1' },
    ];
    showLegend(legends, document.querySelector(SELECTORS.scene2).querySelector('.legend'));
    const { xDomain, yDomain, chartData } = makeChartData({ filter });

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
    const svg = d3.select(SELECTORS.scene2Svg).attr('width', width).attr('height', height);

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
        .text('General health');

    // Add the y-axis.
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${marginLeft}, 0)`).call(d3.axisLeft(y));

    // Add the y-axis label.
    svg.append('g')
        .attr('class', 'axis label')
        .attr('transform', `translate(10, ${height / 2}) rotate(-90)`)
        .append('text')
        .attr('text-anchor', 'middle')
        .text('No. of people');

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
        .attr('x', health => x(health))
        .attr('y', () => height - 10)
        .attr('width', x.bandwidth())
        .attr('height', 10)
        .transition()
        .ease(d3.easeExpOut)
        .duration(TRANSITION_DURATION)
        .delay((d, i) => i * 10)
        .attr('y', health => marginBottom + y(chartData[health].exerciseCount))
        .attr('height', health => height - marginBottom - y(chartData[health].exerciseCount));

    svg.append('g')
        .attr('transform', `translate(0, ${-marginBottom})`)
        .selectAll('.bar')
        .data(xDomain)
        .enter()
        .append('rect')
        .on('mouseover', handleMouseOver)
        .on('mouseleave', handleMouseLeave)
        .attr('class', 'bar col2')
        .attr('x', health => x(health))
        .attr('y', health => marginBottom + y(chartData[health].exerciseCount))
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .transition()
        .ease(d3.easeExpOut)
        .duration(TRANSITION_DURATION)
        .delay((d, i) => i * 10 + TRANSITION_DURATION / 2)
        .attr('y', health => {
            const barHeight = height - marginBottom - y(chartData[health].noExerciseCount);

            return marginBottom + y(chartData[health].exerciseCount) - barHeight;
        })
        .attr('height', health => height - marginBottom - y(chartData[health].noExerciseCount));

    showChartAnnotations();

    /**
     * Highlights the bar and displays the tooltip.
     */
    function handleMouseOver(e, health) {
        const exPerc = chartData[health].exerciseCount / chartData[health].totalCount;
        const noExPerc = 1 - exPerc;

        d3.select(this).classed('highlight', true);
        tooltip
            .html(
                `
            <table>
                <tr>
                    <td>% of people in [${health}] health that do not exercise</td>
                    <td><strong>${(noExPerc * 100).toFixed(2)}%</strong></td>
                </tr>
                <tr>
                    <td>% of people in [${health}] health that exercise</td>
                    <td><strong>${(exPerc * 100).toFixed(2)}%</strong></td>
                </tr>
                <tr>
                    <td>Total no. of people</td>
                    <td><strong>${chartData[health].totalCount}</strong></td>
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

function makeChartData() {
    const xDomain = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const chartData = {
        Poor: {
            noExerciseCount: 0,
            exerciseCount: 0,
            totalCount: 0,
        },
        Fair: {
            noExerciseCount: 0,
            exerciseCount: 0,
            totalCount: 0,
        },
        Good: {
            noExerciseCount: 0,
            exerciseCount: 0,
            totalCount: 0,
        },
        'Very Good': {
            noExerciseCount: 0,
            exerciseCount: 0,
            totalCount: 0,
        },
        Excellent: {
            noExerciseCount: 0,
            exerciseCount: 0,
            totalCount: 0,
        },
    };
    let maxTotalCount = 0;
    data.forEach(d => {
        if (positive(d, 'Exercise')) {
            chartData[d.General_Health].exerciseCount += 1;
        } else {
            chartData[d.General_Health].noExerciseCount += 1;
        }

        chartData[d.General_Health].totalCount += 1;
        maxTotalCount = Math.max(maxTotalCount, chartData[d.General_Health].totalCount);
    });

    return {
        chartData,
        xDomain,
        yDomain: [0, maxTotalCount],
    };
}

function showChartAnnotations() {
    const annotations = [
        {
            note: {
                wrap: 250,
                label: 'Poorer health in people that do not exercise',
            },
            dy: -20,
            dx: -60,
            y: 75,
            x: 430,
            color: 'inherit',
            subject: { radius: 2 },
            connector: { end: 'arrow' },
        },
        {
            dy: -290,
            dx: -60,
            y: 345,
            x: 270,
            color: 'inherit',
            subject: { radius: 2 },
            connector: { end: 'arrow' },
        },
        {
            dy: -400,
            dx: 50,
            y: 455,
            x: 110,
            color: 'inherit',
            subject: { radius: 2 },
            connector: { end: 'arrow' },
        },
    ];

    const makeAnnotations = d3.annotation().notePadding(15).type(d3.annotationCalloutCircle).annotations(annotations);

    d3.select(SELECTORS.scene2Svg).append('g').attr('class', 'annotation-group').call(makeAnnotations);
}
