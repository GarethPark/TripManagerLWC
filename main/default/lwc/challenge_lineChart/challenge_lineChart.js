import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import chartjs from '@salesforce/resourceUrl/chart';

const CHART_CONFIG = {
    dom_selector: 'canvas.visitorsLineChart',
    type: 'line',
    color: 'rgb(255, 99, 132)',
    options: {
      responsive: true,
      legend: { display: false },
      title: { display: false },
      animation: {
         animateScale: true
      }
    } 
}

export default class Challenge_lineChart extends LightningElement {

    error;
    _chart;
    _chartjsInitialized = false;
    QUERY_URL = 'https://lwcdata.herokuapp.com/jsondata';

    getExternalData(url) {
        // The Fetch API is currently not polyfilled for usage in IE11.
        // Use XMLHttpRequest if you need to support IE11.
        return fetch(url).then(response => response.json());
    }

    renderedCallback() {
        if (this._chartjsInitialized) {
            return; 
        }
        this._chartjsInitialized = true;
        loadScript(this, chartjs)
        .then( () => { return this.getExternalData(this.QUERY_URL)})
        .then((data) => {  
            console.log("in rendercallback data " + data);
            let monthLabels = [];
            let visitCounts = [];
            for (let i=0; i < data.visits.length; i++) {
                monthLabels.push(data.visits[i].month);
                visitCounts.push(data.visits[i].count);
            }

            const config= {
                type: CHART_CONFIG.type,
                data: {
                    labels: monthLabels,
                    datasets: [{
                        label: CHART_CONFIG.label,
                        data: visitCounts,
                        borderColor: CHART_CONFIG.borderColor,
                        fill: CHART_CONFIG.fill
                    }]
            },
            options: CHART_CONFIG.options
            };
            const ctx = this.template
                .querySelector(CHART_CONFIG.dom_selector)
                .getContext('2d');
            this._chart = new window.Chart(ctx, config);
                    })
            .catch(error => {
                this.error = error;
            }
        );   
    }
}