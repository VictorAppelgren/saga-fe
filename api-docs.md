## 3. API Endpoints Reference

Below is a summary of all main endpoints:

### Root
- **GET /**
  - Returns API status and service name.

### Assets
- **GET /assets**
  - Lists all assets in the universe, with flags for strategy and report availability.

### Strategy
- **GET /strategy/{asset_id}**
  - Returns the strategy markdown and linked research domains for the given asset.
- **PUT /strategy/{asset_id}**
  - Updates the strategy markdown and research domains for the asset.
  - Request body: `{ "content": "...", "research_domains": ["..."] }`

### Research Domains
- **GET /research-domains**
  - Lists all research domains, with descriptions.
- **GET /research-domains/{domain_id}**
  - Returns details and tasks for a specific research domain.

### Articles
- **GET /articles?asset_id=EURUSD&limit=5**
  - Lists news articles for the asset (from Factiva and Perigon collections), newest first.
  - Optional filters: `asset_id`, `domain`, `keyword`, `limit`.
- **GET /articles/{article_id}**
  - Returns a specific news article by ID.

### Insights
- **GET /insights?asset_id=EURUSD&limit=5**
  - Lists insights for the asset, newest first.
  - Optional filters: `asset_id`, `domain`, `keyword`, `limit`.
- **GET /insights/{insight_id}**
  - Returns a specific insight by ID.

### Reports
- **GET /reports?asset_id=EURUSD&limit=5**
  - Lists reports for the asset, newest first.
- **GET /reports/latest/{asset_id}?format=markdown|html**
  - Returns the latest report for the asset (markdown or HTML).
- **GET /reports/{report_id}?format=markdown|html**
  - Returns a specific report by filename (markdown or HTML).

### Chat
- **POST /chat**
  - Sends a chat message (demo: echoes the message).
  - Request body:
    ```json
    {
      "message": "Hello Argos!",
      "asset_id": "EURUSD",
      "history": []
    }
    ```
  - Response: `{ "response": "Echo: ...", "asset_id": "...", "sources": [] }`

---

## 4. Notes
- All endpoints are unauthenticated for demo purposes.
- CORS is enabled for all origins.
- Data is loaded from local files and ChromaDB collections.
- For more details, see inline comments in `api_main.py`.

---