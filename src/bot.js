
'use strict'

const slack = require('slack')
const config = require('./config')
const randomWords = require('random-words')
const wordnet = require('wordnet')
const capitalize = require('string-capitalize')

let date_server_old = new Date()
let first = true
let check = true

let bot = slack.rtm.client()

bot.started((payload) => {
  this.self = payload.self
})

bot.message((msg) => {
	
	if(((addHoursDate(new Date()).getDate() - addHoursDate(date_server_old).getDate()) == 1 || first) && check){
		check = false;
		findRandomWord((word_of_the_day, definition) => {
			slack.chat.postMessage({
				token: config('SLACK_TOKEN'),
				username: 'Word Of The Day',
				icon_emoji: config('ICON_EMOJI'),
				channel: config('SLACK_CHANNEL'),
				text: '',
				attachments: JSON.stringify([{
					title: capitalize(word_of_the_day),
					text: definition,
					color: "danger"
				}])
			}, (err, data) => {
			    if (err) throw err
			})
		})
		
	}
})

	//Funcion para buscar la palabra en el diccionario
function findRandomWord(functionEnd){
	//Buscamos la palabra y su definicion de la palabra
	var word = randomWords({ exactly: 1 })[0];
	wordnet.lookup(word, function(err, definitions) {
		if(definitions){
			var text = "";
			definitions.forEach(function(definition) {
				text += ("- "+capitalize(definition.meta.synsetType) + " : "+ definition.glossary + "\n");
			});
			console.log(word);
			console.log(text);
			
			date_server_old = new Date();
			first = false;
			check = true;
			functionEnd(word, text);
		}
		else
			findRandomWord(functionEnd);
	});
}

function addHoursDate(date){
	var copiedDate = new Date(date.getTime());
	copiedDate.setHours(date.getHours() - 13);
	return copiedDate;
}

module.exports = bot
