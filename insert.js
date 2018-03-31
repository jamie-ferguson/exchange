const request = require('request');
const mysql = require('mysql');
const config = require('./.env.json');


const url = 'http://data.fixer.io/api/latest';
const parameters = { access_key:config.fixer.access_key, format:1};

request({url:url, qs:parameters}, function(error, response, body) {
	console.log('error:', error); // Print the error if one occurred
	console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
	console.log('body:', body); // Print the json response.

	bodyObj = JSON.parse(body);

	var con = createSQLCon();

	var sqlIns = createSQLString(bodyObj);
	insertSQL(con, sqlIns);

	// var sqlSel = "SELECT ID, Created_at, Timestamp, from_unixtime(timestamp,'%Y-%m-%d %h:%i:%s') AS Time, ALLEK FROM Rates";
	// selectSQL(con, sqlSel);

});


// function to create the mysql connection using the environment vars
function createSQLCon() {
	const con = mysql.createConnection(config.database);
	return con;
}


function createSQLString(body) {
	console.log('typeof body:', typeof body);
	console.log('createSQLString body:', body);
	console.log('createSQLString body.success:', body.success);
	console.log('createSQLString body.rates:', body.rates);
	// Update for the Albanian Lek
	body.rates["ALLEK"] = body.rates["ALL"];
	delete body.rates["ALL"];

	// build up the sql insert statement
	var timestamp = body.timestamp;
	var sql = "INSERT INTO Rates SET TIMESTAMP = " + timestamp + ", ";

	var arr = [];
	for (x in body.rates) {
		var key = x;
		var val = body.rates[x];
		var str = key + " = " + val;
		arr.push(str);
	}
	sql += arr.join();
	console.log(sql);

	return sql;
}


function insertSQL(con, sql) {
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");

		con.query(sql, function (err, result) {
		if (err) throw err;
			console.log("1 record inserted");
			process.exit();
		});
	});
}


function selectSQL(con, sql) {
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");

		con.query(sql, function (err, result, fields) {
			if (err) throw err;
			console.log(result);
		});
	});
}

