from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

app = Flask(__name__)
CORS(app)

def calculate_similarity(text1, text2):
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([text1, text2])
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
    return round(float(similarity[0][0]) * 100, 2)

def get_highlights(text1, text2):
    sentences1 = text1.split('.')
    sentences2 = text2.split('.')
    highlights = []
    for s1 in sentences1:
        s1 = s1.strip()
        if len(s1) < 20:
            continue
        for s2 in sentences2:
            s2 = s2.strip()
            if len(s2) < 20:
                continue
            score = calculate_similarity(s1, s2)
            if score > 50:
                highlights.append({
                    'sentence': s1,
                    'similarity': score
                })
                break
    return highlights[:5]

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        text = data.get('text', '')
        reference = data.get('reference', None)

        if not text:
            return jsonify({'error': 'Text required'}), 400

        # Agar reference diya hai to usse compare karo
        if reference and reference.strip():
            score = calculate_similarity(text, reference)
            highlights = get_highlights(text, reference)
            matched_sources = [{
                'url': 'Reference Text',
                'title': 'Provided Reference',
                'similarity': score
            }]
        else:
            # Reference nahi hai — sample comparison
            sample_texts = [
                "Plagiarism is the act of using someone else's work without giving proper credit.",
                "Artificial intelligence is transforming the way we live and work in modern society.",
                "Machine learning algorithms can detect patterns in large datasets automatically.",
            ]
            
            best_score = 0
            best_match = None
            matched_sources = []

            for i, sample in enumerate(sample_texts):
                score = calculate_similarity(text, sample)
                if score > 10:
                    matched_sources.append({
                        'url': f'https://example.com/source-{i+1}',
                        'title': f'Source {i+1}',
                        'similarity': score
                    })
                if score > best_score:
                    best_score = score
                    best_match = sample

            score = best_score
            highlights = get_highlights(text, best_match) if best_match else []

        # Summary generate karo
        if score >= 70:
            verdict = 'High Plagiarism'
            summary = f'Text mein {score}% plagiarism detected. Significant similarities found.'
        elif score >= 40:
            verdict = 'Moderate Plagiarism'
            summary = f'Text mein {score}% plagiarism detected. Some similarities found.'
        elif score >= 10:
            verdict = 'Low Plagiarism'
            summary = f'Text mein {score}% plagiarism detected. Minor similarities found.'
        else:
            verdict = 'Original'
            summary = f'Text mostly original hai. Sirf {score}% similarity detected.'

        return jsonify({
            'score': score,
            'verdict': verdict,
            'summary': summary,
            'matched_sources': matched_sources,
            'highlights': highlights
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ML Server running on port 5001'})

if __name__ == '__main__':
    print("ML Server start ho raha hai port 5001 pe...")
    app.run(host='127.0.0.1', port=5001, debug=True)