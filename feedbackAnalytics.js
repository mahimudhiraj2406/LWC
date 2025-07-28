/*import { LightningElement, wire } from 'lwc';
import getFeedbackData from '@salesforce/apex/FeedbackAnalyticsController.getFeedbackData';
import chartjs from '@salesforce/resourceUrl/ChartJs';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class GenFeedbackBarchart extends LightningElement {
    chartConfiguration;
    isChartJsInitialized = false;

    @wire(getFeedbackData)
    getFeedbackData({ error, data }) {
        if (error) {
            this.error = error;
            this.chartConfiguration = undefined;
            this.showToast('Error', error.body.message, 'error');
        } else if (data) {
            let chartCountData = [];
            let chartLabel = [];

            // Combine data into a single array of objects
            let chartData = data.map(feedback => {
                return {
                    rating: feedback.rating,
                    count: feedback.count
                };
            });

            // Sort the combined array by the rating (X-axis values)
            chartData.sort((a, b) => a.rating - b.rating);

            // Split sorted data back into separate arrays
            chartData.forEach(item => {
                chartLabel.push(item.rating);
                chartCountData.push(item.count);
            });

            this.chartConfiguration = {
                type: 'bar',
                data: {
                    datasets: [{
                        label: 'Feedback Count',
                        backgroundColor: "blue",
                        data: chartCountData,
                    }],
                    labels: chartLabel,  // Correct labels assignment in sorted order
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            min: 0,  // Start Y-axis at 0
                            max: 10, // Set the maximum value to 10
                            ticks: {
                                stepSize: 1,  // Increment the Y-axis by 1
                                callback: function(value) {
                                    if (Number.isInteger(value)) {
                                        return value;  // Only show integer values
                                    }
                                }
                            },
                            title: {
                                display: true,
                                text: 'Feedback Count'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Rating'
                            }
                        }
                    }
                },
            };
            this.initializeChart();
        }
    }

    renderedCallback() {
        if (this.isChartJsInitialized) {
            return;
        }
        this.loadChartJs();
    }

    loadChartJs() {
        loadScript(this, chartjs)
            .then(() => {
                this.isChartJsInitialized = true;
                if (this.chartConfiguration) {
                    this.initializeChart();
                }
            })
            .catch(error => {
                this.showToast('Error loading Chart', error.message, 'error');
            });
    }

    initializeChart() {
        if (this.isChartJsInitialized && this.chartConfiguration) {
            const ctx = this.template.querySelector('canvas.barChart').getContext('2d');
            this.chart = new window.Chart(ctx, JSON.parse(JSON.stringify(this.chartConfiguration)));
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            })
        );
    }
}
*/


import { LightningElement, wire } from 'lwc';
import getFeedbackData from '@salesforce/apex/FeedbackAnalyticsController.getFeedbackData';
import chartjs from '@salesforce/resourceUrl/ChartJs';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class GenFeedbackDonutchart extends LightningElement {
    chartConfiguration;
    isChartJsInitialized = false;

    @wire(getFeedbackData)
    getFeedbackData({ error, data }) {
        if (error) {
            this.error = error;
            this.chartConfiguration = undefined;
            this.showToast('Error', error.body.message, 'error');
        } else if (data) {
            let chartCountData = [];
            let chartLabel = [];

            // Combine data into a single array of objects
            let chartData = data.map(feedback => {
                return {
                    rating: feedback.rating,
                    count: feedback.count
                };
            });

            // Sort the combined array by the rating (X-axis values)
            chartData.sort((a, b) => a.rating - b.rating);

            // Split sorted data back into separate arrays
            chartData.forEach(item => {
                chartLabel.push(item.rating);
                chartCountData.push(item.count);
            });

            this.chartConfiguration = {
                type: 'doughnut',  // Change chart type to donut
                data: {
                    datasets: [{
                        label: 'Feedback Count',
                        backgroundColor: [
                            'blue',
                            'yellow',
                            'magenta',
                            'chartreuse',
                            'red',
                        ],  // You can specify colors here
                        data: chartCountData,
                    }],
                    labels: chartLabel,  // Correct labels assignment in sorted order
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    return tooltipItem.label + ': ' + tooltipItem.raw;
                                }
                            }
                        }
                    }
                }
            };
            this.initializeChart();
        }
    }

    renderedCallback() {
        if (this.isChartJsInitialized) {
            return;
        }
        this.loadChartJs();
    }

    loadChartJs() {
        loadScript(this, chartjs)
            .then(() => {
                this.isChartJsInitialized = true;
                if (this.chartConfiguration) {
                    this.initializeChart();
                }
            })
            .catch(error => {
                this.showToast('Error loading Chart', error.message, 'error');
            });
    }

    initializeChart() {
        if (this.isChartJsInitialized && this.chartConfiguration) {
            const ctx = this.template.querySelector('canvas.donutChart').getContext('2d');
            this.chart = new window.Chart(ctx, JSON.parse(JSON.stringify(this.chartConfiguration)));
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            })
        );
    }
}
