from custom_logging import setup_logging
setup_logging(debug=False)
# api/main.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import os
import sys
import yaml
import json
import glob
from datetime import datetime
import re

from paths import get_asset_reports_dir

from model_config import get_complex_llm
import traceback

# Add parent directory to path to import db_loader
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db_loader import get_chromadb_client, get_or_create_collection, load_insights_collection
from custom_logging import get_logger

# Initialize logger
logger = get_logger('argos.api')

# Initialize a single shared Complex LLM instance for all endpoints
COMPLEX_LLM = get_complex_llm()
logger.info("[Argos][init] COMPLEX_LLM initialized and ready for use.")

# Initialize FastAPI
app = FastAPI(
    title="Argos API",
    description="Simple API serving Argos research data",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base directory for Argos data
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UNIVERSE_DIR = os.path.join(BASE_DIR, "universe")
RESEARCH_DOMAINS_DIR = os.path.join(BASE_DIR, "research_domains")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

# Models
class ResearchDomain(BaseModel):
    name: str
    description: Optional[str] = None

class Strategy(BaseModel):
    content: str
    research_domains: List[str]

# Utility functions
def get_latest_report_for_asset(asset_id: str) -> Optional[Dict[str, Any]]:
    """Get the latest report for a specific asset."""
    # Pattern like: eurusd_macro_report_20250619_090731.md
    pattern = f"{asset_id.lower()}_*_report_*.md"
    report_files = glob.glob(os.path.join(REPORTS_DIR, pattern))
    
    if not report_files:
        logger.info(f"No report files found for asset {asset_id} with pattern {pattern} in {REPORTS_DIR}")
        return None
        
    # Sort by creation date (newest first)
    latest_report = sorted(report_files, key=os.path.getctime, reverse=True)[0]
    
    # Extract date from filename
    date_match = re.search(r'(\d{8})_(\d{6})', latest_report)
    report_date = None
    if date_match:
        date_str = date_match.group(1)
        time_str = date_match.group(2)
        try:
            report_date = datetime.strptime(f"{date_str}_{time_str}", "%Y%m%d_%H%M%S")
        except ValueError:
            pass
    
    # Read report content
    with open(latest_report, 'r') as f:
        content = f.read()
        
    return {
        "id": os.path.basename(latest_report),
        "asset_id": asset_id,
        "content": content,
        "format": "markdown",
        "created_at": report_date.isoformat() if report_date else None,
        "file_path": latest_report
    }

# Routes
@app.get("/")
def read_root():
    return {"status": "online", "service": "Argos API"}

# Assets endpoint
@app.get("/assets")
def list_assets():
    """List all assets in the universe directory."""
    if not os.path.exists(UNIVERSE_DIR):
        logger.warning(f"UNIVERSE_DIR not found: {UNIVERSE_DIR}")
        return {"assets": []}

    assets = []
    for item in os.listdir(UNIVERSE_DIR):
        asset_dir = os.path.join(UNIVERSE_DIR, item)
        if os.path.isdir(asset_dir):
            strategy_file = os.path.join(asset_dir, "strategy.md")
            has_strategy = os.path.exists(strategy_file)
            assets.append({
                "id": item,
                "name": item,  # Could be enhanced with a proper name lookup
                "has_strategy": has_strategy
            })
    return {"assets": assets}


# Strategy endpoints
@app.get("/strategy/{asset_id}")
def get_strategy(asset_id: str):
    """Get strategy for a specific asset including linked research domains."""
    strategy_file = os.path.join(UNIVERSE_DIR, asset_id, "strategy.md")
    domains_file = os.path.join(UNIVERSE_DIR, asset_id, "linked_research_domains.yaml")
    
    if not os.path.exists(strategy_file):
        logger.warning(f"Strategy file not found for asset {asset_id}: {strategy_file}")
        raise HTTPException(status_code=404, detail=f"Strategy for {asset_id} not found")
    
    # Read strategy content
    with open(strategy_file, 'r') as f:
        strategy_content = f.read()
    
    # Read linked research domains
    research_domains = []
    if os.path.exists(domains_file):
        try:
            with open(domains_file, 'r') as f:
                domains_data = yaml.safe_load(f)
                if domains_data and 'research_domains' in domains_data:
                    research_domains = domains_data['research_domains']
        except Exception as e:
            logger.error(f"Error reading research domains for {asset_id} at {domains_file}: {str(e)}")
    else:
        logger.info(f"Linked research domains file not found for asset {asset_id}: {domains_file}")
    
    return {
        "asset_id": asset_id,
        "strategy": strategy_content,
        "research_domains": research_domains
    }

@app.put("/strategy/{asset_id}")
def update_strategy(asset_id: str, strategy: Strategy):
    """Update strategy for a specific asset."""
    asset_dir = os.path.join(UNIVERSE_DIR, asset_id)
    strategy_file = os.path.join(asset_dir, "strategy.md")
    domains_file = os.path.join(asset_dir, "linked_research_domains.yaml")
    
    # Create asset directory if it doesn't exist
    os.makedirs(asset_dir, exist_ok=True)
    
    # Write strategy content
    with open(strategy_file, 'w') as f:
        f.write(strategy.content)
    
    # Write linked research domains
    with open(domains_file, 'w') as f:
        yaml.dump({"research_domains": strategy.research_domains}, f)
    
    return {"status": "updated", "asset_id": asset_id}

# Research domains endpoints
@app.get("/research-domains")
def list_research_domains():
    """List all research domains."""
    if not os.path.exists(RESEARCH_DOMAINS_DIR):
        logger.warning(f"RESEARCH_DOMAINS_DIR not found: {RESEARCH_DOMAINS_DIR}")
        return {"domains": []}
        
    domains = []
    for item in os.listdir(RESEARCH_DOMAINS_DIR):
        domain_dir = os.path.join(RESEARCH_DOMAINS_DIR, item)
        if os.path.isdir(domain_dir):
            # Look for a description file (if exists)
            description = ""
            desc_file = os.path.join(domain_dir, "description.md")
            if os.path.exists(desc_file):
                with open(desc_file, 'r') as f:
                    description = f.read()
            else:
                logger.info(f"Description file not found for research domain {item}: {desc_file}")
            
            domains.append({
                "id": item,
                "name": item,
                "description": description
            })
    
    return {"domains": domains}

@app.get("/research-domains/{domain_id}")
def get_research_domain(domain_id: str):
    """Get details for a specific research domain."""
    domain_dir = os.path.join(RESEARCH_DOMAINS_DIR, domain_id)
    
    if not os.path.exists(domain_dir):
        logger.warning(f"Research domain directory not found: {domain_dir}")
        raise HTTPException(status_code=404, detail=f"Research domain {domain_id} not found")
    
    # Get tasks if available
    tasks_file = os.path.join(domain_dir, "research_tasks.yaml")
    tasks = []
    if os.path.exists(tasks_file):
        try:
            with open(tasks_file, 'r') as f:
                tasks_data = yaml.safe_load(f)
                if tasks_data and isinstance(tasks_data, dict):
                    tasks = tasks_data.get('tasks', [])
        except Exception as e:
            logger.error(f"Error reading tasks for {domain_id} at {tasks_file}: {str(e)}")
    else:
        logger.info(f"Tasks file not found for research domain {domain_id}: {tasks_file}")
    
    # Get description if available
    description = ""
    desc_file = os.path.join(domain_dir, "description.md")
    if os.path.exists(desc_file):
        with open(desc_file, 'r') as f:
            description = f.read()
    else:
        logger.info(f"Description file not found for research domain {domain_id}: {desc_file}")
    
    return {
        "id": domain_id,
        "name": domain_id,
        "description": description,
        "tasks": tasks
    }

from searching.query_vector_database import summary_collection, full_collection
from fastapi import Query

@app.get("/articles")
def articles(
    id: str = Query(None, description="Article ID to fetch (if provided)"),
    asset_id: str = Query(None, description="Asset to list articles for (if provided)")
):
    """
    Dual-mode endpoint:
    - If 'id' is provided, fetch a single article by unique id from ChromaDB full text collection.
    - If 'asset_id' is provided (or neither), list articles for that asset (or all assets).
    """
    if id:
        # Fetch by ID (single-article mode)
        try:
            result = full_collection.get(ids=[id], include=["documents", "metadatas"])
            docs = result.get("documents", [])
            metas = result.get("metadatas", [])
            if docs and metas:
                meta = metas[0]
                article = {
                    "id": meta.get("id", id),
                    "title": meta.get("title", "Untitled"),
                    "text": docs[0],
                    "source": meta.get("source"),
                    "date": meta.get("date") or meta.get("pub_date") or meta.get("published_date")
                }
                return {"article": article}
            else:
                raise HTTPException(status_code=404, detail=f"Article with id {id} not found")
        except Exception as e:
            logger.error(f"Error fetching article with id {id}: {e}")
            raise HTTPException(status_code=500, detail=f"Error fetching article: {e}")
    # List articles for asset (or all)
    try:
        # Use summary_collection for listing (could use semantic search here)
        # If asset_id is given, filter by asset; else, return up to 10 articles
        query_filter = {}
        if asset_id:
            query_filter = {"asset": asset_id}
        results = summary_collection.get(where=query_filter, include=["documents", "metadatas"]) if query_filter else summary_collection.get(include=["documents", "metadatas"])
        articles = []
        docs = results.get("documents", [])
        metas = results.get("metadatas", [])
        for i, meta in enumerate(metas):
            articles.append({
                "id": meta.get("id"),
                "title": meta.get("title", "Untitled"),
                "text": docs[i] if i < len(docs) else None,
                "source": meta.get("source"),
                "date": meta.get("date") or meta.get("pub_date") or meta.get("published_date")
            })
            if len(articles) >= 10:
                break
        return {"articles": articles}
    except Exception as e:
        logger.error(f"Error listing articles: {e}")
        raise HTTPException(status_code=500, detail=f"Error listing articles: {e}")

@app.get("/articles")
def list_articles(
    asset_id: Optional[str] = None,
    domain: Optional[str] = None,
    keyword: Optional[str] = Query(None, description="Keyword to search for in articles"),
    limit: int = 20
):
    """List articles with basic filtering."""
    try:
        # Connect to ChromaDB using the existing client
        client = get_chromadb_client()
        
        # Get both collections
        factiva_collection = get_or_create_collection("Factiva_SummaryArticles", client=client)
        perigon_collection = get_or_create_collection("Perigon_SummaryArticles", client=client)
        
        # Prepare filters
        where_filter = {}
        if asset_id:
            where_filter["asset"] = asset_id
        if domain:
            where_filter["domain"] = domain
            
        # Query text based on keyword
        query_text = keyword if keyword else ""
            
        # Query both collections
        factiva_results = factiva_collection.query(
            query_texts=[query_text],
            n_results=limit//2,
            where=where_filter if where_filter else None
        )
        
        perigon_results = perigon_collection.query(
            query_texts=[query_text],
            n_results=limit//2,
            where=where_filter if where_filter else None
        )
        
        # Combine results
        articles = []
        
        # Process Factiva results
        if factiva_results and 'ids' in factiva_results and factiva_results['ids']:
            for i in range(len(factiva_results['ids'][0])):
                article_id = factiva_results['ids'][0][i]
                document = factiva_results['documents'][0][i]
                metadata = factiva_results['metadatas'][0][i] if factiva_results['metadatas'] else {}
                
                articles.append({
                    "id": article_id,
                    "content": document,
                    "source": "Factiva",
                    "metadata": metadata
                })
        
        # Process Perigon results
        if perigon_results and 'ids' in perigon_results and perigon_results['ids']:
            for i in range(len(perigon_results['ids'][0])):
                article_id = perigon_results['ids'][0][i]
                document = perigon_results['documents'][0][i]
                metadata = perigon_results['metadatas'][0][i] if perigon_results['metadatas'] else {}
                
                articles.append({
                    "id": article_id,
                    "content": document,
                    "source": "Perigon",
                    "metadata": metadata
                })
        
        # Sort by date if available
        articles_with_date = []
        for article in articles:
            pub_date = None
            if 'metadata' in article and 'publication_date' in article['metadata']:
                try:
                    pub_date = datetime.fromisoformat(article['metadata']['publication_date'])
                except (ValueError, TypeError):
                    pass
            
            articles_with_date.append((article, pub_date))
        
        # Sort by date (newest first) and limit results
        sorted_articles = sorted(
            articles_with_date,
            key=lambda x: x[1] if x[1] else datetime.min,
            reverse=True
        )
        
        return {"articles": [a[0] for a in sorted_articles[:limit]]}
        
    except Exception as e:
        logger.error(f"Error querying articles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error querying articles: {str(e)}")

@app.get("/articles/{article_id}")
def get_article(article_id: str):
    """Get a specific article by ID."""
    try:
        # Connect to ChromaDB using the existing client
        client = get_chromadb_client()
        
        # Try in summary collections first
        factiva_summary = get_or_create_collection("Factiva_SummaryArticles", client=client)
        perigon_summary = get_or_create_collection("Perigon_SummaryArticles", client=client)
        
        # Try in full collections if not found
        factiva_full = get_or_create_collection("Factiva_FullArticles", client=client)
        perigon_full = get_or_create_collection("Perigon_FullArticles", client=client)
        
        # Check each collection
        for collection, source_name in [
            (factiva_summary, "Factiva_Summary"),
            (perigon_summary, "Perigon_Summary"),
            (factiva_full, "Factiva_Full"),
            (perigon_full, "Perigon_Full")
        ]:
            try:
                result = collection.get(ids=[article_id])
                if result and 'documents' in result and result['documents']:
                    # Found the article
                    document = result['documents'][0]
                    metadata = result['metadatas'][0] if 'metadatas' in result and result['metadatas'] else {}
                    
                    return {
                        "id": article_id,
                        "content": document,
                        "source": source_name,
                        "metadata": metadata
                    }
            except Exception:
                # Article not found in this collection, continue to next
                pass
        
        # If we get here, article wasn't found
        raise HTTPException(status_code=404, detail=f"Article {article_id} not found")
        
    except Exception as e:
        logger.error(f"Error retrieving article {article_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving article: {str(e)}")

# Insights endpoints
@app.get("/insights")
def list_insights(
    asset_id: Optional[str] = None,
    domain: Optional[str] = None,
    keyword: Optional[str] = Query(None, description="Keyword to search for in insights"),
    limit: int = 20
):
    """List insights with basic filtering."""
    try:
        # Load insights collection
        insights_collection = load_insights_collection()
        
        # Prepare filters
        where_filter = {}
        if asset_id:
            where_filter["asset_id"] = asset_id
        if domain:
            where_filter["domain"] = domain
            
        # Query text based on keyword
        query_text = keyword if keyword else ""
        
        # Query insights
        results = insights_collection.query(
            query_texts=[query_text],
            n_results=limit,
            where=where_filter if where_filter else None
        )
        
        # Process results
        insights = []
        if results and 'ids' in results and results['ids']:
            for i in range(len(results['ids'][0])):
                insight_id = results['ids'][0][i]
                document = results['documents'][0][i]
                metadata = results['metadatas'][0][i] if results['metadatas'] else {}
                
                insights.append({
                    "id": insight_id,
                    "content": document,
                    "metadata": metadata
                })
        
        return {"insights": insights}
        
    except Exception as e:
        logger.error(f"Error querying insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error querying insights: {str(e)}")

@app.get("/insights/{insight_id}")
def get_insight(insight_id: str):
    """Get a specific insight by ID."""
    try:
        # Load insights collection
        insights_collection = load_insights_collection()
        
        # Try to get the insight
        try:
            result = insights_collection.get(ids=[insight_id])
            if result and 'documents' in result and result['documents']:
                document = result['documents'][0]
                metadata = result['metadatas'][0] if 'metadatas' in result and result['metadatas'] else {}
                
                return {
                    "id": insight_id,
                    "content": document,
                    "metadata": metadata
                }
            else:
                logger.info(f"Insight {insight_id} not found in ChromaDB, trying file system")
        except Exception as e:
            logger.error(f"Error retrieving insight {insight_id} from ChromaDB: {e}")
        
        # Fallback: try to load from file system
        assets_dir = os.path.join(os.path.dirname(__file__), "output")
        found = False
        for asset in os.listdir(assets_dir):
            insight_path = os.path.join(assets_dir, asset, "insights", f"{insight_id}.json")
            if os.path.isfile(insight_path):
                logger.info(f"Insight {insight_id} found at {insight_path}")
                with open(insight_path, "r") as f:
                    insight_data = json.load(f)
                return {"insight": insight_data}
        logger.warning(f"Insight {insight_id} not found in any asset's insights folder")
        raise HTTPException(status_code=404, detail=f"Insight {insight_id} not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving insight {insight_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving insight: {e}")

# Reports endpoints

@app.get("/report/{asset}")
def get_latest_report(asset: str):
    """
    Returns the newest report for the given asset, searching in output/{asset}/reports/.
    - Prefers .md, then .html, then .pdf (case-insensitive).
    - Returns the most recently modified file of the preferred type.
    - If .md, returns content as text; if .html or .pdf, returns filename and a note.
    - Bulletproof to missing directories, permission errors, and weird files.
    - Logs found files and selection process.
    - Returns 404 with a clear error if no report is found.
    """
    reports_dir = os.path.join("output", asset, "reports")
    try:
        if not os.path.isdir(reports_dir):
            logger.warning(f"No report directory found: {reports_dir}")
            return JSONResponse(status_code=404, content={"error": f"No report directory found for {asset}"})
        found_files = []
        newest_file = None
        for ext in ["md", "html", "pdf"]:
            files = [f for f in glob.glob(os.path.join(reports_dir, f"*.{ext}"))]
            files += [f for f in glob.glob(os.path.join(reports_dir, f"*.{ext.upper()}"))]
            files = [f for f in files if not os.path.basename(f).startswith(".") and not os.path.basename(f).startswith("~")]
            logger.info(f"Searching for *.{ext} in {reports_dir}: found {len(files)} files.")
            if files:
                files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
                found_files = files
                newest_file = files[0]
                break
        if not found_files or not newest_file:
            logger.warning(f"No report files found in {reports_dir}")
            return JSONResponse(status_code=404, content={"error": f"No report files found for {asset}"})
        filename = os.path.basename(newest_file)
        logger.info(f"Selected newest report for {asset}: {filename}")
        if filename.lower().endswith(".md"):
            try:
                with open(newest_file, "r", encoding="utf-8") as f:
                    content = f.read()
                return {"filename": filename, "content": content}
            except Exception as e:
                logger.error(f"Error reading markdown report {newest_file}: {e}")
                return JSONResponse(status_code=500, content={"error": f"Failed to read report file: {e}"})
        else:
            return {"filename": filename, "note": "Report is not markdown, content not shown."}
    except Exception as e:
        logger.error(f"Unexpected error in report lookup for {asset}: {e}")
        return JSONResponse(status_code=500, content={"error": f"Unexpected error: {e}"})

from pydantic import BaseModel
from typing import Optional, List, Dict

class ChatMessage(BaseModel):
    message: str
    asset_id: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None

import custom_logging
logger = custom_logging.get_logger('argos.api_main')
import re

def extract_ids_from_report(report_text):
    """
    Extract all insight (7-char) and article (5-char) IDs from any (...) group in the report text.
    Returns (insight_ids, article_ids) as lists of unique IDs.
    """
    paren_groups = re.findall(r'\(([^)]*)\)', report_text)
    insight_ids = set()
    article_ids = set()
    for group in paren_groups:
        found_7 = re.findall(r'\b[A-Z0-9]{7}\b', group)
        found_5 = re.findall(r'\b[A-Z0-9]{5}\b', group)
        if found_7:
            logger.debug(f"Found insight IDs in group '{group}': {found_7}")
        if found_5:
            logger.debug(f"Found article IDs in group '{group}': {found_5}")
        insight_ids.update(found_7)
        article_ids.update(found_5)
    logger.info(f"Total unique insight IDs found: {len(insight_ids)}")
    logger.info(f"Total unique article IDs found: {len(article_ids)}")
    return list(insight_ids), list(article_ids)

def build_llm_context_for_conversation(report_markdown, fetch_insight, fetch_article):
    """
    Build a unified LLM context for conversation, including:
    - The report markdown
    - Cleaned insights (text + deep_insights only)
    - Cleaned articles (headline + text only)
    Uses logging at every step.
    Args:
        report_markdown: The full markdown text of the report
        fetch_insight: function(id) -> dict, returns full insight object
        fetch_article: function(id) -> dict, returns full article object
    Returns:
        String to use as system/context for LLM conversation.
    """
    logger.info("Building LLM context for conversation...")
    insight_ids, article_ids = extract_ids_from_report(report_markdown)

    # Fetch and clean insights
    insights = []
    for iid in insight_ids:
        try:
            raw = fetch_insight(iid)
            text = raw.get('text', '')
            deep = raw.get('deep_insights', '')
            clean = f"{text}\n{deep}".strip()
            if clean:
                insights.append(clean)
                logger.debug(f"Fetched/cleaned insight {iid}.")
            else:
                logger.warning(f"Insight {iid} is empty after cleaning.")
        except Exception as e:
            logger.error(f"Failed to fetch/clean insight {iid}: {e}")

    # Fetch and clean articles
    articles = []
    for aid in article_ids:
        try:
            raw = fetch_article(aid)
            headline = raw.get('headline', '')
            text = raw.get('text', '')
            clean = f"{headline}\n{text}".strip()
            if clean:
                articles.append(clean)
                logger.debug(f"Fetched/cleaned article {aid}.")
            else:
                logger.warning(f"Article {aid} is empty after cleaning.")
        except Exception as e:
            logger.error(f"Failed to fetch/clean article {aid}: {e}")

    context = []
    context.append("SYSTEM: You are Argos, a market intelligence assistant. Use only the information below.")
    context.append("\n---\n")
    context.append("## Full Report\n")
    context.append(report_markdown.strip())
    context.append("\n---\n")
    context.append("## Insights Used\n")
    context.extend([f"- {insight}" for insight in insights if insight])
    context.append("\n---\n")
    context.append("## Articles Used\n")
    context.extend([f"- {article}" for article in articles if article])
    context.append("\n---\n")
    context.append("## User Message\n")
    context.append(msg.message.strip())
    return "\n".join(context)

@app.post("/chat")
def chat_endpoint(msg: ChatMessage):
    asset = (msg.asset_id or "").upper().strip()
    logger.info(f"[Argos][chat] Incoming chat request: asset='{asset}', message='{msg.message.strip()}'")
    if not asset:
        logger.warning(f"[Argos][chat] No asset provided in message: '{msg.message.strip()}'")
        raise HTTPException(
            status_code=400,
            detail="no asset provided in message. Please specify an asset."
        )

    reports_dir: Path = get_asset_reports_dir(asset)
    logger.info(f"[Argos][chat] Resolved reports_dir: {reports_dir}")
    if not reports_dir.exists():
        logger.warning(f"[Argos][directory_check] Reports directory does not exist for asset '{asset}': {reports_dir}")
        raise HTTPException(
            status_code=404,
            detail="asset does not exist"
        )
    files = [f for f in reports_dir.glob("*.md")] + \
            [f for f in reports_dir.glob("*.MD")] + \
            [f for f in reports_dir.glob("*.mD")] + \
            [f for f in reports_dir.glob("*.Md")]
    files = [f for f in files if not f.name.startswith((".", "~"))]
    logger.info(f"[Argos][chat] Found {len(files)} report files for asset '{asset}': {[f.name for f in files]}")
    if not files:
        logger.warning(f"[Argos][file_check] No .md report files found for asset '{asset}' in {reports_dir}")
        raise HTTPException(
            status_code=404,
            detail=f"No .md report files found for asset {asset}."
        )
    try:
        files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        logger.info(f"[Argos][chat] Using latest report file: {files[0].name}")
        with files[0].open("r", encoding="utf-8") as f:
            report_content = f.read()
    except Exception as e:
        logger.error(f"[Argos][file_access] Error accessing report files for asset '{asset}': {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error accessing report files for asset {asset}."
        )
    if COMPLEX_LLM is None:
        logger.error(f"[Argos][llm_init] LLM is not available at startup for asset '{asset}'")
        raise HTTPException(
            status_code=500,
            detail="LLM is not available (initialization failed at startup)."
        )
    try:
        logger.info(f"[Argos][chat] Invoking LLM for asset '{asset}'")
        prompt = f"You are Argos, a market intelligence assistant.\n\n---\n## Latest Report for {asset}\n{report_content}\n---\nUser message: {msg.message}\n\nProvide a concise, actionable response using only the report above."
        llm_response = COMPLEX_LLM.invoke(prompt)
        reply = llm_response.content if hasattr(llm_response, 'content') else str(llm_response)
        logger.info(f"[Argos][chat] LLM response generated for asset '{asset}'")
        return {"response": reply.strip()}
    except Exception as e:
        logger.error(f"[Argos][llm_call] LLM call failed for asset '{asset}': {e}")
        raise HTTPException(
            status_code=500,
            detail=f"LLM call failed for asset {asset}."
        )
    
# Run the server if this file is executed directly
if __name__ == "__main__":
    DEBUG = False  # Ensure debug is set to False for production
    print("\nArgos API server starting...")
    print("API available at: http://0.0.0.0:8000")
    print("Docs available at: http://0.0.0.0:8000/docs\n")
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)