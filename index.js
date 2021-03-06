const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require("body-parser");
const path = require('path');
const mysql = require('mysql');
const config = require('./.env.json');

const app = express();
app.use(bodyParser.urlencoded({extended:true}));

// set a new view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// get the port from the env vars
app.set('port', (process.env.PORT || 3002));


// home page route
app.get('/', (req, res) => {

	var con = createSQLCon();
	var sqlSel = "SELECT Code FROM Currencies ORDER BY Code ASC";
	selectSQL(con, sqlSel)
		.then(function(data){

			var currencyObj = {};
			for (var i = 0; i < data.length; i++) {
				currencyObj[i] = data[i].Code;
			}

			res.render('home', {
				currencies: JSON.stringify(currencyObj),
				convertURL: 'convert',
				query: false
			});

		}).catch(function(data){

		});


});



// convert route
app.post('/convert', (req, res) => {

	var fromCurrency = req.body.fromCurrency;
	var toCurrency = req.body.toCurrency;
	var amount = req.body.amount;

	var con = createSQLCon();
	// SELECT ID, date_format(Created_at, '%Y-%m-%d %H:%i:%s') as createdAt, Timestamp, from_unixtime(timestamp,'%Y-%m-%d %H:%i:%s') AS Time, "USD" AS fromCurrency, "GBP" AS toCurrency
	// FROM Rates
	// ORDER BY id DESC LIMIT 1;
	var sqlSel = "SELECT ID, date_format(Created_at, '%Y-%m-%d %H:%i:%s') as createdAt, Timestamp, from_unixtime(timestamp,'%Y-%m-%d %H:%i:%s') AS Time, " + fromCurrency + " AS fromCurrency, " + toCurrency + " AS toCurrency FROM Rates ORDER BY id DESC LIMIT 1";
	selectSQL(con, sqlSel)
		.then(function(data){

			var fromRate = data[0].fromCurrency;
			var toRate = data[0].toCurrency;

			var resultAmountGross = amount*fromRate/toRate;
			var resultAmount = resultAmountGross.toFixed(2)

			var result = {};
			result.createdAt = data[0].createdAt;
			result.amount = resultAmount;

			res.send(result);


		}).catch(function(data){


		});


});

// start the server
app.listen(app.get('port'), function(){
	console.log('Server started on port '+ app.get('port'));
});


// function to create the mysql connection using the environment vars
function createSQLCon() {
	const con = mysql.createConnection(config.database);
	return con;
}


function selectSQL(con, sql) {
	var promise = new Promise(function(resolve, reject){
		con.connect(function(err) {
			if (err) throw err;
			con.query(sql, function (err, result, fields) {
				if (err) throw err;
				var resultObj = JSON.parse(JSON.stringify(result));
				resolve(resultObj);
			});
		});

	});

	return promise;

}





