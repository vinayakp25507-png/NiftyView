# 📈 NiftyView

A responsive, feature-rich web application that enables users to track Indian stock market data in real time. Built with Vanilla JavaScript, it integrates the Alpha Vantage public API to fetch live stock prices and presents them in a clean, interactive interface with search, filter, sort, and watchlist capabilities. 

---

## 📌 Table of Contents

* [Overview](#overview)
* [Live Demo](#live-demo)
* [Features](#features)
* [Bonus Features](#bonus-features)
* [Technologies Used](#technologies-used)
* [API Information](#api-information)
* [How to Run the Project](#how-to-run-the-project)
* [Deployment](#deployment)
* [Implementation Details](#implementation-details)
* [Future Improvements](#future-improvements)
* [License](#license)

---

## 🔰 Overview

**NiftyView** is a front-end web application developed as part of a web development project. It allows users — particularly students, beginner traders, and finance enthusiasts — to monitor Indian stock prices from BSE (Bombay Stock Exchange) in real time.

Users can search for specific stocks, apply filters based on performance metrics, sort the results in various orders. The application is fully responsive and works seamlessly across mobile, tablet, and desktop screen sizes.

This project demonstrates practical knowledge of JavaScript fundamentals, asynchronous programming with the Fetch API, array Higher-Order Functions (HOFs), DOM manipulation, and responsive UI design.

---

## 🌐 Live Demo

> 🔗 *(Will add after deploying)*

---

## 🚀 Features

### 1. 🔍 Search Functionality

Users can search for stocks by name or symbol using the search bar. The search operates in real time and filters the displayed stock list as the user types.

### 2. 🎛️ Filtering

Users can filter stocks based on various criteria:

* **Top Gainers** — stocks with the highest positive percentage change
* **Top Losers** — stocks with the highest negative percentage change
* **Price Range** — filter stocks within a custom low-to-high price range

### 3. 📊 Sorting

Users can sort the stock list by:

* Price (Low to High / High to Low)
* Percentage Change (Best Performing / Worst Performing)
* Alphabetical Order (A–Z / Z–A)

### 4. ⭐ Watchlist (Favorites)

Users can add or remove stocks from a personal watchlist by clicking a bookmark/star icon on each stock card.

* A dedicated "Watchlist" view lets users quickly access their saved stocks.

### 5. 🌗 Dark Mode Toggle

A theme toggle button in the navigation bar allows users to switch between **Light Mode** and **Dark Mode**.

* CSS variables are used for seamless theme switching without page reload.

### 6. 📱 Responsive Design

The layout is fully responsive and adapts gracefully to different screen sizes:

* **Mobile** — stacked single-column card layout
* **Tablet** — two-column grid
* **Desktop** — multi-column grid with expanded data

CSS Flexbox and Grid are used throughout to ensure consistent layouts across devices.

### 7. ⏳ Loading Indicators

A spinner/loading skeleton is displayed while data is being fetched from the API. This ensures users receive clear visual feedback instead of staring at a blank screen.

* The loading state is toggled programmatically before and after each API call.

### 8. ⚠️ Error Handling

The application gracefully handles common failure scenarios:

* **API failures** — displays a user-friendly error message with a retry option
* **Empty results** — shows a "No stocks found" message when search or filter returns no results
* **Network issues** — catches `fetch` errors with `try/catch` and alerts the user appropriately

---

## ⭐ Bonus Features

| Feature                     | Description                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| **Loading Indicators**      | Spinners are shown during all API calls                                                     |
| **Local Storage Caching**   | Fetched API data is cached in `localStorage` with a timestamp to reduce redundant API calls |
| **TradingView Chart Embed** | A lightweight TradingView widget is embedded for a selected stock's price chart             |

---

## ⚙️ Technologies Used

| Technology       | Purpose                                                         |
| ---------------- | --------------------------------------------------------------- |
| **HTML**         | Page structure and semantic markup                              |
| **CSS**          | Styling, layout (Flexbox/Grid), animations, and theming         |
| **JavaScript**   | Application logic, DOM manipulation, event handling             |
| **Fetch API**    | Asynchronous HTTP requests to the stock market API              |
| **localStorage** | Client-side data persistence for watchlist and theme preference |

> 💡 No external JavaScript frameworks or libraries were used.

---

## 🌐 API Information

**API Provider:** Alpha Vantage

Alpha Vantage provides free access to real-time and historical stock market data, including price quotes, percentage change, trading volume, and more.

---

## ▶️ How to Run the Project

### Prerequisites

* A modern web browser (Chrome, Firefox, Edge, or Safari)
* A free Alpha Vantage API key
* Git installed on your system (optional, for cloning)

### Steps

**1. Clone the Repository**

```bash
git clone https://github.com/your-username/NiftyView.git
```

**2. Navigate to the Project Directory**

```bash
cd NiftyView
```

**3. Add Your API Key**

```javascript
const API_KEY = "YOUR_API_KEY_HERE";
```

**4. Open the Application**
Open `index.html` in your browser

---

## 📦 Deployment

The project can be deployed using:

* GitHub Pages
* Netlify
* Vercel

---

## 🧠 Implementation Details

### Fetch API for Data Retrieval

All stock data is retrieved asynchronously using `fetch()` with `async/await`.

### Array Higher-Order Functions (HOFs)

All search, filter, and sort operations are implemented using:

* `map()`
* `filter()`
* `sort()`

> ⚠️ No traditional loops (`for`, `while`) are used.

### Local Storage Usage

| Key              | Value                 |
| ---------------- | --------------------- |
| `watchlist`      | Saved stocks          |
| `theme`          | Dark/Light mode       |
| `cachedStocks`   | Cached API data       |
| `cacheTimestamp` | Cache expiry tracking |

---

## 🔮 Future Improvements

* Advanced charting
* User authentication
* Real-time updates
* Portfolio tracker
* Push notifications
* PWA support
* Multi-exchange support

---

## 📄 License

This project was developed for academic purposes and is not intended for commercial use.

---

*Built with ❤️ using HTML, CSS, and Vanilla JavaScript.*