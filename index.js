const fs = require('fs'); // file system module
const readline = require('readline');
const { google } = require('googleapis');

const TOKEN_FILE = "token.json";
const CREDENTIALS_FILE = "credentials.json";
const USER_ID = 'me';
const LABEL_ID = "Label_11";    // ID for 'Recruiters' email label
/**
 * Set permission scope for user to perform the following authorized operation
 * Scopes: https://developers.google.com/gmail/api/auth/scopes
 */
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";
const QUESTION = "Visit the above URL, grant access and enter the generated code from the page here:";
const ERROR_TOKEN = "Error retrieving access token: ";
const ERROR_MESSAGE = "Error getting user emails: ";
const ERROR_MESSAGE_DETAIL = "Error getting message detailed information: ";


// Read credentials from file
fs.readFile(CREDENTIALS_FILE, (error, content) => {
  if (error) {
    return console.log(`ERROR: Couldn't read file ${CREDENTIALS_FILE}.`, error);
  }
  // convert content from bytes to JSON
  const credentials = JSON.parse(content);
  authorize_credentials(credentials, getAllEmails);
});

var oAuthClient;
function authorize_credentials(credentials, actionFunction) {
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  oAuthClient = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_FILE, (error, token) => {
      if (error) { return getNewToken(actionFunction) }

      oAuthClient.setCredentials(JSON.parse(token));
      actionFunction(oAuthClient);
    });
}

function getNewToken(actionFunction) {
  const authURL = oAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Authentication URL generated: ", authURL);
  rl.question(QUESTION, (code) => {
    rl.close();
    oAuthClient.getToken(code, (err, token) => {
      if (err) { 
        return console.error(ERROR_TOKEN, err); 
      }

      // Set and store the token to disk for later program executions
      oAuthClient.setCredentials(token);
      fs.writeFile(TOKEN_FILE, JSON.stringify(token), (err) => {
        if (err) { return console.error(err); } 
      });

      actionFunction();
    });
  });
}

function getAllEmails(pageToken = "") {
  const gMail = google.gmail({version: 'v1', auth: oAuthClient});

  gMail.users.messages.list({
    userId: USER_ID, labelIds: LABEL_ID, pageToken,
  }, (error, results) => {
    if (error) {
      return console.log(ERROR_MESSAGE, error);
    }
  
    // Iterate over each message to extract detail information 
    const messages = results.data.messages;
    messages.forEach(message => {
      const { id } = message;
      gMail.users.messages.get({
        id: id, userId: USER_ID,
      }, getEmailDetails);
    })

    if (results.data.nextPageToken) { 
      getAllEmails(results.data.nextPageToken); 
    }
  });
}

function getEmailDetails(error, emailDetails) {
  if (error) {
    return console.log(ERROR_MESSAGE_DETAIL, error);
  }

  const details = (emailDetails.data.payload.headers) ? emailDetails.data.payload.headers : [];

  details.forEach(details => {
    const { name, value } = details;

    if (name == 'From') {
      console.log(value);
    }
  })
  console.log("--------------------------------------------")
}