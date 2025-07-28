/*import { LightningElement, wire, api, track } from 'lwc';
import retreieveRecords from '@salesforce/apex/DescribeObjectHelper.retreieveRecords';
import saveReport from '@salesforce/apex/DescribeObjectHelper.saveReport';
import { loadScript } from 'lightning/platformResourceLoader';
import JS_PDF from '@salesforce/resourceUrl/JS_PDF';
import JS_PDF_AutoTable from '@salesforce/resourceUrl/JS_PDF_AutoTable';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RetrieveRecord extends LightningElement {
    jsPDF;
    @api objectName = ''; 
    @api fieldAPINames = ''; 
    @api filterCriteria = '';
    
    items = []; 
    @track data = [];
    @track filteredData = []; 
    @track columns;
    @track filters = []; 
    isRecordsVisible = false; 

    sortedBy; 
    sortedDirection = 'asc'; 

    // Load jsPDF library
    connectedCallback() {
        Promise.all([
            loadScript(this, JS_PDF), // Load jsPDF library
            loadScript(this, JS_PDF_AutoTable) // Load autoTable plugin
        ])
        .then(() => {
            this.jsPDF = window.jspdf.jsPDF;
            console.log('jsPDF library and autoTable plugin loaded successfully');
        })
        .catch(error => {
            console.error('Error loading jsPDF or autoTable library', error);
        });
    }

    get fieldOptions() {
        console.log('Columns for field options:', this.columns);
        return this.columns.map(col => ({ label: col.label, value: col.fieldName }));
    }

    get operatorOptions() {
        return [
            { label: 'Equals', value: 'equals' },
            { label: 'Contains', value: 'contains' },
        ];
    }

    @wire(retreieveRecords, { objectName: '$objectName', fieldAPINames: '$fieldAPINames' })
        wiredObjects({ error, data }) {
            if (data) {
                console.log('Raw data:', JSON.stringify(data));
                this.processData(data);
            } else if (error) {
                console.error('Error fetching records:', error);
            }
        }
    
        processData(rawData) {
            if (rawData.length > 0) {
                this.columns = Object.keys(rawData[0]).map(field => {
                    let type = 'text';
                    if (field.toLowerCase().includes('date')) {
                        type = 'date';
                    } else if (field.toLowerCase().endsWith('id')) {
                        type = 'text'; // Changed to 'text' to display full ID
                    }
                    return {
                        label: this.formatFieldLabel(field),
                        fieldName: field,
                        type: type,
                        sortable: true,
                        typeAttributes: type === 'date' ? {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        } : null
                    };
                });
            }
    
            this.data = rawData.map(record => {
                const processedRecord = { ...record };
                for (let field in processedRecord) {
                    if (processedRecord[field] && this.columns.find(col => col.fieldName === field)?.type === 'date') {
                        processedRecord[field] = new Date(processedRecord[field]).toISOString();
                    }
                }
                return processedRecord;
            });
    
            this.filteredData = [...this.data];
            console.log('Processed columns:', JSON.stringify(this.columns));
            console.log('Processed data:', JSON.stringify(this.data));
        }
    
        formatFieldLabel(fieldName) {
            return fieldName.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }

    retriveRecordHandler(event) {
        let args = JSON.parse(JSON.stringify(event.detail));
        console.log('Retrieve Record Handler args:', args);
        this.objectName = args.valueParam;
        this.fieldAPINames = args.selectedFieldsValueParam;
        
        let columnFields = args.selectedFieldsValueParam.split(',');
        this.items = '';

        columnFields.map(element => {
            let itemValue = element.charAt(0).toUpperCase() + element.slice(1);
            this.items = [...this.items ,{label: itemValue, fieldName: itemValue, sortable: true}];    
        });
        
        this.columns = this.items;
        console.log('Columns set for data table:', this.columns);
        this.isRecordsVisible = true;
    }

    resetHandler(event) {
        console.log('Reset Handler triggered');
        this.isRecordsVisible = false;
        this.columns = [];
        this.data = [];
        this.filteredData = [];
        this.filters = [];
    }

    handleAddFilter() {
        console.log('Add Filter clicked');
        this.filters = [...this.filters, { id: Date.now(), field: '', operator: '', value: '' }];
        console.log('Current filters:', this.filters);
    }

    handleRemoveFilter(event) {
        const filterId = event.target.dataset.id;
        console.log('Removing filter with ID:', filterId);
        this.filters = this.filters.filter(filter => filter.id !== parseInt(filterId, 10));
        console.log('Filters after removal:', this.filters);
        this.applyFilters();
    }

    handleFilterFieldChange(event) {
        const filterId = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Filter Field Change - ID: ${filterId}, Value: ${value}`);
        this.updateFilter(filterId, 'field', value);
    }

    handleFilterOperatorChange(event) {
        const filterId = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Filter Operator Change - ID: ${filterId}, Value: ${value}`);
        this.updateFilter(filterId, 'operator', value);
    }

    handleFilterValueChange(event) {
        const filterId = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Filter Value Change - ID: ${filterId}, Value: ${value}`);
        this.updateFilter(filterId, 'value', value);
    }

    updateFilter(filterId, field, value) {
        this.filters = this.filters.map(filter => {
            if (filter.id === parseInt(filterId, 10)) {
                console.log(`Updating filter - ID: ${filterId}, Field: ${field}, Value: ${value}`);
                return { ...filter, [field]: value };
            }
            return filter;
        });
        console.log('Updated filters:', this.filters);
        this.applyFilters();
    }

    applyFilters() {
        console.log('Applying filters...');
        let tempData = [...this.data];

        this.filters.forEach(filter => {
            if (filter.field && filter.value) {
                if (filter.operator === 'equals') {
                    tempData = tempData.filter(record => record[filter.field] && record[filter.field].toLowerCase() === filter.value.toLowerCase());
                } else if (filter.operator === 'contains') {
                    tempData = tempData.filter(record => record[filter.field] && record[filter.field].toLowerCase().includes(filter.value.toLowerCase()));
                }
            }
        });

        console.log('Filtered data:', tempData);
        this.filteredData = tempData;
    }

    handleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        console.log(`Sorting by ${sortedBy} in ${sortDirection} order`);
        const cloneData = [...this.filteredData];

        cloneData.sort((a, b) => {
            let aValue = a[sortedBy] ? a[sortedBy].toLowerCase() : '';
            let bValue = b[sortedBy] ? b[sortedBy].toLowerCase() : '';
            return sortDirection === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        });

        this.filteredData = cloneData;
        this.sortedBy = sortedBy;
        this.sortedDirection = sortDirection;
    }

    handleSaveReport() {
        const reportName = prompt('Enter a name for the report:');
        if (!reportName) {
            this.showToast('Error', 'Report name is required!', 'error');
            return;
        }
    
        // Generate PDF using jsPDF
        if (!this.jsPDF) {
            console.error('jsPDF library is not loaded.');
            this.showToast('Error', 'jsPDF library is not loaded.', 'error');
            return;
        }
    
        // Initialize a new jsPDF document
        const doc = new this.jsPDF();
        const title = 'Report: ' + this.objectName;
        const date = new Date().toLocaleDateString();
        const summary = `Report Generated On: ${date}`;
        
        doc.text(title, 10, 10);
        doc.text(summary, 10, 20);
    
        // Define headers and data for the table
        const headers = this.columns.map(col => col.label);
        const data = this.filteredData.map(record => 
            this.columns.map(col => record[col.fieldName] || '')
        );
    
        // Add the table using autoTable
        doc.autoTable({
            head: [headers],
            body: data,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [0, 255, 255], textColor: [0, 0, 0] },
            styles: {
                cellPadding: 3,
                halign: 'center',
                valign: 'middle',
                lineWidth: 0.2,
                lineColor: [0, 0, 0],
            },
        });
    
        // Get the PDF as base64
        const pdfOutput = doc.output('datauristring'); // Get base64 encoded string
        const base64String = pdfOutput.split(',')[1];  // Extract the base64 content
    
        // Call Apex to save the PDF in ContentVersion
        saveReport({
            name: reportName,
            objectName: this.objectName,
            fieldAPINames: this.fieldAPINames,
            filterCriteria: this.filters.map(filter => `${filter.field} ${filter.operator === 'equals' ? 'equals' : 'contains'} ${filter.value}`).join(', '),
            reportData: base64String
        })
        .then(() => {
            this.showToast('Success', 'Report saved successfully as PDF!', 'success');
        })
        .catch(error => {
            console.error('Error saving PDF report:', error);
            this.showToast('Error', 'Error saving report.', 'error');
        });
    }
    
    // Method to show toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }


    handleDownloadPDF() {
        if (!this.jsPDF) {
            console.error('jsPDF library is not loaded.');
            return;
        }
     
        // Initialize a new jsPDF document
        const doc = new this.jsPDF();
     
        // Set the title and summary on the same line as the table
        const title = 'Report: ' + this.objectName;
        const date = new Date().toLocaleDateString();
        const summary = `Report Generated On: ${date}`;
     
        doc.text(title, 10, 10);
        doc.text(summary, 10, 20);
        
        // Define headers and data for the table
        const headers = this.columns.map(col => col.label);
        const data = this.filteredData.map(record => 
            this.columns.map(col => record[col.fieldName] || '')
        );
     
        // Add the table using autoTable
        doc.autoTable({
            head: [headers], // Column headers
            body: data,      // Data for each row
            startY: 30,  // Position table after the title/summary
            theme: 'grid',   // Add borders to the table
            headStyles: { fillColor: [0, 255, 255], textColor: [0, 0, 0] },
            styles: {
                cellPadding: 3,
                halign: 'center',  // Center align text in the table cells
                valign: 'middle',
                lineWidth: 0.2,
                lineColor: [0, 0, 0]  // Set border color to black
            },
        });
     
        // Save the PDF
        doc.save(this.objectName + ' Report.pdf');
    }

    handleDownloadCSV() {
        const headers = this.columns.map(col => col.label).join(',');
        const rows = this.filteredData.map(record =>
            this.columns.map(col => `"${(record[col.fieldName] || '').toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', this.objectName + ' Report.csv');
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link); // Remove the link when done
    }

}
*/ 





/*import { LightningElement, wire, api, track } from 'lwc';
import retreieveRecords from '@salesforce/apex/DescribeObjectHelper.retreieveRecords';
import saveReport from '@salesforce/apex/DescribeObjectHelper.saveReport';
import { loadScript } from 'lightning/platformResourceLoader';
import JS_PDF from '@salesforce/resourceUrl/JS_PDF';
import JS_PDF_AutoTable from '@salesforce/resourceUrl/JS_PDF_AutoTable';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import scheduleReport from '@salesforce/apex/ReportSchedulerController.scheduleReport';

export default class RetrieveRecord extends LightningElement {
    jsPDF;
    @api objectName = '';
    @api fieldAPINames = '';
    @api filterCriteria = '';
   
    items = [];
    @track data = [];
    @track filteredData = [];
    @track columns;
    @track filters = [];
    isRecordsVisible = false;
 
    sortedBy;
    sortedDirection = 'asc';
    @track scheduleFrequency = ''; // To store selected frequency
    @track email = ''; // To store input email
 
    // Options for the schedule frequency combobox
    scheduleOptions = [
        { label: 'Daily', value: 'Daily' },
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Monthly', value: 'Monthly' }
    ];
 
    // Handle frequency selection
    handleScheduleFrequencyChange(event) {
        this.scheduleFrequency = event.detail.value;
    }
 
    // Handle email input change
    handleEmailChange(event) {
        this.email = event.target.value;
    }
 
    // Handle Schedule Report button click
    handleScheduleReport() {
        if (this.email && this.scheduleFrequency) {
            // Call Apex method to schedule the report
            scheduleReport({
                reportName: this.objectName + ' Report',
                frequency: this.scheduleFrequency,
                email: this.email,
                objectName: this.objectName,
                fieldAPINames: this.fieldAPINames,
                filterCriteria: this.filters.map(filter => `${filter.field} ${filter.operator === 'equals' ? '=' : 'LIKE'} '${filter.value}'`).join(' AND ')
            })
            .then(result => {
                // Handle success
                this.showToast('Success', 'Report scheduled successfully', 'success');
            })
            .catch(error => {
                // Handle error
                this.showToast('Error', 'Error scheduling report: ' + error.body.message, 'error');
            });
        } else {
            // Show an error if email or frequency is not selected
            this.showToast('Error', 'Email and Frequency are required', 'error');
        }
    }
 
    // Load jsPDF library
    connectedCallback() {
        Promise.all([
            loadScript(this, JS_PDF), // Load jsPDF library
            loadScript(this, JS_PDF_AutoTable) // Load autoTable plugin
        ])
        .then(() => {
            this.jsPDF = window.jspdf.jsPDF;
            console.log('jsPDF library and autoTable plugin loaded successfully');
        })
        .catch(error => {
            console.error('Error loading jsPDF or autoTable library', error);
        });
    }
 
    get fieldOptions() {
        console.log('Columns for field options:', this.columns);
        return this.columns.map(col => ({ label: col.label, value: col.fieldName }));
    }
 
    get operatorOptions() {
        return [
            { label: 'Equals', value: 'equals' },
            { label: 'Contains', value: 'contains' },
        ];
    }
 
    @wire(retreieveRecords, { objectName: '$objectName', fieldAPINames: '$fieldAPINames' })
        wiredObjects({ error, data }) {
            if (data) {
                console.log('Raw data:', JSON.stringify(data));
                this.processData(data);
            } else if (error) {
                console.error('Error fetching records:', error);
            }
        }
   
        processData(rawData) {
            if (rawData.length > 0) {
                this.columns = Object.keys(rawData[0]).map(field => {
                    let type = 'text';
                    if (field.toLowerCase().includes('date')) {
                        type = 'date';
                    } else if (field.toLowerCase().endsWith('id')) {
                        type = 'text'; // Changed to 'text' to display full ID
                    }
                    return {
                        label: this.formatFieldLabel(field),
                        fieldName: field,
                        type: type,
                        sortable: true,
                        typeAttributes: type === 'date' ? {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        } : null
                    };
                });
            }
   
            this.data = rawData.map(record => {
                const processedRecord = { ...record };
                for (let field in processedRecord) {
                    if (processedRecord[field] && this.columns.find(col => col.fieldName === field)?.type === 'date') {
                        processedRecord[field] = new Date(processedRecord[field]).toISOString();
                    }
                }
                return processedRecord;
            });
   
            this.filteredData = [...this.data];
            console.log('Processed columns:', JSON.stringify(this.columns));
            console.log('Processed data:', JSON.stringify(this.data));
        }
   
        formatFieldLabel(fieldName) {
            return fieldName.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
 
    retriveRecordHandler(event) {
        let args = JSON.parse(JSON.stringify(event.detail));
        console.log('Retrieve Record Handler args:', args);
        this.objectName = args.valueParam;
        this.fieldAPINames = args.selectedFieldsValueParam;
       
        let columnFields = args.selectedFieldsValueParam.split(',');
        this.items = '';
 
        columnFields.map(element => {
            let itemValue = element.charAt(0).toUpperCase() + element.slice(1);
            this.items = [...this.items ,{label: itemValue, fieldName: itemValue, sortable: true}];    
        });
       
        this.columns = this.items;
        console.log('Columns set for data table:', this.columns);
        this.isRecordsVisible = true;
    }
 
    resetHandler(event) {
        console.log('Reset Handler triggered');
        this.isRecordsVisible = false;
        this.columns = [];
        this.data = [];
        this.filteredData = [];
        this.filters = [];
    }
 
    handleAddFilter() {
        console.log('Add Filter clicked');
        this.filters = [...this.filters, { id: Date.now(), field: '', operator: '', value: '' }];
        console.log('Current filters:', this.filters);
    }
 
    handleRemoveFilter(event) {
        const filterId = event.target.dataset.id;
        console.log('Removing filter with ID:', filterId);
        this.filters = this.filters.filter(filter => filter.id !== parseInt(filterId, 10));
        console.log('Filters after removal:', this.filters);
        this.applyFilters();
    }
 
    handleFilterFieldChange(event) {
        const filterId = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Filter Field Change - ID: ${filterId}, Value: ${value}`);
        this.updateFilter(filterId, 'field', value);
    }
 
    handleFilterOperatorChange(event) {
        const filterId = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Filter Operator Change - ID: ${filterId}, Value: ${value}`);
        this.updateFilter(filterId, 'operator', value);
    }
 
    handleFilterValueChange(event) {
        const filterId = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Filter Value Change - ID: ${filterId}, Value: ${value}`);
        this.updateFilter(filterId, 'value', value);
    }
 
    updateFilter(filterId, field, value) {
        this.filters = this.filters.map(filter => {
            if (filter.id === parseInt(filterId, 10)) {
                console.log(`Updating filter - ID: ${filterId}, Field: ${field}, Value: ${value}`);
                return { ...filter, [field]: value };
            }
            return filter;
        });
        console.log('Updated filters:', this.filters);
        this.applyFilters();
    }
 
    applyFilters() {
        console.log('Applying filters...');
        let tempData = [...this.data];
 
        this.filters.forEach(filter => {
            if (filter.field && filter.value) {
                if (filter.operator === 'equals') {
                    tempData = tempData.filter(record => record[filter.field] && record[filter.field].toLowerCase() === filter.value.toLowerCase());
                } else if (filter.operator === 'contains') {
                    tempData = tempData.filter(record => record[filter.field] && record[filter.field].toLowerCase().includes(filter.value.toLowerCase()));
                }
            }
        });
 
        console.log('Filtered data:', tempData);
        this.filteredData = tempData;
    }
 
    handleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        console.log(`Sorting by ${sortedBy} in ${sortDirection} order`);
        const cloneData = [...this.filteredData];
 
        cloneData.sort((a, b) => {
            let aValue = a[sortedBy] ? a[sortedBy].toLowerCase() : '';
            let bValue = b[sortedBy] ? b[sortedBy].toLowerCase() : '';
            return sortDirection === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        });
 
        this.filteredData = cloneData;
        this.sortedBy = sortedBy;
        this.sortedDirection = sortDirection;
    }
 
    handleSaveReport() {
        const reportName = prompt('Enter a name for the report:');
        if (!reportName) {
            this.showToast('Error', 'Report name is required!', 'error');
            return;
        }
   
        // Generate PDF using jsPDF
        if (!this.jsPDF) {
            console.error('jsPDF library is not loaded.');
            this.showToast('Error', 'jsPDF library is not loaded.', 'error');
            return;
        }
   
        // Initialize a new jsPDF document
        const doc = new this.jsPDF();
        const title = 'Report: ' + this.objectName;
        const date = new Date().toLocaleDateString();
        const summary = `Report Generated On: ${date}`;
       
        doc.text(title, 10, 10);
        doc.text(summary, 10, 20);
   
        // Define headers and data for the table
        const headers = this.columns.map(col => col.label);
        const data = this.filteredData.map(record =>
            this.columns.map(col => record[col.fieldName] || '')
        );
   
        // Add the table using autoTable
        doc.autoTable({
            head: [headers],
            body: data,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [0, 255, 255], textColor: [0, 0, 0] },
            styles: {
                cellPadding: 3,
                halign: 'center',
                valign: 'middle',
                lineWidth: 0.2,
                lineColor: [0, 0, 0],
            },
        });
   
        // Get the PDF as base64
        const pdfOutput = doc.output('datauristring'); // Get base64 encoded string
        const base64String = pdfOutput.split(',')[1];  // Extract the base64 content
   
        // Call Apex to save the PDF in ContentVersion
        saveReport({
            name: reportName,
            objectName: this.objectName,
            fieldAPINames: this.fieldAPINames,
            filterCriteria: this.filters.map(filter => `${filter.field} ${filter.operator === 'equals' ? 'equals' : 'contains'} ${filter.value}`).join(', '),
            reportData: base64String
        })
        .then(() => {
            this.showToast('Success', 'Report saved successfully as PDF!', 'success');
        })
        .catch(error => {
            console.error('Error saving PDF report:', error);
            this.showToast('Error', 'Error saving report.', 'error');
        });
    }
        
        
   
    // Method to show toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
 
 
    handleDownloadPDF() {
        if (!this.jsPDF) {
            console.error('jsPDF library is not loaded.');
            return;
        }
     
        // Initialize a new jsPDF document
        const doc = new this.jsPDF();
     
        // Set the title and summary on the same line as the table
        const title = 'Report: ' + this.objectName;
        const date = new Date().toLocaleDateString();
        const summary = `Report Generated On: ${date}`;
     
        doc.text(title, 10, 10);
        doc.text(summary, 10, 20);
       
        // Define headers and data for the table
        const headers = this.columns.map(col => col.label);
        const data = this.filteredData.map(record =>
            this.columns.map(col => record[col.fieldName] || '')
        );
     
        // Add the table using autoTable
        doc.autoTable({
            head: [headers], // Column headers
            body: data,      // Data for each row
            startY: 30,  // Position table after the title/summary
            theme: 'grid',   // Add borders to the table
            headStyles: { fillColor: [0, 255, 255], textColor: [0, 0, 0] },
            styles: {
                cellPadding: 3,
                halign: 'center',  // Center align text in the table cells
                valign: 'middle',
                lineWidth: 0.2,
                lineColor: [0, 0, 0]  // Set border color to black
            },
        });
     
        // Save the PDF
        doc.save(this.objectName + ' Report.pdf');
    }
 
    handleDownloadCSV() {
        const headers = this.columns.map(col => col.label).join(',');
        const rows = this.filteredData.map(record =>
            this.columns.map(col => `"${(record[col.fieldName] || '').toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
       
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', this.objectName + ' Report.csv');
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link); // Remove the link when done
    }
 
}*/






/*import { LightningElement, wire, api, track } from 'lwc';
import retreieveRecords from '@salesforce/apex/DescribeObjectHelper.retreieveRecords';
import saveReport from '@salesforce/apex/DescribeObjectHelper.saveReport';
import { loadScript } from 'lightning/platformResourceLoader';
import JS_PDF from '@salesforce/resourceUrl/JS_PDF';
import JS_PDF_AutoTable from '@salesforce/resourceUrl/JS_PDF_AutoTable';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import scheduleReport from '@salesforce/apex/ReportSchedulerController.scheduleReport';

export default class RetrieveRecord extends LightningElement {
    jsPDF;
    @api objectName = '';
    @api fieldAPINames = '';
    @api filterCriteria = '';

    items = [];
    @track data = [];
    @track filteredData = [];
    @track columns;
    @track filters = [];
    isRecordsVisible = false;

    sortedBy;
    sortedDirection = 'asc';
    @track scheduleFrequency = ''; // To store selected frequency
    @track email = ''; // To store input email

    // Options for the schedule frequency combobox
    scheduleOptions = [
        { label: 'Daily', value: 'Daily' },
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Monthly', value: 'Monthly' }
    ];

    // Handle frequency selection
    handleScheduleFrequencyChange(event) {
        this.scheduleFrequency = event.detail.value;
    }

    // Handle email input change
    handleEmailChange(event) {
        this.email = event.target.value;
    }

    // Handle Schedule Report button click
    handleScheduleReport() {
        if (this.email && this.scheduleFrequency) {
            // Call Apex method to schedule the report
            scheduleReport({
                reportName: this.objectName + ' Report',
                frequency: this.scheduleFrequency,
                email: this.email,
                objectName: this.objectName,
                fieldAPINames: this.fieldAPINames,
                filterCriteria: this.filters.map(filter => `${filter.field} ${filter.operator === 'equals' ? '=' : 'LIKE'} '${filter.value}'`).join(' AND ')
            })
            .then(result => {
                // Handle success
                this.showToast('Success', 'Report scheduled successfully', 'success');
            })
            .catch(error => {
                // Handle error
                this.showToast('Error', 'Error scheduling report: ' + error.body.message, 'error');
            });
        } else {
            // Show an error if email or frequency is not selected
            this.showToast('Error', 'Email and Frequency are required', 'error');
        }
    }

    // Load jsPDF library
    connectedCallback() {
        Promise.all([
            loadScript(this, JS_PDF), // Load jsPDF library
            loadScript(this, JS_PDF_AutoTable) // Load autoTable plugin
        ])
        .then(() => {
            this.jsPDF = window.jspdf.jsPDF;
            console.log('jsPDF library and autoTable plugin loaded successfully');
        })
        .catch(error => {
            console.error('Error loading jsPDF or autoTable library', error);
        });
    }

    get fieldOptions() {
        console.log('Columns for field options:', this.columns);
        return this.columns.map(col => ({ label: col.label, value: col.fieldName }));
    }

    get operatorOptions() {
        return [
            { label: 'Equals', value: 'equals' },
            { label: 'Contains', value: 'contains' },
        ];
    }

    @wire(retreieveRecords, { objectName: '$objectName', fieldAPINames: '$fieldAPINames' })
    wiredObjects({ error, data }) {
        if (data) {
            console.log('Raw data:', JSON.stringify(data));
            this.processData(data);
        } else if (error) {
            console.error('Error fetching records:', error);
        }
    }

    processData(rawData) {
        if (rawData.length > 0) {
            this.columns = Object.keys(rawData[0]).map(field => {
                let type = 'text';
                if (field.toLowerCase().includes('date')) {
                    type = 'date';
                } else if (field.toLowerCase().endsWith('id')) {
                    type = 'text'; // Changed to 'text' to display full ID
                }
                return {
                    label: this.formatFieldLabel(field),
                    fieldName: field,
                    type: type,
                    sortable: true,
                    typeAttributes: type === 'date' ? {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    } : null
                };
            });
        }

        this.data = rawData.map(record => {
            const processedRecord = { ...record };
            for (let field in processedRecord) {
                if (processedRecord[field] && this.columns.find(col => col.fieldName === field)?.type === 'date') {
                    processedRecord[field] = new Date(processedRecord[field]).toISOString();
                }
            }
            return processedRecord;
        });

        this.filteredData = [...this.data];
        console.log('Processed columns:', JSON.stringify(this.columns));
        console.log('Processed data:', JSON.stringify(this.data));
    }

    formatFieldLabel(fieldName) {
        return fieldName.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    retriveRecordHandler(event) {
        let args = JSON.parse(JSON.stringify(event.detail));
        console.log('Retrieve Record Handler args:', args);
        this.objectName = args.valueParam;
        this.fieldAPINames = args.selectedFieldsValueParam;

        let columnFields = args.selectedFieldsValueParam.split(',');
        this.items = '';

        columnFields.map(element => {
            let itemValue = element.charAt(0).toUpperCase() + element.slice(1);
            this.items = [...this.items ,{label: itemValue, fieldName: itemValue, sortable: true}];    
        });

        this.columns = this.items;
        console.log('Columns set for data table:', this.columns);
        this.isRecordsVisible = true;
    }

    resetHandler(event) {
        console.log('Reset Handler triggered');
        this.isRecordsVisible = false;
        this.columns = [];
        this.data = [];
        this.filteredData = [];
        this.filters = [];
    }

    handleAddFilter() {
        console.log('Add Filter clicked');
        this.filters = [...this.filters, { id: Date.now(), field: '', operator: '', value: '' }];
        console.log('Current filters:', this.filters);
    }

    handleRemoveFilter(event) {
        const filterId = event.target.dataset.id;
        console.log('Removing filter with ID:', filterId);
        this.filters = this.filters.filter(filter => filter.id !== parseInt(filterId, 10));
        console.log('Filters after removal:', this.filters);
        this.applyFilters();
    }

    handleFilterFieldChange(event) {
        const filterId = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Filter Field Change - ID: ${filterId}, Value: ${value}`);
        this.updateFilter(filterId, 'field', value);
    }

    handleFilterOperatorChange(event) {
        const filterId = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Filter Operator Change - ID: ${filterId}, Value: ${value}`);
        this.updateFilter(filterId, 'operator', value);
    }

    handleFilterValueChange(event) {
        const filterId = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Filter Value Change - ID: ${filterId}, Value: ${value}`);
        this.updateFilter(filterId, 'value', value);
    }

    updateFilter(filterId, field, value) {
        this.filters = this.filters.map(filter => {
            if (filter.id === parseInt(filterId, 10)) {
                console.log(`Updating filter - ID: ${filterId}, Field: ${field}, Value: ${value}`);
                return { ...filter, [field]: value };
            }
            return filter;
        });
        console.log('Updated filters:', this.filters);
        this.applyFilters();
    }

    applyFilters() {
        console.log('Applying filters...');
        let tempData = [...this.data];

        this.filters.forEach(filter => {
            if (filter.field && filter.value) {
                if (filter.operator === 'equals') {
                    tempData = tempData.filter(record => record[filter.field] && record[filter.field].toLowerCase() === filter.value.toLowerCase());
                } else if (filter.operator === 'contains') {
                    tempData = tempData.filter(record => record[filter.field] && record[filter.field].toLowerCase().includes(filter.value.toLowerCase()));
                }
            }
        });

        console.log('Filtered data:', tempData);
        this.filteredData = tempData;
    }

    handleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        console.log(`Sorting by ${sortedBy} in ${sortDirection} order`);
        const cloneData = [...this.filteredData];

        cloneData.sort((a, b) => {
            let aValue = a[sortedBy] ? a[sortedBy].toString() : '';
            let bValue = b[sortedBy] ? b[sortedBy].toString() : '';

            if (sortDirection === 'asc') {
                return aValue.localeCompare(bValue);
            } else if (sortDirection === 'desc') {
                return bValue.localeCompare(aValue);
            }
        });

        this.filteredData = cloneData;
    }

    generatePDF() {
        console.log('Generating PDF...');
        if (this.jsPDF) {
            const doc = new this.jsPDF();
            doc.autoTable({ html: this.template.querySelector('table') });
            const pdfData = doc.output('datauristring');

            const base64String = pdfData.split(',')[1]; // Extract base64 string from data URI

            saveReport({
                name: 'MyReport',
                objectName: this.objectName,
                fieldAPINames: this.fieldAPINames,
                filterCriteria: this.filters.map(filter => `${filter.field} ${filter.operator === 'equals' ? '=' : 'LIKE'} '${filter.value}'`).join(' AND '),
                reportData: base64String
            })
            .then(() => {
                this.showToast('Success', 'Report saved successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error', 'Error saving report: ' + error.body.message, 'error');
            });
        } else {
            console.error('jsPDF library is not loaded.');
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }

    handleDownloadPDF() {
        if (!this.jsPDF) {
            console.error('jsPDF library is not loaded.');
            return;
        }
     
        // Initialize a new jsPDF document
        const doc = new this.jsPDF();
     
        // Set the title and summary on the same line as the table
        const title = 'Report: ' + this.objectName;
        const date = new Date().toLocaleDateString();
        const summary = `Report Generated On: ${date}`;
     
        doc.text(title, 10, 10);
        doc.text(summary, 10, 20);
       
        // Define headers and data for the table
        const headers = this.columns.map(col => col.label);
        const data = this.filteredData.map(record =>
            this.columns.map(col => record[col.fieldName] || '')
        );
     
        // Add the table using autoTable
        doc.autoTable({
            head: [headers], // Column headers
            body: data,      // Data for each row
            startY: 30,  // Position table after the title/summary
            theme: 'grid',   // Add borders to the table
            headStyles: { fillColor: [0, 255, 255], textColor: [0, 0, 0] },
            styles: {
                cellPadding: 3,
                halign: 'center',  // Center align text in the table cells
                valign: 'middle',
                lineWidth: 0.2,
                lineColor: [0, 0, 0]  // Set border color to black
            },
        });
     
        // Save the PDF
        doc.save(this.objectName + ' Report.pdf');
    }
 
    handleDownloadCSV() {
        const headers = this.columns.map(col => col.label).join(',');
        const rows = this.filteredData.map(record =>
            this.columns.map(col => `"${(record[col.fieldName] || '').toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
       
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', this.objectName + ' Report.csv');
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link); // Remove the link when done
    }
}*/










import { LightningElement, wire, api, track } from 'lwc';
import retreieveRecords from '@salesforce/apex/DescribeObjectHelper.retreieveRecords';
import saveReport from '@salesforce/apex/DescribeObjectHelper.saveReport';
import { loadScript } from 'lightning/platformResourceLoader';
import JS_PDF from '@salesforce/resourceUrl/JS_PDF';
import JS_PDF_AutoTable from '@salesforce/resourceUrl/JS_PDF_AutoTable';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import scheduleReport from '@salesforce/apex/ReportSchedulerController.scheduleReport';

export default class RetrieveRecord extends LightningElement {
    jsPDF;
    @api objectName = '';
    @api fieldAPINames = '';
    @api filterCriteria = '';

    items = [];
    @track data = [];
    @track filteredData = [];
    @track columns;
    @track filters = [];
    isRecordsVisible = false;

    sortedBy;
    sortedDirection = 'asc';
    @track scheduleFrequency = ''; // To store selected frequency
    @track email = ''; // To store input email

    // Options for the schedule frequency combobox
    scheduleOptions = [
        { label: 'Daily', value: 'Daily' },
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Monthly', value: 'Monthly' }
    ];

    // Handle frequency selection
    handleScheduleFrequencyChange(event) {
        this.scheduleFrequency = event.detail.value;
    }

    // Handle email input change
    handleEmailChange(event) {
        this.email = event.target.value;
    }

    // Handle Schedule Report button click
    handleScheduleReport() {
        if (this.email && this.scheduleFrequency) {
            // Call Apex method to schedule the report
            scheduleReport({
                reportName: this.objectName + ' Report',
                frequency: this.scheduleFrequency,
                email: this.email,
                objectName: this.objectName,
                fieldAPINames: this.fieldAPINames,
                filterCriteria: this.filters.map(filter => `${filter.field} ${filter.operator === 'equals' ? '=' : 'LIKE'} '${filter.value}'`).join(' AND ')
            })
            .then(result => {
                // Handle success
                this.showToast('Success', 'Report scheduled successfully', 'success');
            })
            .catch(error => {
                // Handle error
                this.showToast('Error', 'Error scheduling report: ' + error.body.message, 'error');
            });
        } else {
            // Show an error if email or frequency is not selected
            this.showToast('Error', 'Email and Frequency are required', 'error');
        }
    }

    // Load jsPDF library
    connectedCallback() {
        Promise.all([
            loadScript(this, JS_PDF), // Load jsPDF library
            loadScript(this, JS_PDF_AutoTable) // Load autoTable plugin
        ])
        .then(() => {
            this.jsPDF = window.jspdf.jsPDF;
            console.log('jsPDF library and autoTable plugin loaded successfully');
        })
        .catch(error => {
            console.error('Error loading jsPDF or autoTable library', error);
        });
    }

    get fieldOptions() {
        console.log('Columns for field options:', this.columns);
        return this.columns.map(col => ({ label: col.label, value: col.fieldName }));
    }

    get operatorOptions() {
        return [
            { label: 'Equals', value: 'equals' },
            { label: 'Contains', value: 'contains' },
        ];
    }

    @wire(retreieveRecords, { objectName: '$objectName', fieldAPINames: '$fieldAPINames' })
        wiredObjects({ error, data }) {
            if (data) {
                console.log('Raw data:', JSON.stringify(data));
                this.processData(data);
            } else if (error) {
                console.error('Error fetching records:', error);
            }
        }
    
        processData(rawData) {
            if (rawData.length > 0) {
                this.columns = Object.keys(rawData[0]).map(field => {
                    let type = 'text';
                    if (field.toLowerCase().includes('date')) {
                        type = 'date';
                    } else if (field.toLowerCase().endsWith('id')) {
                        type = 'text'; // Changed to 'text' to display full ID
                    }
                    return {
                        label: this.formatFieldLabel(field),
                        fieldName: field,
                        type: type,
                        sortable: true,
                        typeAttributes: type === 'date' ? {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        } : null
                    };
                });
            }
    
            this.data = rawData.map(record => {
                const processedRecord = { ...record };
                for (let field in processedRecord) {
                    if (processedRecord[field] && this.columns.find(col => col.fieldName === field)?.type === 'date') {
                        processedRecord[field] = new Date(processedRecord[field]).toISOString();
                    }
                }
                return processedRecord;
            });
    
            this.filteredData = [...this.data];
            console.log('Processed columns:', JSON.stringify(this.columns));
            console.log('Processed data:', JSON.stringify(this.data));
        }
    
        formatFieldLabel(fieldName) {
            return fieldName.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }

    retriveRecordHandler(event) {
        let args = JSON.parse(JSON.stringify(event.detail));
        console.log('Retrieve Record Handler args:', args);
        this.objectName = args.valueParam;
        this.fieldAPINames = args.selectedFieldsValueParam;
        
        let columnFields = args.selectedFieldsValueParam.split(',');
        this.items = '';

        columnFields.map(element => {
            let itemValue = element.charAt(0).toUpperCase() + element.slice(1);
            this.items = [...this.items ,{label: itemValue, fieldName: itemValue, sortable: true}];    
        });
        
        this.columns = this.items;
        console.log('Columns set for data table:', this.columns);
        this.isRecordsVisible = true;
    }

    resetHandler(event) {
        console.log('Reset Handler triggered');
        this.isRecordsVisible = false;
        this.columns = [];
        this.data = [];
        this.filteredData = [];
        this.filters = [];
    }

    handleAddFilter() {
        console.log('Add Filter clicked');
        this.filters = [...this.filters, { id: Date.now(), field: '', operator: '', value: '' }];
        console.log('Current filters:', this.filters);
    }

    handleRemoveFilter(event) {
        const filterId = event.target.dataset.id;
        console.log('Removing filter with ID:', filterId);
        this.filters = this.filters.filter(filter => filter.id !== parseInt(filterId, 10));
        console.log('Filters after removal:', this.filters);
        this.applyFilters();
    }

    handleFilterFieldChange(event) {
        const filterId = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Filter Field Change - ID: ${filterId}, Value: ${value}`);
        this.updateFilter(filterId, 'field', value);
    }

    handleFilterOperatorChange(event) {
        const filterId = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Filter Operator Change - ID: ${filterId}, Value: ${value}`);
        this.updateFilter(filterId, 'operator', value);
    }

    handleFilterValueChange(event) {
        const filterId = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Filter Value Change - ID: ${filterId}, Value: ${value}`);
        this.updateFilter(filterId, 'value', value);
    }

    updateFilter(filterId, field, value) {
        this.filters = this.filters.map(filter => {
            if (filter.id === parseInt(filterId, 10)) {
                console.log(`Updating filter - ID: ${filterId}, Field: ${field}, Value: ${value}`);
                return { ...filter, [field]: value };
            }
            return filter;
        });
        console.log('Updated filters:', this.filters);
        this.applyFilters();
    }

    applyFilters() {
        console.log('Applying filters...');
        let tempData = [...this.data];

        this.filters.forEach(filter => {
            if (filter.field && filter.value) {
                if (filter.operator === 'equals') {
                    tempData = tempData.filter(record => record[filter.field] && record[filter.field].toLowerCase() === filter.value.toLowerCase());
                } else if (filter.operator === 'contains') {
                    tempData = tempData.filter(record => record[filter.field] && record[filter.field].toLowerCase().includes(filter.value.toLowerCase()));
                }
            }
        });

        console.log('Filtered data:', tempData);
        this.filteredData = tempData;
    }

    handleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        console.log(`Sorting by ${sortedBy} in ${sortDirection} order`);
        const cloneData = [...this.filteredData];

        cloneData.sort((a, b) => {
            let aValue = a[sortedBy] ? a[sortedBy].toLowerCase() : '';
            let bValue = b[sortedBy] ? b[sortedBy].toLowerCase() : '';
            return sortDirection === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        });

        this.filteredData = cloneData;
        this.sortedBy = sortedBy;
        this.sortedDirection = sortDirection;
    }

    handleSaveReport() {
        const reportName = prompt('Enter a name for the report:');
        if (!reportName) {
            this.showToast('Error', 'Report name is required!', 'error');
            return;
        }
    
        // Generate PDF using jsPDF
        if (!this.jsPDF) {
            console.error('jsPDF library is not loaded.');
            this.showToast('Error', 'jsPDF library is not loaded.', 'error');
            return;
        }
    
        // Initialize a new jsPDF document
        const doc = new this.jsPDF();
        const title = 'Report: ' + this.objectName;
        const date = new Date().toLocaleDateString();
        const summary = `Report Generated On: ${date}`;
        
        doc.text(title, 10, 10);
        doc.text(summary, 10, 20);
    
        // Define headers and data for the table
        const headers = this.columns.map(col => col.label);
        const data = this.filteredData.map(record => 
            this.columns.map(col => record[col.fieldName] || '')
        );
    
        // Add the table using autoTable
        doc.autoTable({
            head: [headers],
            body: data,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [0, 255, 255], textColor: [0, 0, 0] },
            styles: {
                cellPadding: 3,
                halign: 'center',
                valign: 'middle',
                lineWidth: 0.2,
                lineColor: [0, 0, 0],
            },
        });
    
        // Get the PDF as base64
        const pdfOutput = doc.output('datauristring'); // Get base64 encoded string
        const base64String = pdfOutput.split(',')[1];  // Extract the base64 content
    
        // Call Apex to save the PDF in ContentVersion
        saveReport({
            name: reportName,
            objectName: this.objectName,
            fieldAPINames: this.fieldAPINames,
            filterCriteria: this.filters.map(filter => `${filter.field} ${filter.operator === 'equals' ? 'equals' : 'contains'} ${filter.value}`).join(', '),
            reportData: base64String
        })
        .then(() => {
            this.showToast('Success', 'Report saved successfully as PDF!', 'success');
        })
        .catch(error => {
            console.error('Error saving PDF report:', error);
            this.showToast('Error', 'Error saving report.', 'error');
        });
    }
    
    // Method to show toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }


    handleDownloadPDF() {
        if (!this.jsPDF) {
            console.error('jsPDF library is not loaded.');
            return;
        }
     
        // Initialize a new jsPDF document
        const doc = new this.jsPDF();
     
        // Set the title and summary on the same line as the table
        const title = 'Report: ' + this.objectName;
        const date = new Date().toLocaleDateString();
        const summary = `Report Generated On: ${date}`;
     
        doc.text(title, 10, 10);
        doc.text(summary, 10, 20);
        
        // Define headers and data for the table
        const headers = this.columns.map(col => col.label);
        const data = this.filteredData.map(record => 
            this.columns.map(col => record[col.fieldName] || '')
        );
     
        // Add the table using autoTable
        doc.autoTable({
            head: [headers], // Column headers
            body: data,      // Data for each row
            startY: 30,  // Position table after the title/summary
            theme: 'grid',   // Add borders to the table
            headStyles: { fillColor: [0, 255, 255], textColor: [0, 0, 0] },
            styles: {
                cellPadding: 3,
                halign: 'center',  // Center align text in the table cells
                valign: 'middle',
                lineWidth: 0.2,
                lineColor: [0, 0, 0]  // Set border color to black
            },
        });
     
        // Save the PDF
        doc.save(this.objectName + ' Report.pdf');
    }

    handleDownloadCSV() {
        const headers = this.columns.map(col => col.label).join(',');
        const rows = this.filteredData.map(record =>
            this.columns.map(col => `"${(record[col.fieldName] || '').toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', this.objectName + ' Report.csv');
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link); // Remove the link when done
    }

}