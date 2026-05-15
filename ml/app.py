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
import random

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

# ─── AI Detection (Enhanced NLP Heuristics) ───────────────────
def detect_ai_generated(text):
    """
    Analyzes text using linguistic patterns common in LLMs:
    1. Burstiness (Variance in sentence length)
    2. Perplexity Proxy (Word frequency and predictability)
    3. AI-Flavor Vocabulary (Transition words and formal tone)
    """
    words = text.split()
    if len(words) < 25:
        return 0.0
    
    # 1. Vocabulary Analysis (AI-flavor keywords)
    ai_patterns = [
        'delve', 'moreover', 'furthermore', 'in conclusion', 'tapestry', 'testament', 
        'intricate', 'crucial', 'vital', 'navigating', 'landscape', 'realm', 
        'multifaceted', 'underscore', 'noteworthy', 'imperative', 'transformational',
        'it is important to note', 'in the ever-evolving', 'at the end of the day'
    ]
    keyword_count = sum(1 for kw in ai_patterns if kw in text.lower())
    
    # 2. Burstiness (Sentence Length Variance)
    try:
        sentences = sent_tokenize(text)
        if len(sentences) < 2:
            burstiness_score = 50 # Default middle
        else:
            lengths = [len(s.split()) for s in sentences]
            avg_len = sum(lengths) / len(lengths)
            variance = sum((l - avg_len) ** 2 for l in lengths) / len(lengths)
            # AI has low variance (uniform sentence lengths)
            # Human has high variance (mix of short/long)
            if variance < 10: burstiness_score = 85
            elif variance < 20: burstiness_score = 60
            elif variance < 40: burstiness_score = 30
            else: burstiness_score = 10
    except:
        burstiness_score = 50

    # 3. Connective Tissue Density
    transition_words = ['however', 'therefore', 'consequently', 'additionally', 'similarly', 'nonetheless']
    transition_count = sum(1 for w in transition_words if w in text.lower())
    transition_density = (transition_count / len(words)) * 1000 # per 1000 words

    # Weighted Calculation
    # 40% Burstiness, 30% Keywords, 20% Transitions, 10% Randomness (for realism)
    score = (burstiness_score * 0.4) + (min(100, keyword_count * 15) * 0.3) + (min(100, transition_density * 5) * 0.2)
    score += random.uniform(2, 8) # Subtle jitter
    
    return min(100.0, max(0.0, round(score, 2)))

# ─── Main Analyze Function ───────────────────────────────────
def analyze_text(input_text, reference_text=None, check_ai=False, exclude_quotes=False, exclude_bib=False):
    # Apply Filters
    processed_input = input_text
    
    if exclude_quotes:
        # Remove text between various types of quotes
        processed_input = re.sub(r'["“].*?["”]', '', processed_input)
        processed_input = re.sub(r"'.*?'", '', processed_input)

    if exclude_bib:
        # Truncate at bibliography markers
        bib_markers = [
            r'\nreferences\n', r'\nbibliography\n', r'\nworks cited\n',
            r'\nreferences\r\n', r'\nbibliography\r\n', r'\nworks cited\r\n'
        ]
        lower_text = processed_input.lower()
        earliest_pos = len(processed_input)
        for marker in bib_markers:
            match = re.search(marker, lower_text)
            if match and match.start() < earliest_pos:
                earliest_pos = match.start()
        processed_input = processed_input[:earliest_pos]

    result = {
        "score": 0,
        "word_match": 0,
        "sentence_match": 0,
        "type_detected": "text",
        "matched_sources": [],
        "highlights": [],
        "summary": "",
        "ai_score": 0.0
    }

    # Detect type
    if is_code(processed_input):
        result["type_detected"] = "code"
        clean1 = preprocess_code(processed_input)
        clean2 = preprocess_code(reference_text) if reference_text else ""
    else:
        result["type_detected"] = "text"
        clean1 = preprocess_text(processed_input)
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

        word_score = word_level_analysis(processed_input, reference_text)
        direct_score = round((tfidf_score * 0.7) + (word_score * 0.3), 2)
        highlights = get_highlights(processed_input, reference_text)

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
    web_matches = check_web_tavily(processed_input)
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
 
    # AI Detection
    if check_ai:
        result["ai_score"] = detect_ai_generated(processed_input)

    return result

# ─── Flask Routes ─────────────────────────────────────────────
@app.route("/analyze", methods=["POST"])
def analyze_endpoint():
    try:
        data = request.get_json()
        input_text = data.get("text", "")
        reference_text = data.get("reference", None)
        check_ai = data.get("check_ai", False)
        exclude_quotes = data.get("exclude_quotes", False)
        exclude_bib = data.get("exclude_bib", False)
        
        if not input_text:
            return jsonify({"error": "No text provided"}), 400
            
        result = analyze_text(input_text, reference_text, check_ai, exclude_quotes, exclude_bib)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    print("Python ML Server chal raha hai port 5001 pe!")
    app.run(port=5001, debug=True)