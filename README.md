# Google Sheets Glide Table
CRUD operations for google sheets (revamped)

## Overview
This repository contains a revamped version of Google Apps Script helper function that makes manipulating Google Sheets data through script more convenient (you can check the first version [here](https://github.com/TeeMonk/google-sheets-tables)). 
The function provides create, read, update and delete methods for single sheet. The script assumes that data in the sheet contains proper column descriptions with unique header names in first row. Sheet data is transformed into array of record objects. Each record object represents single row, record properties (fields) represents columns.

## How To Use
1. Copy code from [GlideTable.js](https://github.com/TeeMonk/google-sheets-glide-table/blob/master/GlideTable.js) to your Google Apps Script editor. 
2. Create new `GlideTable` object, pass Google `sheet` object as an argument.
```javascript
const sheet = SpreadsheetApp.getActive().getSheetByName('Sheet1');
const cars = new GlideTable(sheet); 
```

The data in Sheet1 need to have column descriptions:
![sample data](https://github.com/TeeMonk/google-sheets-glide-table/blob/master/SampleData.JPG "sample data")

## GlideTable Methods

### `getRecord(field, value)`
Finds first matched record for indicated field and value and returns **copy** of record object. Field represents sheet column, value represents sheet cell value in that column.
#### *Arguments:*
- **`field`** *string* - Record field to search in (represents sheet column).
- **`value`** *string* - Field value to search for (represents sheet cell value).
#### *Returns:*
- **`record`** (object) - New object representing table record.
#### *Example:*
```javascript
  let car;
  
  car = cars.getRecord('Model', 'Capri')
  console.log(car);
  // >> { Brand: 'Ford', Model: 'Capri', Year: 2001, Price: 200 }
  
  car = cars.getRecord('Brand', 'Ferrari'); // no such car in table
  console.log(car); 
  // >> undefined
```
### `getRecords(query)`
Finds all matching records in table based on key-value pairs in query object and returns array of **copies** of those records.
#### *Arguments:*
- **`query`** *string* - [Optional] Object containing query key-value pairs. Keys should match table fields (sheet columns). Value assossiated with the key can be a single value or array of values. If query argument is omitted, all records are returned. 
#### *Returns:*
- **`records`** *array* - Array of new objects representing table records.
#### *Example:*
```javascript
// get all records
const allCars = cars.getRecords(); // ommited query argument, all records are returned
console.log(allCars.length); 
// >> 10

// single value query - get records with Brand = 'Opel'
const querySingle = {'Brand':'Opel'};
const opels = cars.getRecords(querySingle);
console.log(opels); 
// >> [{ Brand: 'Opel', Model: 'Astra', Year: 2002, Price: 66 }, 
// >>  { Brand: 'Opel', Model: 'Vectra', Year: 2001, Price: 40 }]

// multiple values query - get records with Model = 'Clio' or 'Astra'
const queryMultiple = {'Model':['Clio', 'Astra']};
const hatchbacks = cars.getRecords(queryMultiple);
console.log(hatchbacks);
// >> [ { Brand: 'Renault', Model: 'Clio', Year: 2001, Price: 30 },
// >>   { Brand: 'Opel', Model: 'Astra', Year: 2002, Price: 66 } ]

// multiple fields and values query - get records with Year = 2001 and Brand = 'Opel' or 'Ford'
const from2001 = cars.getRecords({'Year': 2001,'Brand':['Opel', 'Ford']});
console.log(from2001);
// >> [ { Brand: 'Opel', Model: 'Vectra', Year: 2001, Price: 40 },
// >>   { Brand: 'Ford', Model: 'Capri', Year: 2001, Price: 200 },
// >>   { Brand: 'Ford', Model: 'Fiesta', Year: 2001, Price: 11 } ]
```  

### `addRecord(record)`
Appends record to source sheet. If any of record property does not match a table column in sheet respective sheet cell is filled with empty string. If there is no match with column for at least one record property, new row will not be added. 
#### *Arguments:*
- **`record`** *object* - Object containing query key-value pairs. Keys should match table fields (sheet columns).
#### *Returns:*
- **`isCreated`** *bool* - Indicates if operation was successful.
#### *Example:*
```javascript
const newCar = {};
newCar.Brand = 'Ferrari';
newCar.Model = 'Maranello';
newCar.Year = 2015
console.log(cars.addRecord(newCar));
// >> true
  
const ferrari = cars.getRecord('Model', 'Maranello')
console.log(ferrari);
// >> { Brand: 'Ferrari', Model: 'Maranelo', Year: 2015, Price: '' }
```

### `updateRecord(keyField, keyValue, changes)`
Finds first matching record in table and updates record's fields that match changes object properties.
#### *Arguments:*
- **`keyField`** *string* - Record field to search in, keyField should match sheet column.
- **`keyValue`** *string* - Field value to search for, keyValue should match sheet cell value.
- **`changes`** *object* - Object that contains key-value pairs. Property values are used to update record fields.

#### *Returns:*
- **`success`** *bool* - Indicates if operation was successful.
#### *Example:*
```javascript
const changes = {'Price': 300000, 'Year': 2020}
const success = updateRecord('Model', 'Maranelo', changes)
console.log(success);
// >> true

const ferrari = cars.getRecord('Model', 'Maranello')
console.log(ferrari);
// >> { Brand: 'Ferrari', Model: 'Maranelo', Year: 2020, Price: 300000 }
```

### `deleteRecord(field, value)`
Scan table's field for indicated value and deletes first matched record.
#### *Arguments:*
- **`field`** *string* - Record field to search in, keyField should match sheet column.
- **`value`** *string* - Field value to search for, keyValue should match sheet cell value.
#### *Returns:*
- **`success`** *bool* - Indicates if operation was successful.
#### *Example:*
```javascript
console.log(cars.getRecords().length); 
// >> 11
const success = deleteRecord('Model', 'Maranelo')
console.log(success); 
// >> true
console.log(cars.getRecords().length); 
// >> 10
```
