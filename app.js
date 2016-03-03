var http = require('http');
var SlackClient = require('slack-client');
var randomWords = require('random-words');
var wordnet = require('wordnet');
var capitalize = require('string-capitalize');
var CLIENT_EVENTS = SlackClient.CLIENT_EVENTS;
var RTM_CLIENT_EVENTS = CLIENT_EVENTS.RTM;
var token = process.env.SLACK_API_TOKEN || 'xoxp-2203644484-15987698708-23824165876-fe4f538ab5';
var date_server_old = new Date();
var first = true;

//1. Se crea el cliente (tanto web como rtm)
var slackClientRtm = new SlackClient.RtmClient(token);//{logLevel: 'debug'}
var slackClientWeb = new SlackClient.WebClient(token);
	
//2. Creamos el evento para la autenticacion
//slackClientRtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData){});

//3. you need to wait for the client to fully connect before you can send messages
//RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED   //'message'
slackClientRtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function (message) {
	if(/*message.channel.id === '' &&*/ date_server_old < new Date() || first){
		//4. Buscamos la palabra y su definicion de la palabra
		var word_of_the_day = randomWords({ exactly: 1 })[0];
		console.log(capitalize(word_of_the_day));
		wordnet.lookup(word_of_the_day, function(err, definitions) {
			if(definitions){
				var text = "";
				definitions.forEach(function(definition) {
					text += ("- "+capitalize(definition.meta.synsetType) + " : "+ definition.glossary + "\n");
				});
				console.log(text);

				//5. This will send the message 'this is a test message' to the channel identified by id 'C0CT96Q1Z' #id general = C025ZJYEE
				//console.log("ENVIADO");
				/*slackClientWeb.chat.postMessage('C0CT96Q1Z', null, {
					username: 'Word Of The Day',
					attachments: JSON.stringify([{
						title: capitalize(word_of_the_day),
						text: text,
						color: "danger"
					}])
				});*/
				
				date_server_old = new Date();
				first = false;
			}
			else
				console.log(err);
		});
	}
});

slackClientRtm.on('error', function (error) {
	console.error('Error:', error);
});
	
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