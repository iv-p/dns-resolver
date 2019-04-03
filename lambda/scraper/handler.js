'use strict';
const rp = require('request-promise');
const $ = require('cheerio');
const url = 'https://www.publicdns.xyz/country/';
const baseUrl = 'https://www.publicdns.xyz';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.hello = async (event) => {
  const html = await rp(url);
  const countriesNodes = $('div.col-12.col-lg-8 > ul > li > a', html)
  const countries = [];
  for (let i = 0; i < countriesNodes.length; i++) {
    countries.push({
      url: `${baseUrl}${countriesNodes[i].attribs.href}`,
      name: countriesNodes[i].children[0].data
    });
  }

  const promises = countries.map(async country => {
    await sleep(Math.random() * 1000 + 500)
    const html = await rp(country.url);
    const dnsNodes = $('div.col-12.col-lg-8 > table > tbody > tr > td > a', html)
    let servers = [];
    for (let i=0; i < dnsNodes.length; i++) {
      servers = [...servers, dnsNodes[i].children[0].data]
    }
    return {
      ...country,
      servers
    }
  })

  const result = await Promise.all(promises)

  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
