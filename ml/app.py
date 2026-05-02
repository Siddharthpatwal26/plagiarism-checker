import nltk
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, request, jsonify
from flask_cors import CORS
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize
from tavily import TavilyClient
import requests
from bs4 import BeautifulSoup

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('punkt_tab')

app = Flask(__name__)
CORS(app)

# Tavily Client
tavily = TavilyClient(api_key="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")

# ─── Text Preprocessor ───────────────────────────────────────
def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    stop = set(stopwords.words('english'))
    words = text.split()
    return ' '.join([w for w in words if w not in stop])

# ─── Code Preprocessor ───────────────────────────────────────
def preprocess_code(code):
    code = re.sub(r'#.*', '', code)
    code = re.sub(r'\".*?\"|\'.*?\'', 'STR', code)
    code = re.sub(r'\s+', ' ', code).strip()
    return code.lower()

# ─── Similarity Calculator ────────────────────────────────────
def compute_similarity(text1, text2):
    clean1 = preprocess_text(text1)
    clean2 = preprocess_text(text2)
    if not clean1 or not clean2:
        return 0.0
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([clean1, clean2])
    score = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0]
    return round(float(score) * 100, 2)

# ─── Code Detection ──────────────────────────────────────────
def is_code(text):
    code_keywords = ['def ', 'import ', 'class ', 'function ',
                     'const ', 'var ', 'let ', '=> ', '#!/',
                     'public ', 'private ', 'return ', 'print(']
    return any(kw in text for kw in code_keywords)

# ─── Word Level Analysis ─────────────────────────────────────
def word_level_analysis(text1, text2):
    words1 = set(preprocess_text(text1).split())
    words2 = set(preprocess_text(text2).split())
    if not words1 or not words2:
        return 0.0
    common = words1.intersection(words2)
    return round(len(common) / max(len(words1), len(words2)) * 100, 2)

# ─── Highlights ───────────────────────────────────────────────
def get_highlights(input_text, source_text, threshold=30):
    try:
        input_sentences = sent_tokenize(input_text)
        source_sentences = sent_tokenize(source_text)
    except:
        return []
    matches = []
    for sent in input_sentences:
        best_score = 0
        best_match = ""
        for src_sent in source_sentences:
            score = compute_similarity(sent, src_sent)
            if score > best_score:
                best_score = score
                best_match = src_sent
        if best_score >= threshold:
            matches.append({
                "input_sentence": sent,
                "matched_sentence": best_match,
                "score": best_score
            })
    return matches

# ─── Web Search via Tavily ────────────────────────────────────
def check_web_tavily(input_text):
    try:
        query = input_text[:200]
        response = tavily.search(query=query, max_results=5)
        matched_sources = []
        for result in response.get('results', []):
            content = result.get('content', '')
            url = result.get('url', '')
            title = result.get('title', '')
            if content:
                score = compute_similarity(input_text, content)
                if score > 10:
                    matched_sources.append({
                        "url": url,
                        "title": title,
                        "similarity_score": score
                    })
        matched_sources.sort(key=lambda x: x["similarity_score"], reverse=True)
        return matched_sources
    except Exception as e:
        print(f"Tavily error: {e}")
        return []

# ─── Main Analyze Function ───────────────────────────────────
def analyze_text(input_text, reference_text=None):
    result = {
        "score": 0,
        "word_match": 0,
        "sentence_match": 0,
        "type_detected": "text",
        "matched_sources": [],
        "highlights": [],
        "summary": ""
    }

    # Detect type
    if is_code(input_text):
        result["type_detected"] = "code"
        clean1 = preprocess_code(input_text)
        clean2 = preprocess_code(reference_text) if reference_text else ""
    else:
        result["type_detected"] = "text"
        clean1 = preprocess_text(input_text)
        clean2 = preprocess_text(reference_text) if reference_text else ""

    all_scores = []

    # Direct comparison
    if reference_text:
        try:
            vectorizer = TfidfVectorizer()
            matrix = vectorizer.fit_transform([clean1, clean2])
            tfidf_score = round(
                float(cosine_similarity(matrix[0], matrix[1])[0][0]) * 100, 2
            )
        except:
            tfidf_score = 0.0

        word_score = word_level_analysis(input_text, reference_text)
        direct_score = round((tfidf_score * 0.7) + (word_score * 0.3), 2)
        highlights = get_highlights(input_text, reference_text)

        result["word_match"] = word_score
        result["sentence_match"] = tfidf_score
        result["highlights"] = highlights
        result["matched_sources"].append({
            "url": "direct_comparison",
            "title": "Reference Document",
            "similarity_score": direct_score
        })
        all_scores.append(direct_score)

    # Web check via Tavily
    web_matches = check_web_tavily(input_text)
    result["matched_sources"].extend(web_matches)
    for match in web_matches:
        all_scores.append(match["similarity_score"])

    # Final score
    if all_scores:
        result["score"] = max(all_scores)
    
    # Summary
    score = result["score"]
    if score >= 70:
        result["summary"] = "High plagiarism detected! Most content is copied."
    elif score >= 40:
        result["summary"] = "Medium plagiarism detected. Some content matches."
    elif score >= 10:
        result["summary"] = "Low plagiarism detected. Minor similarities found."
    else:
        result["summary"] = "Original content! No significant plagiarism found."

    return result

# ─── Flask Routes ─────────────────────────────────────────────
@app.route("/analyze", methods=["POST"])
def analyze_endpoint():
    try:
        data = request.get_json()
        input_text = data.get("text", "")
        reference_text = data.get("reference", None)
        if not input_text:
            return jsonify({"error": "No text provided"}), 400
        result = analyze_text(input_text, reference_text)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    print("Python ML Server chal raha hai port 5001 pe!")
    app.run(port=5001, debug=True)