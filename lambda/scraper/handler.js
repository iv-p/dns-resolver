'use strict';
const rp = require('request-promise');
const $ = require('cheerio');
const url = 'https://www.publicdns.xyz/country/';
const baseUrl = 'https://www.publicdns.xyz';
const uuidv4 = require('uuid/v4');

const tableName = process.env.DNS_SERVERS_TABLE

var AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });

const IS_OFFLINE = process.env.IS_OFFLINE;
let ddb;
if (IS_OFFLINE === 'true') {
  ddb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  })
} else {
  ddb = new AWS.DynamoDB.DocumentClient();
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.handler = async (event) => {
  const html = await rp(url);
  const countriesNodes = $('div.col-12.col-lg-8 > ul > li > a', html)
  const countries = [];
  for (let i = 0; i < countriesNodes.length; i++) {
    const url = `${baseUrl}${countriesNodes[i].attribs.href}`
    const code = countriesNodes[i].attribs.href.split("/")[2].split(".")[0]
    countries.push({
      url,
      code,
      name: countriesNodes[i].children[0].data.toLocaleLowerCase()
    });
  }

  const promises = countries.map(async country => {
    await sleep(Math.random() * 1000 + 500)
    const html = await rp(country.url);
    const dnsNodes = $('div.col-12.col-lg-8 > table > tbody > tr > td > a', html)
    let servers = [];
    for (let i = 0; i < dnsNodes.length; i++) {
      servers = [...servers, dnsNodes[i].children[0].data]
    }
    return {
      ...country,
      servers
    }
  })

  const countryData = await Promise.all(promises)
  const servers = countryData.reduce((obj, country) => {
    obj[country.code] = country
    return obj
  }, {})

  const countriesMap = countryData.reduce((obj, country) => {
    obj[country.code] = country.name
    return obj
  }, {})

  const itemId = uuidv4()
  const item = {
    id: itemId,
    servers,
    countries: countriesMap
  }
  var params = {
    TableName: tableName,
    Item: item
  };
  ddb.put(params, err => {
    if (err) {
      console.log("Error", err);
    }
  });

  params = {
    TableName: tableName,
    Key: {
      id: 'current'
    },
    UpdateExpression: "set current_id = :id",
    ExpressionAttributeValues: {
      ":id": itemId
    }
  };
  ddb.update(params, err => {
    if (err) {
      console.log("Error", err);
    }
  })

  await sleep(1000)
  params = {
    TableName: tableName,
    Key: {
      id: 'current'
    }
  };
  ddb.get(params, (err, data) => {
    if (err) {
      console.log("Error", err);
    } else {
      console.log(data)
    }
  })

  return {
    statusCode: 200,
    body: JSON.stringify(item)
  };
};
