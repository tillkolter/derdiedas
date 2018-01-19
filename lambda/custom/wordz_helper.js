'use strict'
const https = require('https')

const HOSTNAME = 'wordz.kolter.it'
const ENDPOINT_PATH = '/wordinfo/'

function WordzHelper () { }

WordzHelper.prototype.requestWordInfos = function (term) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOSTNAME,
      port: 3696,
      path: `${ENDPOINT_PATH}?term=${encodeURIComponent(term)}`,
      method: 'GET'
    }

    var req = https.request(options, (res) => {
      res.on('data', (d) => {
        resolve(JSON.parse(d))
      })
    })

    req.on('error', function (e) {
      reject(e)
    })

    req.end()
  })
}

WordzHelper.prototype.getSubstantiveForms = function (response) {
  var result = []
  for (var word in response) {
    var morphVariants = response[word]
    for (var variant in morphVariants) {
      if (morphVariants[variant].features.split(':').includes('SUB')) {
        result.push(morphVariants[variant].features.split(':'))
      }
    }
  }
  return result
}

WordzHelper.prototype.formatSubstantive = function (response) {
  for (var word in response) {
    var morphVariants = response[word]
    for (var variant in morphVariants) {
      if (morphVariants[variant].features.split(':').includes('SUB')) {
        return word + ' ist ein Substantiv.'
      }
    }
  }
  return word + ' ist kein Substantiv.'
}

WordzHelper.prototype.articleGenusList = function (article) {
  var lowerArticle = article.toLowerCase()
  if (lowerArticle === 'der') {
    return ['FEM', 'MAS', 'NEU']
  } else if (lowerArticle === 'des') {
    return ['MAS', 'NEU']
  } else if (lowerArticle === 'dem') {
    return ['MAS', 'NEU']
  } else if (lowerArticle === 'die') {
    return ['FEM', 'MAS', 'NEU']
  } else if (lowerArticle === 'das') {
    return ['NEU']
  }
}

WordzHelper.prototype.getArticle = function (featureSet) {
  if (featureSet.includes('SUB')) {
    const casus = featureSet[1]
    const numerus = featureSet[2]
    const genus = featureSet[3]

    if (numerus === 'SIN') {
      if (['GEN', 'DAT'].includes(casus)) {
        if (['MAS', 'NEU'].includes(genus)) {
          if (casus === 'GEN') {
            return 'des'
          } else {
            return 'dem'
          }
        } else {
          return 'der'
        }
      }
      if (genus === 'MAS') {
        if (['NOM', 'AKK'].includes(casus)) {
          return 'der'
        }
      } else if (genus === 'FEM') {
        if (['NOM', 'AKK'].includes(casus)) {
          return 'die'
        }
      } else if (genus === 'NEU') {
        if (['NOM', 'AKK'].includes(casus)) {
          return 'das'
        }
      }
    } else if (['NOM', 'AKK'].includes(genus)) {
      return 'die'
    } else if (genus === 'GEN') {
      return 'der'
    } else {
      return 'den'
    }
  }
}

WordzHelper.prototype.matchArticle = function (response, article1, article2) {
  var featuresArray = WordzHelper.prototype.getSubstantiveForms(response)
  var matchingArticles = []
  for (var features in featuresArray) {
    matchingArticles.push(WordzHelper.prototype.getArticle(featuresArray[features]))
  }
  var word = Object.keys(response)[0]

  console.log('articles ' + matchingArticles)
  if (matchingArticles.includes(article1.toLowerCase())) {
    if (matchingArticles.includes(article2.toLowerCase())) {
      return 'Beides ist richtig.'
    } else {
      return article1 + ' ' + word + ' ist richtig.'
    }
  } else if (matchingArticles.includes(article2.toLowerCase())) {
    return article2 + ' ' + word + ' ist richtig.'
  } else {
    var unifiedArticles = matchingArticles.filter(function (item, pos) {
      return matchingArticles.indexOf(item) === pos
    })
    return 'Weder noch. Es müsste lauten: ' + unifiedArticles.map(function (x) { return x + ' ' + word }).join(' oder ')
  }
}

module.exports = WordzHelper
