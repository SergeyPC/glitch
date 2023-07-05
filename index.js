const express = require('express');
const path = require('path');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

const api = require('./api');
const config = require('./config');
const User = require('./db/user');

User.createTable();

const app = express();
const port = 3000;

passport.use(
	'pipedrive',
	new OAuth2Strategy({
			authorizationURL: 'https://oauth.pipedrive.com/oauth/authorize',
			tokenURL: 'https://oauth.pipedrive.com/oauth/token',
			clientID: config.clientID || '',
			clientSecret: config.clientSecret || '',
			callbackURL: config.callbackURL || ''
		}, async (accessToken, refreshToken, profile, done) => {
			const userInfo = await api.getUser(accessToken);
			const user = await User.add(
				userInfo.data.name,
				accessToken,
				refreshToken
			);

			done(null, { user });
		}
	)
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(async (req, res, next) => {
	req.user = await User.getById(1);
	next();
});

// `Step 2` Code goes here... 👇
app.get('/auth/pipedrive', passport.authenticate('pipedrive'));
app.get('/auth/pipedrive/callback', passport.authenticate('pipedrive', {
    session: false,
    failureRedirect: '/',
    successRedirect: '/'
}));
app.get('/', async (req, res) => {
    if (req.user.length < 1) {
        return res.redirect('/auth/pipedrive');
    }

    try {
        const deals = await api.getDeals(req.user[0].access_token);

        res.render('deals', {
            name: req.user[0].username,
            deals: deals.data
        });
    } catch (error) {
        return res.send(error.message);
    }
});

app.get('/deals/:id', async (req, res) => {
    const randomBoolean = Math.random() >= 0.5;
    const outcome = randomBoolean === true ? 'won' : 'lost';

    try {
        await api.updateDeal(req.params.id, outcome, req.user[0].access_token);

        res.render('outcome', { outcome });
    } catch (error) {
        return res.send(error.message);
    }
});

app.get('/T-form', async (req, res) => {
     let answer = [
        {
            "id": 1,
            "header": "GTA 22 Blue Auto",
            "project": "New cars",
            "manufacturer": "Molksvagen LLC",
            "delivery_date": "2021-08-31T07:00:00.000Z",
            "status": {
                "color": "yellow",
                "label": "ASSEMBLING"
            },
            "delivery_company": "Jungle Prime",
            "tracking": {
                "markdown": true,
                "value": "[Open tracking link](https://pipedrive.com)"
            },
            "note": {
                "markdown": true,
                "value": "Meeting next week to sign the [insurance contract](https://pipedrive.com)."
            },
            "extras": [
                "Cruise control",
                "Rain detector",
                "Lane assist"
            ],
            "delivery_cost": {
                "code": "USD",
                "value": 2000
            }
        },
        {
            "id": 2,
            "header": "BNW X500",
            "project": "New cars",
            "manufacturer": "Molksvagen LLC",
            "delivery_date": "2021-08-31T07:00:00.000Z",
            "status": {
                "color": "red",
                "label": "DELAYED"
            },
            "delivery_company": "Jungle Prime",
            "tracking": {
                "markdown": true,
                "value": "[Open tracking link](https://pipedrive.com)"
            },
            "note": {
                "markdown": true,
                "value": "Meeting next week to sign the [insurance contract](https://pipedrive.com)."
            },
            "extras": [
                "Cruise control",
                "Rain detector",
                "Lane assist"
            ],
            "delivery_cost": {
                "code": "USD",
                "value": 2000
            }
        },
        {
            "id": 3,
            "header": "Dorsche 911",
            "project": "New cars",
            "manufacturer": "Molksvagen LLC",
            "delivery_date": "2021-08-31T07:00:00.000Z",
            "status": {
                "color": "green",
                "label": "EN ROUTE"
            },
            "delivery_company": "Jungle Prime",
            "tracking": {
                "markdown": true,
                "value": "[Open tracking link](https://pipedrive.com)"
            },
            "note": {
                "markdown": true,
                "value": "Meeting next week to sign the [insurance contract](https://pipedrive.com)."
            },
            "extras": [
                "Cruise control",
                "Rain detector",
                "Lane assist"
            ],
            "delivery_cost": {
                "code": "USD",
                "value": 2000
            }
        }
    ];
  
  try {
      res.render('data',answer)
    } catch (error) {
        return res.send(error.message);
    }
  
  
  
  

  
  
  /* try {
      res.render({
        "data":{
          "company": "Sigma Software"
        }
      });

    } catch (error) {
        return res.send(error.message);
    }*/
    
/*try {
      let resp = {
        "data":{
          "company": "Sigma Software"
        }
      };
      
      return res.send(resp);

    } catch (error) {
        return res.send(error.message);
    }*/
/*
    try {
      res.render('data', [{
        "company":'Sigma Software'
      }
      ])
    } catch (error) {
        return res.send(error.message);
    }*/
});

// End of `Step 2`
app.listen(port, () => console.log(`🟢 App has started. \n🔗 Live URL: https://${process.env.PROJECT_DOMAIN}.glitch.me`));