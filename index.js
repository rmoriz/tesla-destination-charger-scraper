const chalk = require('chalk');
const cheerio = require('cheerio');
const fs = require('fs');
const mkdirp = require('mkdirp');
const moment = require('moment');
const path = require('path');
const request = require('request');

let countries = process.argv.slice(2);

if (countries.length === 0) {
  countries = ['Germany'];
}

console.log(`processing countries: ${countries.join(', ')}`);
console.log(
  chalk.blue.bgWhite.bold(
    'Number of Tesla Destination Charger locations per country:'
  )
);

countries.forEach((country) => {
  const normalizedCountry = country.charAt(0).toUpperCase() + country.slice(1);

  request(`https://www.tesla.com/findus/list/chargers/${normalizedCountry}`, (error, response, html) => {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(html);

      const dchargerList = [];
      $('address').each((index, element) => {
        // console.log(element);
        dchargerList[index] = {
          id: $(element).find('a').attr('href').split('/').pop(),
          url: `https://www.tesla.com${$(element).find('a').attr('href')}`,
          name: $(element).find('a').text(),
          street: $(element).find('span.street-address').text(),
          extended: $(element).find('span.extended-address').text(),
          locality: $(element).find('span.locality').text(),
          tel: $(element).find('span.tel :nth-child(2)').text(),
        };
      });

      console.log(`${country}: ${chalk.red.bold(dchargerList.length)}`);

      const dataDirectory = path.join(process.cwd(), 'data', normalizedCountry);
      fs.existsSync(dataDirectory) || mkdirp.sync(dataDirectory);

      const filename = `${moment().format('YYYY-MM-DD')}.json`;
      fs.writeFileSync(
        path.join(dataDirectory, filename),
        JSON.stringify(dchargerList, null, 2)
      );
    }
  });
});
