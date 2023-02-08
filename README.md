# tweetfree
Twitter's API, reconstructed utilizing `puppeteer` for emulating user behavior, for free.

Features: tweet, heart, retweet, user info, tweet listener based on mentions;

As seen on [YouTube](https://youtu.be/kz8-puGf2nY)

# Usage
Boilerplate:

```js
    const tweetfree = require('./index');
    const tweetListener = require('./utils/search')
    // enable debug to see what's happening in the browser via GUI
    const client = new tweetfree({ debug: false });

    await client.init();
    await client.login({
        email: '',
        password: '',
        username: ''
    });

    console.log('Logged in!')

    await client.tweet({ content: 'this is a test' })
    await client.tweet({ content: 'second test' })

    // 2nd param is post id 
    await client.execute('heart', { user: 'elonmusk', id: '1619770090530181120' })
    await client.execute('retweet', { user: 'elonmusk', id: '1619770090530181120' })

    const data = await client.getUser({ user: 'elonmusk' });
    // {
    //   followers: '127.8M',
    //   following: '177',
    //   joinedAt: 'June 2009',
    //   tweets: '22.5K Tweets',
    //   verified: true
    // }
    console.log(data)

    // "3000" - the delay between each search fetch
    const tweetEmitter = new tweetListener(client, 3000);

    tweetEmitter.on('tweetCreate', async (tweet) => {
        // destroy the listener after receiving 1 tweet
        // WARNING: you will receive 20~ of the current tweets mentioning the username
        // WARNING: ^^ when running for the first time

        await tweetEmitter.stopListening();

        // create a tweet
        await client.tweet({ content: `hello ${tweet.author}, i have received your tweet saying: ${tweet.content}, turns out it had mentioned: ${tweet.mentioned}`})
    })
    // keep track of the stopping reason
    tweetEmitter.on('stop', ((reason) => console.log(reason)))
```

# The code doesn't keep track of sessions?
Yes, the code isn't able to receive the `auth_token` cookie becauase it's a HTTPOnly cookie. These can only be accessed via the extension APIs, therefore:
- install [EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg)
- log into twitter;
- open the extension;
- click the export icon;
- paste the code inside cookies.json.

Or, let the code log in everytime (might make your account look sus, amogus if you will.)

# Warning
The code was written purely for fun, not suited for big projects due to the limitations caused by the fact that it only works in 1 tab.

Feel free to modify the code to your desired needs, as it's made easy to do so.

# License
Free as long as you credit me :)
