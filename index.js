const cheerio = require('cheerio')
const request = require('request')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const mkdirp = require('mkdirp')

var country = process.argv[2]

if (country === undefined) {
  country = 'Germany'
}

country = country.charAt(0).toUpperCase() + country.slice(1)

console.log('processing country: ' + country)

request('https://www.tesla.com/de_DE/findus/list/chargers/' + country, function (error, response, html) {
  if (!error && response.statusCode === 200) {
    const $ = cheerio.load(html)

    var dchargerList = []
    $('address').each(function (index, element) {
      // console.log(element);
      dchargerList[index] = {}
      dchargerList[index]['id'] = $(element).find('a').attr('href').split('/').pop()
      dchargerList[index]['url'] = 'https://www.tesla.com' + $(element).find('a').attr('href')
      dchargerList[index]['name'] = $(element).find('a').text()
      dchargerList[index]['street'] = $(element).find('span.street-address').text()
      dchargerList[index]['extended'] = $(element).find('span.extended-address').text()
      dchargerList[index]['locality'] = $(element).find('span.locality').text()
      dchargerList[index]['tel'] = $(element).find('span.tel :nth-child(2)').text()
    })

    console.log(dchargerList.length)

    var dataDirectory = path.join(process.cwd(), 'data', country)
    fs.existsSync(dataDirectory) || mkdirp.sync(dataDirectory)

    var filename = moment().format('YYYY-MM-DD') + '.json'
    fs.writeFileSync(path.join(dataDirectory, filename), JSON.stringify(dchargerList, null, 2))
  }
})
