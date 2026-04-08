const FREE_TIER_STOCKS = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "WMT", name: "Walmart Inc." },
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "PG", name: "Procter & Gamble Co." },
];
const MAX_STOCKS_PER_CONNECT = 8;

const tableBody = document.getElementById("stock-table-body");
const apiKeyInput = document.getElementById("api-key-input");
const connectButton = document.getElementById("api-key-btn");
const statusEl = document.getElementById("api-key-status");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const themeToggle = document.getElementById("theme-toggle");
const wishlistList = document.getElementById("wishlist-list");
const wishlistEmpty = document.getElementById("wishlist-empty");
const THEME_KEY = "marketview-theme";
const WISHLIST_KEY = "marketview-wishlist";
let wishlist = [];

function applyTheme(theme) {
    const resolvedTheme = theme === "dark" ? "dark" : "light";
    document.body.setAttribute("data-theme", resolvedTheme);
    themeToggle.textContent = resolvedTheme === "dark" ? "Light Mode" : "Dark Mode";
    themeToggle.setAttribute(
        "aria-label",
        resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
    );
    themeToggle.setAttribute("aria-pressed", String(resolvedTheme === "dark"));
}

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
        applyTheme(savedTheme);
        return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
}

function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "api-key-status" + (type ? " " + type : "");
}

function parseNumber(value) {
    const numeric = Number(
    String(value || "")
        .replace(/,/g, "")
        .trim(),
    );
    return Number.isFinite(numeric) ? numeric : null;
}

function toCurrency(value) {
    if (value == null) {
        return "--";
    }

    return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function toPercent(value) {
    if (value == null) {
        return "--";
    }

    const sign = value > 0 ? "+" : "";
    return sign + value.toFixed(2) + "%";
}

function createFetchedRow(stock, price, changePercent) {
    const row = document.createElement("tr");
    row.dataset.source = "fetched";
    row.dataset.symbol = stock.symbol;
    row.dataset.name = stock.name;
    row.dataset.price = String(price);
    row.dataset.changePercent = String(changePercent);
    const isWishlisted = Boolean(wishlist.find((item) => item.symbol === stock.symbol));

    const changeClass = changePercent >= 0 ? "positive" : "negative";
    const arrow = changePercent >= 0 ? "▲" : "▼";

    row.innerHTML = `
        <td>
            <div class="stock-ticker">${stock.symbol}</div>
            <div class="stock-name">${stock.name} - Fetched</div>
        </td>
        <td>
            <span class="stock-price">${toCurrency(price)}</span>
        </td>
        <td>
            <span class="stock-change ${changeClass}">
                <span class="arrow">${arrow}</span> ${toPercent(changePercent)}
            </span>
        </td>
        <td>
            <button class="wishlist-btn" type="button" ${isWishlisted ? "disabled" : ""}>
                ${isWishlisted ? "Added" : "Add"}
            </button>
        </td>
    `;

    return row;
}

function clearFetchedRows() {
    tableBody.querySelectorAll('tr[data-source="fetched"]')
    .forEach((row) => row.remove());
}

function applySortToFetchedRows() {
    const sortValue = sortSelect.value;
    if (!sortValue) {
        return;
    }

    const rows = Array.from(tableBody.querySelectorAll('tr[data-source="fetched"]'));
    if (rows.length <= 1) {
        return;
    }

    const getText = (row, key) => String(row.dataset[key] || "").toLowerCase();
    const getNumber = (row, key) => Number(row.dataset[key] || 0);

    const comparators = {
        "name-asc": (a, b) => getText(a, "name").localeCompare(getText(b, "name")),
        "name-desc": (a, b) => getText(b, "name").localeCompare(getText(a, "name")),
        "price-high": (a, b) => getNumber(b, "price") - getNumber(a, "price"),
        "price-low": (a, b) => getNumber(a, "price") - getNumber(b, "price"),
        "change-high": (a, b) => getNumber(b, "changePercent") - getNumber(a, "changePercent"),
        "change-low": (a, b) => getNumber(a, "changePercent") - getNumber(b, "changePercent"),
    };

    const sortedRows = rows.sort(comparators[sortValue] || comparators["name-asc"]);
    const fragment = document.createDocumentFragment();
    sortedRows.forEach((row) => fragment.appendChild(row));
    tableBody.appendChild(fragment);
}

function saveWishlist() {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

function renderWishlist() {
    wishlistList.innerHTML = "";

    if (!wishlist.length) {
        wishlistEmpty.style.display = "block";
        wishlistList.style.display = "none";
        return;
    }

    wishlistEmpty.style.display = "none";
    wishlistList.style.display = "flex";

    const itemsMarkup = wishlist.map((item) => `
        <li class="wishlist-item" data-symbol="${item.symbol}">
            <div class="wishlist-stock">
                <div class="wishlist-symbol">${item.symbol}</div>
                <div class="wishlist-name">${item.name}</div>
            </div>
            <button class="wishlist-remove" type="button" data-action="remove">Remove</button>
        </li>
    `).join("");

    wishlistList.innerHTML = itemsMarkup;
}

function loadWishlist() {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) {
        wishlist = [];
        renderWishlist();
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        wishlist = Array.isArray(parsed) ? parsed.filter((item) => item?.symbol && item?.name) : [];
    } catch {
        wishlist = [];
    }

    renderWishlist();
}

function addToWishlist(stock) {
    const alreadyExists = wishlist.find((item) => item.symbol === stock.symbol);
    if (alreadyExists) {
        return false;
    }

    wishlist = [...wishlist, stock];
    saveWishlist();
    renderWishlist();
    return true;
}

function removeFromWishlist(symbol) {
    wishlist = wishlist.filter((item) => item.symbol !== symbol);
    saveWishlist();
    renderWishlist();
}

async function fetchQuote(apiKey, symbol) {
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed (${response.status}).`);
    }

    const payload = await response.json();

    if (payload.status === "error") {
        const rawMessage = String(payload.message || "Unknown API error");
        const message = rawMessage.toLowerCase();

        if ((message.includes("exceed") && (message.includes("credit") || message.includes("quota"))) || message.includes("too many requests")){
            return { rateLimited: true, errorMessage: rawMessage };
        }

        if(message.includes("plan") || message.includes("not available") || message.includes("upgrade")) {
            return{ 
                planIssue: true, errorMessage: rawMessage 
            };
        }

        if (message.includes("api key") || message.includes("invalid")) {
            return { authIssue: true, errorMessage: rawMessage };
        }

        return { apiError: true, errorMessage: rawMessage };
    }

    const price = parseNumber(payload.close || payload.price);
    let changePercent = parseNumber(
        String(payload.percent_change || "").replace("%", ""),
    );

    if (changePercent == null) {
        const change = parseNumber(payload.change);
        const previousClose = parseNumber(payload.previous_close);
        if (change != null && previousClose != null && previousClose !== 0) {
        changePercent = (change / previousClose) * 100;
        }
    }

    if (price == null) {
        return null;
    }

    return {
        price,
        changePercent: changePercent ?? 0,
    };
}

async function handleConnect() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        setStatus("Enter an API key first.", "error");
        return;
    }

    connectButton.disabled = true;
    connectButton.textContent = "Connecting...";
    setStatus(`Fetching up to ${MAX_STOCKS_PER_CONNECT} stocks...`, "info");

    clearFetchedRows();

    let fetchedCount = 0;
    let rateLimited = false;
    let planIssue = false;
    let authIssue = false;
    let apiError = false;
    let lastErrorMessage = "";

    const stocksToFetch = FREE_TIER_STOCKS.slice(0, MAX_STOCKS_PER_CONNECT);

    for (const stock of stocksToFetch) {
        try {
        const result = await fetchQuote(apiKey, stock.symbol);
        if (result?.rateLimited) {
            rateLimited = true;
            lastErrorMessage = result.errorMessage || "";
            break;
        }

        if (result?.planIssue) {
            planIssue = true;
            lastErrorMessage = result.errorMessage || "";
            break;
        }

        if (result?.authIssue) {
            authIssue = true;
            lastErrorMessage = result.errorMessage || "";
            break;
        }

        if (result?.apiError) {
            apiError = true;
            lastErrorMessage = result.errorMessage || "";
            break;
        }

        if (!result) {
            continue;
        }

        const row = createFetchedRow(stock, result.price, result.changePercent);
        tableBody.appendChild(row);
        fetchedCount += 1;
        } catch (error) {
        lastErrorMessage = error?.message || "Network request failed.";
        setStatus(
            "Could not fetch some stocks. Check your key and try again.",
            "error",
        );
        }
    }

    if (authIssue) {
        setStatus(`Invalid API key. ${lastErrorMessage}`, "error");
    } else if (planIssue) {
        setStatus(
        `Your Twelve Data plan may not include one or more selected symbols. ${lastErrorMessage}`,
        "warn",
        );
    } else if (rateLimited) {
        setStatus(
        `Fetched ${fetchedCount} stocks before credits/rate limit. ${lastErrorMessage}`,
        "warn",
        );
    } else if (apiError) {
        setStatus(`API error: ${lastErrorMessage}`, "error");
    } else if (fetchedCount > 0) {
        setStatus(
        `Fetched ${fetchedCount} live stocks (max ${MAX_STOCKS_PER_CONNECT} per connect).`,
        "success",
        );
    } else {
        setStatus(
        "No live stocks fetched. Verify API key and free-tier symbol access.",
        "error",
        );
    }

    connectButton.disabled = false;
    connectButton.textContent = "Connect";
    applySortToFetchedRows();
}

connectButton.addEventListener("click", handleConnect);
apiKeyInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleConnect();
    }
});

let searchComingSoonShown = false;
searchInput.addEventListener("focus", () => {
    if (!searchComingSoonShown) {
        alert("Search is coming soon.");
        searchComingSoonShown = true;
    }
});

searchInput.addEventListener("keydown", (event) => {
    event.preventDefault();
    if (!searchComingSoonShown) {
        alert("Search is coming soon.");
        searchComingSoonShown = true;
    }
});

sortSelect.addEventListener("change", () => {
    applySortToFetchedRows();
});

tableBody.addEventListener("click", (event) => {
    const button = event.target.closest(".wishlist-btn");
    if (!button) {
        return;
    }

    const row = button.closest('tr[data-source="fetched"]');
    if (!row) {
        return;
    }

    const stock = {
        symbol: String(row.dataset.symbol || "").trim(),
        name: String(row.dataset.name || "").trim(),
    };

    if (!stock.symbol || !stock.name) {
        return;
    }

    const added = addToWishlist(stock);
    if (!added) {
        button.textContent = "Added";
        button.disabled = true;
        return;
    }

    button.textContent = "Added";
    button.disabled = true;
});

wishlistList.addEventListener("click", (event) => {
    const removeButton = event.target.closest('button[data-action="remove"]');
    if (!removeButton) {
        return;
    }

    const item = removeButton.closest(".wishlist-item");
    const symbol = String(item?.dataset.symbol || "");
    if (!symbol) {
        return;
    }

    removeFromWishlist(symbol);

    Array.from(tableBody.querySelectorAll('tr[data-source="fetched"]'))
    .filter((row) => row.dataset.symbol === symbol)
    .forEach((row) => {
        const rowButton = row.querySelector(".wishlist-btn");
        if (!rowButton) {
            return;
        }
        rowButton.textContent = "Add";
        rowButton.disabled = false;
    });
});

themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
});

initTheme();
loadWishlist();
