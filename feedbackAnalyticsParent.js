import { LightningElement, wire, api } from 'lwc';
import getFeedback from '@salesforce/apex/FeedbackVisualization.getFeedback';
import { NavigationMixin } from 'lightning/navigation';
 
export default class FeedbackAnalyticsParent extends NavigationMixin(LightningElement) {
    chartConfiguration;
    error;
    totalRecords;
    averageRating;
 
    @wire(getFeedback)
    getFeedback({ error, data }) {
        if (error) {
            this.error = error;
            this.chartConfiguration = undefined;
        } else if (data) {
            let chartRatingData = [];
            let chartLabel = [];
            let total = 0;
            data.forEach(feed => {
                chartRatingData.push(feed.avgRating);
                chartLabel.push(feed.Name);
                total += feed.avgRating;
            });

            this.totalRecords = data.length;
            this.averageRating = this.totalRecords > 0 ? (total / this.totalRecords).toFixed(2) : 0;
 
            this.chartConfiguration = {
                type: 'line',
                data: {
                    datasets: [{
                            //label: 'Rating',
                            borderColor: "aqua",
                            fill: 'white',
                            pointBorderColor:'black',
                            data: chartRatingData,
                        },
                        ],
                    labels: chartLabel,
                },
                options: {
                    legend: {
                        display: false
                    },
                    scales: {
                        // xAxes: [{
                        //     stacked: true,
                        // }],
                        yAxes: [{
                            //stacked: true,
                            ticks: {
                                beginAtZero: true,
                                stepSize: 1,    
                                callback: function(value) { 
                                    return Number.isInteger(value) ? value : null; 
                                }
                            }
                        }]
                    }
                },
                        };
            console.log('data => ', data);
            this.error = undefined;
        }
    }
    @api label;

    navitageToLWCUsingAura(event) {
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__feedbackFormAura'//aura component name
            }
        });
    }
}