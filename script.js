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
    `;

    return row;
}

function clearFetchedRows() {
    tableBody.querySelectorAll('tr[data-source="fetched"]')
    .forEach((row) => row.remove());
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
}

connectButton.addEventListener("click", handleConnect);
apiKeyInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleConnect();
    }
});

let searchComingSoonShown = false;
let sortComingSoonShown = false;

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
    if (!sortComingSoonShown) {
        alert("Sorting is coming soon.");
        sortComingSoonShown = true;
    }
});
