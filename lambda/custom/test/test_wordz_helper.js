'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const expect = chai.expect
const WordzHelper = require('../wordz_helper')
const fixtures = require('./lexicon_fixture.json')

chai.config.includeStack = true

describe('WordzHelper', function () {
  const subject = new WordzHelper()
  let term
  describe('#getWordInfos', function () {
    context('with a valid term', function () {
      it('returns matching term', function () {
        term = 'Wetter'
        const value = subject.requestWordInfos(term).then(function (obj) {
          return Object.keys(obj)[0]
        })
        return expect(value).to.eventually.eq(term)
      })
    })
  })
  describe('#isSubject', function () {
    context('with a subject term', function () {
      var response = {
        'Wetter': [
          {
            'features': 'SUB:AKK:SIN:NEU',
            'stem': 'Wetter'
          }
        ]
      }
      it('formats the response as expected', function () {
        expect(subject.formatSubstantive(response)).to.eq(
          'Wetter ist ein Substantiv.'
        )
      })
    })
    context('with a non Subject term', function () {
      var response = {
        'rein': fixtures['rein']
      }
      it('formats the response as expected', function () {
        expect(subject.formatSubstantive(response)).to.eq(
          'rein ist kein Substantiv.'
        )
      })
    })
  })
  describe('#matchArticle', function () {
    var response = {
      'Mann': fixtures['Mann']
    }
    context('with one correct of two article options', function () {
      it('returns the right choice', function () {
        expect(subject.matchArticle(response, 'Der', 'Das')).to.eq(
          'Der Mann ist richtig.'
        )
      })
    })
    context('with no correct of two article options', function () {
      it('returns a corrective answer', function () {
        expect(subject.matchArticle(response, 'Die', 'Das')).to.eq(
          'Weder noch. Es müsste lauten: der Mann oder dem Mann'
        )
      })
    })
    context('with Auto and options Das and Die', function () {
      var autoResponse = {
        'Auto': fixtures['Auto']
      }
      it('returns Das Auto', function () {
        expect(subject.matchArticle(autoResponse, 'Die', 'Das')).to.eq(
          'Das Auto ist richtig.'
        )
      })
    })
    context('with Agentur and options Der and Dem', function () {
      var agenturResponse = {
        'Agentur': fixtures['Agentur']
      }
      it('returns Der Agentur', function () {
        expect(subject.matchArticle(agenturResponse, 'Der', 'Dem')).to.eq(
          'Der Agentur ist richtig.'
        )
      })
    })
    context('with Agentur and options Der and Dem', function () {
      var agenturResponse = {
        'Agentur': fixtures['Agentur']
      }
      it('returns Der Agentur', function () {
        expect(subject.matchArticle(agenturResponse, 'Der', 'Dem')).to.eq(
          'Der Agentur ist richtig.'
        )
      })
    })
    context('with Agentur and options Der and Die', function () {
      var agenturResponse = {
        'Agentur': fixtures['Agentur']
      }
      it('returns Der and Die Agentur', function () {
        expect(subject.matchArticle(agenturResponse, 'Der', 'Die')).to.eq(
          'Beides ist richtig.'
        )
      })
    })
  })
})
