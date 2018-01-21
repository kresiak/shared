import { Angular5Csv } from 'angular5-csv/Angular5-csv';

export function generateReport(data) {
    var header= {} // for the first line: showLabels doesn't work and solutions adding headers to options (as suggested in the link herafter) either https://stackoverflow.com/questions/44501578/angular2-csv-how-to-add-headers
    if (data && data.length > 0) {
        Object.keys(data[0]).forEach(k => header[k]= k)
        data.unshift(header)
    }        

    var options = {
        fieldSeparator: ';',
        quoteStrings: '"',
        decimalseparator: '.',
        showLabels: true,
        showTitle: false,
        useBom: true
    };

    new Angular5Csv(data, 'Krino report', options);
}