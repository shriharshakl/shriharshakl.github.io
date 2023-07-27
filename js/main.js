import { showDescriptions } from './utils/description.js';

import { showAgeCvdChart } from './charts/scene1_age_cvd.js';
import { showExerciseCheckupHealthChart } from './charts/scene2_exercise_health.js';
import { showWeightCvdChart } from './charts/scene3_weight_cvd.js';
import { showDiseasesChart } from './charts/scene3_diseases.js';
import { SELECTORS } from './utils/constants.js';

/* Display the title and description of all charts */
showDescriptions();

/* Age vs Cvd chart */
showAgeCvdChart();
/* ************************************************************ */

/* Age vs Cvd with exercise chart */
showExerciseCheckupHealthChart();
/* ************************************************************ */

/* Weight, diseases chart */
let selectedWeight = null;
let diseasesFilter = ['Diabetes'];
showWeightCvdChart({ onBarSelect: handleBarSelect, onUnselect: handleUnselect });
showDiseasesChart({ filter: diseasesFilter });
document
    .querySelector(SELECTORS.scene3_1Filter)
    .querySelectorAll('input')
    .forEach(input => {
        input.addEventListener('change', e => {
            if (e.target.checked) {
                diseasesFilter = [...new Set(diseasesFilter).add(e.target.name)];
            } else {
                diseasesFilter = diseasesFilter.filter(df => df !== e.target.name);
            }

            showDiseasesChart({ weight: selectedWeight, filter: diseasesFilter });
        });
    });

/**
 * Refreshes the pie chart based on bar selection
 */
function handleBarSelect(e, weight) {
    selectedWeight = weight;
    document.querySelector(SELECTORS.scene3_1Svg).innerHTML = '';
    showDiseasesChart({ weight: selectedWeight, filter: diseasesFilter });
}

/**
 * Unselects all bars when SVG area is clicked. Refreshes the pie chart
 */
function handleUnselect() {
    selectedWeight = null;
    document.querySelector(SELECTORS.scene3_1Svg).innerHTML = '';
    showDiseasesChart({ filter: diseasesFilter });
}

/* ************************************************************ */
