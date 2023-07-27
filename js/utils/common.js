import raw from '../cvd_data.js';

export const data = d3.csvParse(raw);

export const positive = (observation, key) => (observation[key] === 'Yes' ? 1 : 0);

export const dataForHabits = ({ filters }) => {
    const filteredData = data.filter(d => (filters.some(filter => d[filter] === 'Yes') ? 1 : undefined));

    return {
        pieData: [
            {
                sex: 'Male',
                total: filteredData.length,
                value: d3.count(filteredData, d => (d['Sex'] === 'Male' ? 1 : undefined)),
            },
            {
                sex: 'Female',
                total: filteredData.length,
                value: d3.count(filteredData, d => (d['Sex'] === 'Female' ? 1 : undefined)),
            },
        ],
    };
};
