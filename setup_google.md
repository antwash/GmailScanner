## Setup Google API Services
You'll need to create a Google Cloud Project and enable the Gmail API.

1. Visit the [Google Cloud Console](https://console.cloud.google.com/) Dashboard.
2. Create the new Project (name whatever) that'll be granted access to your email account.
   ![Create Project](./assets/create_project.gif)
3. Navigate to the API & Services>Library.
    ![Api&Service](./assets/search_service.gif)
4. Enable Gmail API for the project
   ![Enable GMail](./assets/enable_gmail_api.gif)
5. For authentication, we'll be using Oauth to access Google API services. From the Credentials window navigate to the **OAuth consent screen** tab and create the OAuth consent by adding your **Application name** and clicking save. 
6. Next, you'll create the Oauth client credentials, feel free to name the client whatever. 
   ![Create Credentials](./assets/create_creds.gif)
7. After a successful credential creation, a popup will appear with your ClientID & Client Secret. **Save both of them  somewhere we'll need them later!!**
