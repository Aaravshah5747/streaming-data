const SocialBlade = require('../../dist'); // "socialblade"
const fs = require('fs')
const exec = require('child_process').exec;
var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var dynamodb = new AWS.DynamoDB();
var docClient = dynamodb.DocumentClient();

require('isomorphic-unfetch');

const client = new SocialBlade('cli_f0d30ff74a331ee97e486558',
'7574a0b5ff5394fd628727f9d6d1da723a66736f3461930c79f4080073e09e349f5e8e366db4500f30c82335aa832b64b7023e0d8a6c7176c7fe9a3909fa43b7');

// Costs 10 credits per page / i.e. per 100

function fetchChannels() {
    const top = async (total) => {
      const pages = Math.ceil(total / 100);
      results = [];
      channels = [];

      const args = " -H 'query: username' -H 'history: default' -H 'clientid: " + 'cli_f0d30ff74a331ee97e486558' +
      "' -H 'token: " + '7574a0b5ff5394fd628727f9d6d1da723a66736f3461930c79f4080073e09e349f5e8e366db4500f30c82335aa832b64b7023e0d8a6c7176c7fe9a3909fa43b7' +
      "' -X GET https://matrix.sbapis.com/b/youtube/statistics";

      for (let index = 0; index < pages; index++) {
        results.push(await client.youtube.top('subscribers', index + 1));
      }

      for (let page_index = 0; page_index < results.length; page_index++) {
        for (let index = 0; index < results[page_index].length; index++) {
            channel = results[page_index][index];
            channel['grade'] = "N/A";
//            channel_args = args;
//            exec('curl ' + channel_args.replace("username",channel['id']['username']), function (error, stdout, stderr) {
//                console.log('stdout: ' + stdout)
//                if (stdout != null && stdout['data'] != undefined && stdout['data']['misc'] != undefined
//                    && stdout['data']['misc']['grade'] != undefined && stdout['data']['misc']['grade']['grade'] != undefined) {
//                    channel['grade'] = stdout['data']['misc']['grade']['grade'];
//                } else {
//                    channel['grade'] = '';
//                }
//                console.log('stderr: ' + stderr);
//                if (error !== null) {
//                  console.log('exec error: ' + error);
//                }
//            });
            channels.push(channel);
        }
      }

      var file = fs.createWriteStream('output.csv');
      file.write("id, username, display_name, created_at, channel_type, country, uploads, subscribers, views" + "\n");
      file.on('error', function(err) { /* error handling */ });
      channels.forEach(function(channel) {
        file.write(channel['id']['id'] + ", " + channel['id']['username'] + ", " + channel['id']['display_name'] + ", "
            + channel['general']['created_at'] + ", " + channel['general']['channel_type'] + ", "  + channel['general']['geo']['country'] + ", "
            + channel['statistics']['total']['uploads'] + ", " + channel['statistics']['total']['subscribers'] + ", " + channel['statistics']['total']['views'] + "\n");
      });

      file.end();

      return results;
};

    top(500).then("done").catch(console.error);
}

fetchChannels();

var params = {
    TableName : "YouTube-channels",
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

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
