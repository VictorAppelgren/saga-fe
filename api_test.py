import pytest
from fastapi.testclient import TestClient
from api_main import app

client = TestClient(app)

# Test 1: /assets endpoint
def test_list_assets():
    print("\n==================== TEST: /assets ====================")
    response = client.get("/assets")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    assert "assets" in response.json()
    print("==================== END TEST: /assets ====================\n")

# Test 2: /strategy/EURUSD endpoint
def test_get_strategy_eurusd():
    print("\n==================== TEST: /strategy/EURUSD ====================")
    response = client.get("/strategy/EURUSD")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    assert "strategy" in response.json()
    assert response.json()["asset_id"].upper() == "EURUSD"
    print("==================== END TEST: /strategy/EURUSD ====================\n")

def test_get_insight_eurusd():
    print("\n==================== TEST: /insights (EURUSD) ====================")
    response = client.get("/insights", params={"asset_id": "EURUSD"})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    data = response.json()
    insights = data.get("insights", [])
    if not insights:
        # Print the directory being checked for clarity
        import os
        base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "output", "EURUSD", "insights"))
        print(f"No insights found for EURUSD, skipping get insight by ID test.")
        print(f"(Looked in: {base_path})")
        print("==================== END TEST: /insights (EURUSD) ====================\n")
        return None
    insight_id = insights[0]["insight_id"]
    print(f"First insight ID: {insight_id}")
    print("==================== END TEST: /insights (EURUSD) ====================\n")
    return insight_id

import glob

def test_get_insight_by_id():
    print("\n==================== TEST: /insights/{id} ====================")
    # Look for any .json file in output/EURUSD/insights
    import os
    insights_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "output", "EURUSD", "insights"))
    json_files = glob.glob(os.path.join(insights_dir, "*.json"))
    if not json_files:
        print(f"No insight files found in {insights_dir}, skipping.")
        print("==================== END TEST: /insights/{id} ====================\n")
        return
    # Use the first file (or random.choice(json_files) for randomness)
    file_path = json_files[0]
    insight_id = os.path.splitext(os.path.basename(file_path))[0]
    print(f"Testing with insight ID: {insight_id}")
    response = client.get(f"/insights/{insight_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    if response.status_code == 200:
        data = response.json().get("insight", {})
        returned_id = data.get("insight_id") or data.get("id")
        assert returned_id == insight_id, f"Returned ID {returned_id} does not match requested {insight_id}"
    print("==================== END TEST: /insights/{id} ====================\n")

def test_get_article_eurusd():
    print("\n==================== TEST: /articles (EURUSD) ====================")
    response = client.get("/articles", params={"asset_id": "EURUSD", "limit": 1})
    print(f"Status: {response.status_code}")
    resp_json = response.json()
    print(f"Response: {resp_json}")
    print(f"Response keys: {list(resp_json.keys())}")
    assert response.status_code == 200
    articles = resp_json.get("articles", [])
    print(f"Number of articles returned: {len(articles)}")
    for i, art in enumerate(articles[:3]):
        text_preview = (art.get("text") or "")[:50].replace("\n", " ").replace("\r", " ")
        print(f"Sample {i+1}: id={art.get('id')}, title={art.get('title')}, text[:50]={text_preview!r}")
    if not articles:
        print("No articles found for EURUSD.")
        print("==================== END TEST: /articles (EURUSD) ====================\n")
        return None
    article_id = articles[0]["id"]
    print(f"First article ID: {article_id}")
    print("==================== END TEST: /articles (EURUSD) ====================\n")
    return article_id

def test_get_article_by_id(article_id):
    print("\n==================== TEST: /articles/{id} ====================")
    if not article_id:
        print("No article ID provided, skipping.")
        print("==================== END TEST: /articles/{id} ====================\n")
        return
    response = client.get(f"/articles/{article_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    assert response.json()["id"] == article_id
    print("==================== END TEST: /articles/{id} ====================\n")

def get_newest_report_for_asset(asset):
    print(f"\n==================== TEST: /report/{asset} ====================")
    response = client.get(f"/report/{asset}")
    print(f"Status: {response.status_code}")
    data = response.json()
    if response.status_code == 404:
        print(f"No report found for {asset}. Skipping.")
        print(f"==================== END TEST: /report/{asset} ====================\n")
        return None
    assert response.status_code == 200
    filename = data.get("filename")
    content = data.get("content")
    print(f"Report filename: {filename}")
    if content:
        print(f"Report content preview: {content[:300]}...")
    else:
        print("Report is not in markdown or has no content.")
    print(f"==================== END TEST: /report/{asset} ====================\n")
    return filename

def test_chat():
    print("\n==================== TEST: /chat (EURUSD macro question) ====================")
    data = {"message": "What is the macro outlook for EURUSD?", "asset_id": "EURUSD", "history": []}
    response = client.post("/chat", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    assert "response" in response.json()
    print("==================== END TEST: /chat ====================\n")

def test_llm_conversation():
    print("\n==================== TEST: LLM Conversation (LangChain) ====================")
    try:
        from model_config import get_medium_llm
        import time
    except ImportError:
        print("LangChain or model_config not installed, skipping LLM test.")
        return
    llm = get_medium_llm()
    conversation = [
        {"role": "user", "content": "Hello Argos, what can you do?"},
        {"role": "user", "content": "Give me a macro summary for EURUSD."},
        {"role": "user", "content": "What are the main risks for EURUSD this summer?"},
        {"role": "user", "content": "Summarize your last answer in one sentence."},
    ]
    chat_history = []
    from langchain_core.messages import HumanMessage, AIMessage
    for turn in conversation:
        user_message = turn["content"]
        print(f"USER: {user_message}")
        # Build the full conversation history as LangChain Message objects
        lc_history = []
        for msg in chat_history:
            if msg["role"] == "user":
                lc_history.append(HumanMessage(content=msg["content"]))
            else:
                lc_history.append(AIMessage(content=msg["content"]))
        # Add the new user message
        lc_history.append(HumanMessage(content=user_message))
        # Call the LLM with the full message history
        response = llm.invoke(lc_history)
        reply = getattr(response, "content", str(response))
        print(f"ARGOS: {reply}\n")
        chat_history.append({"role": "user", "content": user_message})
        chat_history.append({"role": "assistant", "content": reply})
        time.sleep(1)
    print("==================== END TEST: LLM Conversation ====================\n")

if __name__ == "__main__":
    # Run selected tests for manual runs
    article_id = test_get_article_eurusd()
    test_get_article_by_id(article_id)
    get_newest_report_for_asset("EURUSD")
    test_chat()
    test_llm_conversation()
    print("\nAll selected tests completed.")

def test_update_strategy_eurusd():
    print("\n==================== TEST: PUT /strategy/EURUSD ====================")
    # 1. Get the current strategy
    get_resp = client.get("/strategy/EURUSD")
    assert get_resp.status_code == 200
    original = get_resp.json()
    original_content = original["strategy"]
    original_domains = original["research_domains"]
    # 2. Append '1' to the content
    new_content = original_content.rstrip() + "\n1\n"
    put_data = {"content": new_content, "research_domains": original_domains}
    put_resp = client.put("/strategy/EURUSD", json=put_data)
    print(f"PUT status: {put_resp.status_code}")
    print(f"PUT response: {put_resp.json()}")
    assert put_resp.status_code == 200
    # 3. Get the strategy again and check last line
    get_after = client.get("/strategy/EURUSD")
    assert get_after.status_code == 200
    last_line = get_after.json()["strategy"].strip().splitlines()[-1]
    print(f"Last line after update: '{last_line}'")
    assert last_line == "1"
    # 4. Restore original content
    restore_data = {"content": original_content, "research_domains": original_domains}
    restore_resp = client.put("/strategy/EURUSD", json=restore_data)
    print(f"Restore status: {restore_resp.status_code}")
    print("==================== END TEST: PUT /strategy/EURUSD ====================\n")

if __name__ == "__main__":
    test_list_assets()
    test_get_strategy_eurusd()
    test_update_strategy_eurusd()
    insight_id = test_get_insight_eurusd()
    test_get_insight_by_id()
    article_id = test_get_article_eurusd()
    test_get_article_by_id(article_id)
    get_newest_report_for_asset("EURUSD")
    test_chat()
    print("\nAll selected tests completed.")