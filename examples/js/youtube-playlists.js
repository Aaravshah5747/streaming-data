const csv = require('csv-parser')
const fs = require('fs')
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

var results = [];
var items = [];

var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

var params = {
    TableName : "YouTube-playlists",
    KeySchema: [
        { AttributeName: "id", KeyType: "HASH"} //Partition key
    ],
    AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};

fs.createReadStream('output.csv')
  .pipe(csv(['id', 'username', 'display_name', 'created_at', 'channel_type', 'country', 'uploads', 'subscribers', 'views']))
  .on('data', (data) => results.push(data))
  .on('end', () => {
    fs.readFile('/Users/anikshah/Documents/Startup/client_secret_310625182788-m9rcct99gi02f3auae9719bg45ug1lul.apps.googleusercontent.com.json', function processClientSecrets(err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      createDynamoDBTable();
      // Authorize a client with the loaded credentials, then call the YouTube API.
      authorize(JSON.parse(content), getPlaylists);
    });
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getChannel(auth) {
  var service = google.youtube('v3');
  service.channels.list({
    auth: auth,
    part: 'snippet,contentDetails,statistics',
    forUsername: 'GoogleDevelopers'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var channels = response.data.items;
    if (channels.length == 0) {
      console.log('No channel found.');
    } else {
      console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                  'it has %s views.',
                  channels[0].id,
                  channels[0].snippet.title,
                  channels[0].statistics.viewCount);
    }
  });
}

function getPlaylists(auth) {
    var file = fs.createWriteStream('output_playlists.csv');
    file.on('error', function(err) { /* error handling */ });
    file.write("id, etag, publishedAt, channelId, title, total" + "\n");
    var service = google.youtube('v3');
    var totalPages = 0;
    var nextPageToken = '';
    results.forEach(function(channel) {
      service.playlists.list({
        auth: auth,
        part: 'snippet,contentDetails',
        maxResults: '50',
        channelId: channel['id']
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return;
        }
        var playlists = response.data;
        if (playlists.length == 0) {
            console.log('No playlist found.');
        } else {
            for (let p_index = 0; p_index < playlists.items.length; p_index++) {
                let playlist = playlists.items[p_index];
                file.write(playlist.id + ", " + playlist.etag + ", " + playlist.snippet.channelId + ", "
                    + playlist.snippet.publishedAt + ", " + playlist.snippet.title + ", " + playlist.contentDetails.itemCount + "\n");
            }

            totalPages = parseInt(playlists.pageInfo.totalResults / playlists.pageInfo.resultsPerPage);
            nextPageToken = playlists.nextPageToken;

            for (let p_index = 0; p_index < totalPages; p_index++) {
              service.playlists.list({
                      auth: auth,
                      part: 'snippet,contentDetails',
                      maxResults: '50',
                      pageToken: nextPageToken,
                      channelId: channel['id']
                }, function(err, response) {
                  if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                  }
                  var playlists = response.data;
                  if (playlists.length == 0) {
                      console.log('No playlist found.');
                  } else {
                      for (let pl_index = 0; pl_index < playlists.items.length; pl_index++) {
                          let playlist = playlists.items[pl_index];
                          file.write(playlist.id + ", " + playlist.etag + ", " + playlist.snippet.channelId + ", "
                                              + playlist.snippet.publishedAt + ", " + playlist.snippet.title + ", " + playlist.contentDetails.itemCount + "\n");
                          info = {};
                          info.etag = playlist.etag;
                          info.channelId = playlist.snippet.channelId;
                          info.publishedAt = playlist.snippet.publishedAt;
                          info.title = playlist.snippet.title;
                          info.count = playlist.contentDetails.itemCount;
                          var params = {
                              TableName: "YouTube-playlists",
                              Item: {
                                  "id":  playlist.id,
                                  "info":  info
                              }
                          };
                          docClient.put(params, function(err, data) {
                             if (err) {
                                 console.error("Unable to add movie", playlist.id, ". Error JSON:", JSON.stringify(err, null, 2));
                             } else {
                                 console.log("PutItem succeeded:", playlist.id);
                             }
                          });
                      }
                      nextPageToken = playlists.nextPageToken;
                  }
                });
              }
        }
      });
    });
}

function createDynamoDBTable() {
    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}