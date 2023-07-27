const descriptions = [
    {
        selector: '#scene-1',
        h4: 'Cardiovascular disease in various age groups',
        p: 'Age is an important factor in cardiovascular health. Based on the dataset, the risk of heart disease seems to be higher in higher age groups.',
    },
    {
        selector: '#scene-2',
        h4: 'Effects of exercise',
        p: 'Exercise plays an important role in general health. People who did not engage in any form of physical activity in the last month seem to have poorer health according to the dataset.',
    },
    {
        selector: '#scene-3',
        h4: 'Effects of obesity on health',
        p: 'Some diseases seem to be prevalent among people in higher weight groups. For ex: select "Diabetes" filter to show only that data in the pie chart and then different weight groups by selecting their corresponding bar to see an upward trend in the number of people with diabetes in higher weight groups.',
    },
];

export function showDescriptions() {
    descriptions.forEach(d => {
        document.querySelector(d.selector).querySelector('h4').innerHTML = d.h4;
        document.querySelector(d.selector).querySelector('p').innerHTML = d.p;
    });
}
