/**
* Creates table object from sheet content that have unique column descriptions in first row.  
* Record represents a sheet row, record fields represent sheet columns. 
* @param sheet             {object}    Google App Script sheet object.
* @returns GlideTable      {object}    Object representing sheet content.
*/
function GlideTable(sheet) {
    if (!sheet) return undefined;
    const data = sheet.getDataRange().getValues();
    const fields = data.shift();
    const records = data.map(row => {
        const record = {};
        fields.forEach(field => record[field] = row[fields.indexOf(field)]);
        return record;
    });

    /**
     * Finds first record in table for indicated field and value.
     * @param field         {string}    Record field to search in.
     * @param value         {string}    Field value to search for.
     * @returns record      {object}    Object representing table record.
     */
    this.getRecord = (field, value) => {
        if (!field || !value) return undefined;
        if (fields.includes(field) === false) return null;
        const recordPosition = records.findIndex(record => record[field] === value)
        if (recordPosition === -1) return undefined;
        return Object.assign({}, records[recordPosition]);
    }

    /**
     * Finds records in table based on key-value pairs in query object.
     * Value associated with key can be single value or array of values.   
     * @param query         {object}    Optional. Object containing query key-value pairs.
     * @returns records     {object[]}  Array of objects representing table records.
     */
    this.getRecords = (query) => {
        let result = records.map(record => Object.assign({}, record));
        if (!query) return result;
        for (const property in query) {
            if (fields.includes(property)) {
                if (Array.isArray(query[property])) {
                    const values = query[property];
                    result = result.filter(record => values.includes(record[property]));
                } else {
                    const value = query[property];
                    result = result.filter(record => record[property] === value);
                }
            }
        }
        return result;
    }

    /**
     * Appends record to source sheet.
     * @param record        {object}    Record object. Object properties should match record fields.
     * @returns isCreated   {bool}      Indicates if operation was successful.
     */
    this.addRecord = (record) => {
        if (!record) return false;
        // create row
        const newRow = new Array(fields.length);
        let isCreated = false;
        for (const [index, field] of fields.entries()) {
            if (record.hasOwnProperty(field)) {
                newRow[index] = record[field];
                isCreated = true;
            } else {
                record[field] = '';
            }
        }
        // update sheet and records 
        if (isCreated) {
            const range = sheet.getRange(records.length + 2, 1, 1, fields.length);
            range.setValues([newRow]);
            records.push(record);
        }
        return isCreated;
    }

    /**
     * Scan table's field for indicated value and updates record's fields that match changes object properties.
     * @param keyField      {string}   Record field to search in.
     * @param keyValue      {string}   Field value to search for.
     * @param changes       {object}   Object that contains key-value pairs. Object properties should match record's fields.
     * @returns success     {bool}     Indicates if update was successful.
     */
    this.updateRecord = (keyField, keyValue, changes) => {
        if (!keyField || !keyValue || !changes) return false;
        if (fields.includes(keyField) === false) return false;
        // find record
        const recordPosition = records.findIndex(record => record[keyField] === keyValue)
        if (recordPosition === -1) return false;
        // create updated row
        const updatedRow = new Array(fields.length);
        let isUpdated = false;
        for (const [index, field] of fields.entries()) {
            if (changes.hasOwnProperty(field)) {
                updatedRow[index] = changes[field]; // row - assign new value 
                records[recordPosition][field] = changes[field] // update record
                isUpdated = true;
            } else {
                updatedRow[index] = records[recordPosition][field]; // row - assign exisiting value
            }
        }
        // update sheet
        if (isUpdated === false) return false;
        const rowPosition = recordPosition + 2; // +1 for header, +1 for index base change
        sheet.getRange(rowPosition, 1, 1, updatedRow.length).setValues([updatedRow]);
        return true;
    }

    /**
     * Scan table's field for indicated value and deletes first matched record.
     * @param field         {string}   Record field to search in.  
     * @param value         {string}   Field value to search for.
     * @returns success     {bool}     Indicates if deletion was successful.
     */
    this.deleteRecord = (field, value) => {
        if (!field || !value) return false;
        if (fields.includes(field) === false) return false;
        // find record
        const recordPosition = records.findIndex(record => record[field] === value)
        if (recordPosition === -1) return false;
        // update sheet
        const rowPosition = recordPosition + 2; // +1 for header, +1 for index base change
        const rowDeleted = sheet.deleteRow(rowPosition);
        // update records
        if (rowDeleted) {
            records.splice(recordPosition, 1);
            return true;
        }
        return false;
    }

}
