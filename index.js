const puppeteer = require('puppeteer');
const fs = require('fs');

module.exports = class Twitter {
    constructor({ debug }) {
        this.debug = debug;

        /**
         * @typedef { puppeteer.Page } page
        */

        this.xpaths = {
            'modal_helper': '//*[@id="modal-header"]/span/span',

            'login_button': '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[2]/div/div[1]/div/div/div/div',
            'login_email': '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div/div/div/div[5]/label/div/div[2]/div/input',
            'login_next_button': '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div/div/div/div[6]/div',
            'login_password': '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[1]/div/div/div[3]/div/label/div/div[2]/div[1]/input',

            'verification_username': '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[1]/div/div[2]/label/div/div[2]/div/input',
            'verification_next_button': '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div/div',

            'tweet_input': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[1]/div/div[3]/div/div[2]/div[1]/div/div/div/div[2]/div[1]/div/div/div/div/div/div[2]/div/div/div/div/label/div[1]/div/div/div/div/div/div[2]/div/div/div/div',
            'tweet_div': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[3]/div/div[2]/div[1]/div/div/div',
            'tweet_modal': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[1]/div/div[3]/div/div[2]/div[1]/div/div/div/div[2]/div[1]',
            'tweet_enter': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[3]/div/div[2]/div[1]/div/div/div/div[2]/div[3]/div/div/div[2]/div[3]',

            'overlay': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/section/div/div/div[1]/div/div/article',
            'heart': '//*[starts-with(@id, "id__")]/div[3]/div/div/div/div',
            'retweet': '//*[starts-with(@id, "id__")]/div[2]/div/div/div/div',
            'retweet_confirm': '//*[@id="layers"]/div[2]/div/div/div/div[2]/div/div[3]/div/div/div/div',

            'profile_overlay': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[3]/div/div/div/div',
            'following': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[3]/div/div/div/div/div[4]/div[1]/a/span[1]/span',
            'following_backup': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[3]/div/div/div/div[2]/div[5]/div[1]/a/span[1]/span',
            'followers': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[3]/div/div/div/div/div[4]/div[2]/a/span[1]/span',
            'joined': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[3]/div/div/div/div/div[3]/div/span/span',
            'tweets': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[1]/div/div[1]/div[1]/div/div/div/div/div/div[2]/div/div',
            'verification_badge': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[3]/div/div/div/div/div[2]/div[1]/div/div[1]/div/div/span[2]/div/div',

            'search_results': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[3]/div/section/div/div/div[9]',
            'search_bar': '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[1]/div[1]/div[1]/div/div/div/div/div[2]/div[2]/div/div/div/form/div[1]/div/div/div/label/div[2]/div/input'
            // 'ad': '//*[@id="layers"]/div[3]/div/div/div/div/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div[1]',
        };
        this.defaultType = { delay: 30 };
        this.sleep = (waitTimeInMs) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

        this.browser = null;
        this.page = null;
    }

    async init() {
        const options = { headless: true }

        if (this.debug) options.headless = false;

        this.browser = await puppeteer.launch(options);
        this.page = await this.browser.newPage();

        if (fs.existsSync('cookies.json')) {
            const cookies = fs.readFileSync('cookies.json', 'utf8');

            const deserializedCookies = JSON.parse(cookies);
            await this.page.setCookie(...deserializedCookies);
        }

        await this.page.goto('https://twitter.com/home');
    }

    async inputPassword(password) {
        const passwordInput = await this.page.waitForXPath(this.xpaths.login_password, { visible: true });

        await passwordInput.type(password, this.defaultType);
    }
    async xpathToContent(xpath) {
        try {
            const modal = await this.page.waitForXPath(this.xpaths[xpath], { visible: true, timeout: 3000 });
            const text = await this.page.evaluate((el) => el.textContent, modal);

            return text;
        } catch (e) {
            return 'Timed out';
        }
    }

    async login({ username, password, email }) {
        this.username = username;
        this.password = password
        this.email = email;

        const modal = await this.xpathToContent('modal_helper');

        if (!modal.includes('Sign in')) return;
        await this.page.goto('https://twitter.com/i/flow/login');

        const emailInput = await this.page.waitForXPath(this.xpaths.login_email, { visible: true });
        await emailInput.type(email, this.defaultType);

        const nextButton = await this.page.waitForXPath(this.xpaths.login_next_button, { visible: true });
        await nextButton.click();

        const usernameText = await this.xpathToContent('modal_helper');

        if (usernameText.includes('Enter your phone number or username')) {
            const usernameInput = await this.page.waitForXPath(this.xpaths.verification_username, { visible: true });
            await usernameInput.type(username, this.defaultType);

            const nextButtonVerify = await this.page.waitForXPath(this.xpaths.verification_next_button, { visible: true });
            await nextButtonVerify.click();
        }

        await this.inputPassword(password);

        const nextButtonLogin = await this.page.waitForXPath(this.xpaths.login_button, { visible: true });
        await nextButtonLogin.click();

        await this.sleep(2000);
   }

    async tweet({ content }) {
        const activeURL = await this.page.url();
        const url = `https://twitter.com/home`;

        if (activeURL !== url) await this.page.goto(url);

        await this.page.waitForXPath(this.xpaths.tweet_div);

        const tweetModal = await this.page.$x(this.xpaths.tweet_modal);
        await tweetModal[0].click()
        await tweetModal[0].type(content, this.defaultType)

        const nextButton = await this.page.waitForXPath(this.xpaths.tweet_enter, { visible: true });
        await nextButton.click();

        await this.sleep(500);
    }

    async execute(action, { user, id }) {
        await this.page.goto(`https://twitter.com/${user}/status/${id}`);
        await this.page.waitForXPath(this.xpaths.overlay);

        const tweetModal = await this.page.$x(this.xpaths[action]);
        await tweetModal[0].click()

        if(action === 'retweet'){
            const tweetModal = await this.page.$x(this.xpaths['retweet_confirm']);
            await tweetModal[0].click()
        }
    }

    async classToContent(el) {
        console.log(el)
        await this.page.evaluate((el) => {
            return document.querySelector(el).innerHTML;
        }, el);
    }

    async getTweets() {
        const activeURL = await this.page.url();
        const url = `https://twitter.com/search?q=%40${this.username}&src=typed_query&f=live`

        if (activeURL !== url) {
            await this.page.goto(url);
        } else {
            // search again
            const searchBar = await this.page.$x(this.xpaths.search_bar);
            await searchBar[0].focus()
            await searchBar[0].press('Enter');
        }

        await this.page.waitForXPath(this.xpaths.search_results);

        const file = fs.readFileSync('utils/search_scrape.js', 'utf-8');
        const content = await this.page.evaluate(file);

        return content;
    }
    async getUser({ user }) {
        await this.page.goto(`https://twitter.com/${user}`);
        await this.page.waitForXPath(this.xpaths.profile_overlay);

        const innerHtml = await this.page.waitForSelector('.css-1dbjc4n.r-13awgt0.r-18u37iz.r-1w6e6rj');
        const followersRaw = await innerHtml.evaluate(node => node.innerHTML);

        const date = await this.page.evaluate(() => {
            const elements = document.querySelectorAll('.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');
            const data = Array.from(elements).find((element) => {
                return element.innerHTML.includes('Joined');
            }).innerHTML;

            return data;
        })

        const tweets = await this.xpathToContent('tweets')
        const verified = (await this.page.$x(this.xpaths.verification_badge))[0] ? true : false

        const following = followersRaw.split('r-qvutc0">')[3].split('</')[0]
        const followers = followersRaw.split('r-qvutc0">')[8].split('</')[0]

        return {
            followers,
            following,
            joinedAt: date.split('Joined ')[1].split('</')[0],
            tweets,
            verified
        }
    }
}