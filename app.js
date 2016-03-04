var http = require('http');
var SlackClient = require('@slack/client');
var randomWords = require('random-words');
var wordnet = require('wordnet');
var capitalize = require('string-capitalize');
var RTM_EVENTS = SlackClient.RTM_EVENTS;
var CLIENT_EVENTS = SlackClient.CLIENT_EVENTS;
var RTM_CLIENT_EVENTS = CLIENT_EVENTS.RTM;
var token = process.env.SLACK_API_TOKEN || '';
var date_server_old = new Date();
var first = true;
var check = true;

//1. Se crea el cliente (tanto web como rtm)
var slackClientRtm = new SlackClient.RtmClient(token);//{logLevel: 'debug'}
var slackClientWeb = new SlackClient.WebClient(token);

	//Funcion para buscar la palabra en el diccionario
function findRandomWord(functionEnd){
	//4. Buscamos la palabra y su definicion de la palabra
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

//2. Evento para cuando se conecte al servidor
slackClientRtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function () {
	//console.log("Conectado");
});

//3. Evento que se ejecuta cada vez que se envia un mensaje al servidor (concurrencia)
slackClientRtm.on(RTM_CLIENT_EVENTS.RAW_MESSAGE, function () {
	if(((date_server_old.getDate() - new Date().getDate()) == 1 < new Date() || first) && check){
		check = false;
		findRandomWord(function(word_of_the_day, definition){
			//5. This will send the message 'this is a test message' to the channel identified by id 'C0CT96Q1Z' #id general = C025ZJYEE
			slackClientWeb.chat.postMessage('C025ZJYEE', null, {
				username: 'Word Of The Day',
				icon_emoji: ":rocket:",
				attachments: JSON.stringify([{
					title: capitalize(word_of_the_day),
					text: definition,
					color: "danger"
				}])
			});
		});
		
	}
});

//6. Se inicializa la conexion
slackClientRtm.start();


//I don't want this app to crash in case someone sends an HTTP request, so lets implement a simple server
//Lets define a port we want to listen to
const PORT = process.env.PORT || 3000;

//We need a function which handles requests and send response
function handleRequest(request, response){
  var quote = "El servidor Esta Activo.";
  response.end(quote);
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
  //Callback triggered when server is successfully listening. Hurray!
  console.log('Server listening on: http://localhost:%s', PORT);
});
