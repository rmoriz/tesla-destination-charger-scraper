const cheerio = require('cheerio')
const request = require('request')
const fs = require('fs')
const path = require('path')
const moment = require('moment')

request('https://www.tesla.com/de_DE/findus/list/chargers/Germany', function (error, response, html) {
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

    var dataDirectory = path.join(process.cwd(), 'data')
    fs.existsSync(dataDirectory) || fs.mkdirSync(dataDirectory)

    var filename = moment().format('YYYY-MM-DD') + '.json'
    fs.writeFileSync(path.join(dataDirectory, filename), JSON.stringify(dchargerList, null, 2))
  }
})
