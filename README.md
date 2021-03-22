# discord-doggo

This is a bot for Discord that is the rewrite and continuation of [Discord Announcer](https://github.com/justin-guan/discord-announcer). This bot's primary feature is announcing when a user enters or leaves the voice channel that the bot is in. Help for commands can be found with `!help`.

- [Requirements](#requirements)
  - [Setting up Discord](#discord)
  - [Setting up Voice](#voice)
    - [VoiceRSS](#voiceRSS)
    - [Google Translate's Unofficial Speech API](#googleTranslate)
- [Running the Bot](#running)

<a name="requirements"></a>

## Requirements

Please use Node v14.15.0 or higher. See [the Nodejs website](https://nodejs.org/en) for more details on Node.js installation.

In order to host this bot, you must also set up a [discord bot](#discord). Additionally, a web API that produces voice as audio files must be made available. See [Setting up Voice](#voice) for more details.

<a name="discord"></a>

### Setting up Discord

1. First go to <a href=https://discordapp.com/developers/applications/me>Discord's Application Management page</a> to create a new application. Simply select "New Application".
2. Next, select the newly created application and choose to add a bot user to the application. This will create a bot user for the application.
3. A token associated with the bot should be available now. This token will be necessary when running the bot.

Note: The bot must be added to the server, which can be done by following the below link. The `CLIENT_ID` can also be found on the Discord Application Management page above. Additionally, this bot uses several basic permissions

```
https://discordapp.com/oauth2/authorize?client_id=<CLIENT_ID>&scope=bot&permissions=3501056
```

<a name="voice"></a>

### Setting up Voice

A web API that produces voice as audio files must be used in order for voice announcements to work. VoiceRSS and Google Translate's unofficial speech API are both valid APIs that work. Note that this API must return the audio file through a `GET` protocol, and must use a query parameter that takes in a string to produce the audio file.

<a name="voiceRSS"></a>

#### Setting up Voice RSS

1. Go to the <a href=http://www.voicerss.org/registration.aspx>Voice RSS website</a> and register for a Voice RSS account
2. After registering, an API Key will become available. This key will be necessary when running the bot.
3. Use the VoiceRSS API as the `VOICE_URL` environment variable. See [Running the Bot](#running) for details.

API Example:

```
http://api.voicerss.org/?key=YOUR_KEY_HERE&hl=en-us&c=mp3&f=ulaw_44khz_stereo&r=1&src=
```

<a name="googleTranslate"></a>

#### Setting up Google Translate's Unofficial Speech API

Google Translate's Unofficial Speech API is an **unofficial** API, so Google may discontinue it at any time. However, the way the API is available now works well for this bot.

1. Set the Google Translate Unofficial Speech API as the `VOICE_URL` environment variable. See [Running the Bot](#running) for details.

API Example:

```
https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=
```

<a name="running"></a>

## Running the Bot

1. Ensure that Node v14.15.0 or higher is installed. This can be checked by running `node -v`. See the <a href=https://nodejs.org/>node.js website</a> for more details on installing the latest version of node.
2. Run `npm install` to install all necessary dependencies. Some peer dependencies may be missing, these are not necessary to run the bot and can be ignored.
    1. Note for Windows, `msvs` may be required for `node-gyp` to build properly. See [this](https://stackoverflow.com/a/59882818) for help on resolving this issue.
4. Export the Discord Bot Token, the Voice API url, and the MongoDB url. This can be done as follows:

```sh
export VOICE_URL=<VOICE_URL>
export DISCORD_TOKEN=<DISCORD_TOKEN>
export MONGODB_URL=<MONGODB_URL>
```

Or in Windows:

```sh
set VOICE_URL=<VOICE_URL>
set DISCORD_TOKEN=<DISCORD_TOKEN>
set MONGODB_URL=<MONGODB_URL>
```
4. Build the project by running `npm run build`
5. Type `npm start` to start the bot now
