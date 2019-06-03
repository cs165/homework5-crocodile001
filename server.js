const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1PtjHJTiKGeAzs6HlTONItryjisBy5ogI5TqnpZMwoy4';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

var arr;

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(rows);

  // TODO(you): Finish onGet.

  arr = new Array();
  
  for (var i = 1; i < rows.length; i++) {
    var obj = new Object;
    for(var j = 0; j < rows[0].length; j++){
      obj[rows[0][j]] = rows[i][j];
    }
    arr.push(obj);
  }

  res.json(arr);
}
app.get('/api', onGet);


async function onPost(req, res) {
  const messageBody = req.body;

  // TODO(you): Implement onPost.

  const result = await sheet.getRows();
  const rows = result.rows;
  arr = new Array();

  // deal with case insensitive
  for(var k in messageBody){
    if(k != k.toLowerCase()){
      messageBody[k.toLowerCase()] = messageBody[k];
      delete messageBody[k];
    }
  }
  console.log(messageBody);

  for(var i =0; i < rows[0].length; i++){
    arr[i] = messageBody[rows[0][i].toLowerCase()];
  }

  outcome = await sheet.appendRow(arr);
  res.json(outcome);
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;

  // TODO(you): Implement onPatch.

  const result = await sheet.getRows();
  const rows = result.rows;
  var rowIndex = -1;
  var colIndex = -1;

  // deal with case insensitive
  for(var k in messageBody){
    if(k != k.toLowerCase()){
      messageBody[k.toLowerCase()] = messageBody[k];
      delete messageBody[k];
    }
  }
  console.log(messageBody);

  for(var i = 0; i < rows[0].length; i++){
    if(rows[0][i].toLowerCase() === column.toLowerCase()){
      colIndex = i;
      break;
    }
  }

  for (var j = 1; j < rows.length; j++) {
    if(rows[j][colIndex] === value){
      rowIndex = j;
      break;
    }
  }

  var arr = rows[rowIndex];

  if(arr == undefined){
    arr = [];
    console.log(arr);
  }

  for(var i = 0; i < rows[0].length; i++){
    if(messageBody[rows[0][i].toLowerCase()])
      arr[i] = messageBody[rows[0][i].toLowerCase()];
  }
  console.log(arr);
  console.log(rowIndex);

  var outcome = { "response": "success" };
  await sheet.setRow(rowIndex, arr);
  console.log(outcome);
  res.json(outcome);
}
app.patch('/api/:column/:value', jsonParser, onPatch);


async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;

  // TODO(you): Implement onDelete.

  const result = await sheet.getRows();
  const rows = result.rows;
  var colIndex = -1;

  for(var i = 0; i < rows[0].length; i++){
    if(rows[0][i].toLowerCase() === column.toLowerCase()){
      colIndex = i;
      break;
    }
  }

  var outcome = { "response": "success" };
  for (var j = 1; j < rows.length; j++) {
    if(rows[j][colIndex].toLowerCase() === value.toLowerCase()){
      outcome = await sheet.deleteRow(j);
      break;
    }
  }

  console.log(outcome);
  res.json(outcome);
  
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server listening on port ${port}!`);
});
