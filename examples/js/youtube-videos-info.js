const csv = require('csv-parser')
const fs = require('fs')
var readline = require('readline');
var {google} = require('googleapis');
var mysql = require('mysql');
var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var OAuth2 = google.auth.OAuth2;

var results = [];
var videos = [];

var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';


var params = {
    TableName : "YouTube-videos",
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

fs.createReadStream('output_playlists.csv')
  .pipe(csv(['id', 'etag', 'publishedAt', 'channelId', 'title', 'total']))
  .on('data', (data) => results.push(data))
  .on('end', () => {
    fs.readFile('/Users/anikshah/Documents/Startup/client_secret.json', function processClientSecrets(err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      createTable();
      // Authorize a client with the loaded credentials, then call the YouTube API.
      authorize(JSON.parse(content), getVideos);
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

function getVideos(auth) {
    var file = fs.createWriteStream('output_videos.csv');
    file.on('error', function(err) { /* error handling */ });
    file.write("id, etag, channelId, publishedAt, title, "
        + "duration, dimension, definition, licensedContent, views, likes, dislikes, favourites, comments" + "\n");
    var service = google.youtube('v3');
    var totalPages = 0;
    var nextPageToken = '';
    results = results.slice(1,2);
    results.forEach(function(playlist) {
      service.playlistItems.list({
        auth: auth,
        part: 'snippet,contentDetails',
        maxResults: '50',
        playlistId: playlist['id']
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return;
        }
        var playlistItems = response.data;
        if (playlistItems.length == 0) {
            console.log('No playlist found.');
        } else {
            videos = [];
            for (let p_index = 0; p_index < playlistItems.items.length; p_index++) {
                videos.push(playlistItems.items[p_index]);
            }

            totalPages = parseInt(playlistItems.pageInfo.totalResults / playlistItems.pageInfo.resultsPerPage);
            nextPageToken = playlistItems.nextPageToken;

            for (let p_index = 0; p_index < totalPages; p_index++) {
              service.playlistItems.list({
                      auth: auth,
                      part: 'snippet,contentDetails',
                      maxResults: '50',
                      playlistId: playlist['id'],
                      pageToken: nextPageToken
                }, function(err, response) {
                  if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                  }
                  var playlistItems = response.data;
                  if (playlistItems.length == 0) {
                      console.log('No playlist Item found.');
                  } else {
                      for (let pl_index = 0; pl_index < playlistItems.items.length; pl_index++) {
                          videos.push(playlistItems.items[p_index]);
                      }
                      nextPageToken = playlistItems.nextPageToken;
                  }
                });
            }
            console.log(videos.length);
            ids = [];
            for (let v_index = 0; v_index < videos.length; v_index++) {
                ids.push(videos[v_index].contentDetails.videoId);
            }
            service.videos.list({
                  auth: auth,
                  part: 'snippet,contentDetails, statistics',
                  maxResults: '50',
                  id: ids
            }, function(err, response) {
              if (err) {
                console.log('The API returned an error: ' + err);
                return;
              }
              var video_responses = response.data;
              if (video_responses.length == 0) {
                  console.log('No video found.');
              } else {
                  for (let v_index = 0; v_index < video_responses.items.length; v_index++) {
                    let info = video_responses.items[v_index];
                    file.write(info.id + ", " + info.etag + ", " + info.snippet.channelId + ", " + info.snippet.publishedAt + ", " + info.snippet.title + ", "
                          + info.contentDetails.duration + ", " + info.contentDetails.dimensions + ", " + info.contentDetails.definition + ", "
                          + info.contentDetails.licensedContent + ", " + info.statistics.viewCount + "," + info.statistics.likeCount + ", "
                          + info.statistics.dislikeCount + ", " + info.statistics.favoriteCount + ", " + info.statistics.commentCount + "\n");
                    info_db = {};
                    info_db.etag = info.etag;
                    info_db.channelId = info.snippet.channelId;
                    info_db.publishedAt = info.snippet.publishedAt;
                    info_db.title = info.snippet.title;
                    info_db.duration = info.contentDetails.duration;
                    info_db.dimensions = info.contentDetails.dimensions;
                    info_db.definition = info.contentDetails.definition;
                    info_db.licensedContent = info.contentDetails.licensedContent;
                    info_db.viewCount = info.statistics.viewCount;
                    info_db.likeCount = info.statistics.likeCount;
                    info_db.dislikeCount = info.statistics.dislikeCount;
                    info_db.favoriteCount = info.statistics.favoriteCount;
                    info_db.commentCount = info.statistics.commentCount;
                    var params = {
                        TableName: "YouTube-videos",
                        Item: {
                            "id":  info.id,
                            "info":  info_db
                        }
                    };
                    docClient.put(params, function(err, data) {
                       if (err) {
                           console.error("Unable to add video", info.id, ". Error JSON:", JSON.stringify(err, null, 2));
                       } else {
                           console.log("PutItem succeeded:", info.id);
                       }
                    });
                  }
              }
            });
        }
      });
    });
}

function createTable() {
    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}
