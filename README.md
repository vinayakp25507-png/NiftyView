# MarketView

A responsive vanilla JavaScript stock dashboard that fetches and displays live quotes using the Twelve Data API.

## What this project does

- Takes an API key input from the user
- Fetches quote data for a selected free-tier stock list
- Renders stock symbol, company name, latest price, and percent change in a table
- Shows clear status messages for loading, success, invalid key, plan issues, and rate limits

## Current scope

- Implemented:
  - API key based connect flow
  - Live quote fetching from Twelve Data
  - Dynamic table rendering
  - Basic error handling and status display
- Placeholder UI only:
  - Search control (coming soon alert)
  - Sort control (coming soon alert)

## API details

- Provider: Twelve Data
- Base URL: `https://api.twelvedata.com`
- Endpoint used: `/quote`
- Docs: `https://twelvedata.com/docs`

## Tech stack

- HTML5
- CSS3
- JavaScript (ES6+, vanilla)

## Project structure

```text
.
├── index.html
├── style.css
├── script.js
└── README.md
```

## Run locally

1. Open `index.html` in a browser.
2. Enter your Twelve Data API key.
3. Click `Connect` to load stock quotes.

## Author

Vinayak Pachauri

2501010507

vinayak.p25507@nst.rishihood.edu.in