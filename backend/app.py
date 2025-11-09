import os
import sys
import traceback
from jose import jwt
from urllib.request import urlopen
import json
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from bs4 import BeautifulSoup
import requests
from dotenv import load_dotenv
from newsapi import NewsApiClient
from serpapi import GoogleSearch
from PIL import Image
import pytesseract
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from moviepy.editor import VideoFileClip
import whisper 
import yt_dlp as ytdlp

options = Options()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-logging")
options.add_argument("--log-level=3")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

from inference.hatespeech.predict_hatespeech import predict_hatespeech
from inference.predict import predict_with_max_voting, vectorize_text, tokenizer

# ----------------------
# Load environment vars
# ----------------------
load_dotenv()

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("API_AUDIENCE")
ALGORITHMS = [os.getenv("ALGORITHMS", "RS256")]

# ---- Get public keys from Auth0 ----
jsonurl = urlopen(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json")
jwks = json.loads(jsonurl.read())

# ----------------------
# Auth0 JWT Helpers
# ----------------------
from functools import wraps
from flask import g

def get_token_auth_header():
    """Get access token from header"""
    auth = request.headers.get("Authorization", None)
    if not auth:
        return None
    parts = auth.split()
    if parts[0].lower() != "bearer":
        return None
    elif len(parts) == 1:
        return None
    elif len(parts) > 2:
        return None
    return parts[1]

def requires_auth(f):
    """Decorator to require valid JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()
        if not token:
            return jsonify({"error": "Authorization header is missing"}), 401
        try:
            unverified_header = jwt.get_unverified_header(token)
        except jwt.JWTError:
            return jsonify({"error": "Invalid header"}), 401

        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }
        if rsa_key:
            try:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=ALGORITHMS,
                    audience=API_AUDIENCE,
                    issuer=f"https://{AUTH0_DOMAIN}/"
                )
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "token expired"}), 401
            except jwt.JWTClaimsError:
                return jsonify({"error": "invalid claims"}), 401
            except Exception:
                return jsonify({"error": "invalid header"}), 401

            _request_ctx_stack.top.current_user = payload
            return f(*args, **kwargs)
        return jsonify({"error": "Unable to find appropriate key"}), 401
    return decorated



# Flask setup (React handles frontend, not Flask)
app = Flask(__name__)
CORS(app)

# ----------------------
# Import your predictor
# ----------------------
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "inference")))
try:
    from predict import predict_with_max_voting
except Exception as e:
    print("❌ Could not import predict_with_max_voting:", e)
    predict_with_max_voting = None

# Video scan support
try:
    from video_scan import process_video_input
except Exception:
    process_video_input = None
    print("⚠️ Warning: process_video_input not available")

# ----------------------
# External API setup
# ----------------------
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY", "")
newsapi = NewsApiClient(api_key=NEWSAPI_KEY) if NEWSAPI_KEY else None

pytesseract.pytesseract.tesseract_cmd = os.getenv(
    "TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

# ----------------------
# Helpers
# ----------------------
def extract_text_from_image(image_path):
    try:
        image = Image.open(image_path)
        return pytesseract.image_to_string(image, lang="eng").strip()
    except Exception as e:
        print("OCR error:", e)
        return None

def extract_article_text(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        resp = requests.get(url, timeout=8, headers=headers)
        soup = BeautifulSoup(resp.text, "html.parser")
        text = " ".join([p.get_text() for p in soup.find_all("p")])
        if text.strip():
            return text[:1200]  # ✅ worked with requests
    except Exception as e:
        print("Requests parse failed, trying Selenium:", e)

    # 🔄 Fallback to Selenium
    try:
        options = Options()
        options.add_argument("--headless=new")  # no browser window
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        driver = webdriver.Chrome(options=options)

        driver.get(url)
        html = driver.page_source
        driver.quit()

        soup = BeautifulSoup(html, "html.parser")
        text = " ".join([p.get_text() for p in soup.find_all("p")])
        return text[:1200] if text else None
    except Exception as e:
        print("Selenium fallback failed:", e)
        return None
    
def extract_audio_from_video(video_path, audio_path="temp_audio.wav"):
    """Convert video to .wav using moviepy"""
    clip = VideoFileClip(video_path)
    clip.audio.write_audiofile(audio_path, codec="pcm_s16le")
    clip.close()
    return audio_path


def transcribe_audio(audio_path):
    """Whisper transcription"""
    model = whisper.load_model("base")
    result = model.transcribe(audio_path, fp16=False)
    return result.get("text", "").strip()


def download_video_from_url(url, output_path="downloaded_video.mp4"):
    """Download video from YouTube/Instagram using yt-dlp"""
    ydl_opts = {
        "outtmpl": output_path,
        "format": "mp4/best",
        "quiet": True,
    }
    with ytdlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    return output_path

# ----------------------
# Routes
@app.route("/analyze", methods=["POST"])
def analyze_text():
    try:
        data = request.json
        url = data.get("url")
        text_input = data.get("text")

        # Case 1: User gives a URL
        if url:
            article_text = extract_article_text(url)  # <-- BeautifulSoup logic
            text_snippet = article_text[:500] if article_text else "No text extracted"
        # Case 2: User directly gives text
        elif text_input:
            article_text = text_input
            text_snippet = article_text[:500]
        else:
            return jsonify({"error": "No input provided"}), 400
        
        if not article_text:
            return jsonify({"error": "No article text extracted"}), 400
        
        text_snippet = article_text[:500]
        # Vectorize + Predict
        text_vectorized = vectorize_text(article_text, tokenizer)
        model_result = predict_with_max_voting(article_text, text_vectorized) or {}
        # ---- Hate Speech Prediction ----
        hate_result = predict_hatespeech([article_text])[0]
        # Extract fake/real percentages safely
        best_pred = model_result.get("best_prediction", {})
        all_models = model_result.get("all_models", {})
        # Build final response
        response = {
      "text_snippet": text_snippet,
            **model_result,   # unpack everything directly
            "hate_speech": hate_result,
            "verified": False
        }

        return jsonify(response), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
           "error": str(e),
            "text_snippet": None,
            "model_used": None,
            "confidence": 0.0,
            "fake_percentage": 0.0,
            "real_percentage": 0.0,
            "all_model_results": {},
            "hate_speech": None,
            "verified": False
        }), 500

@app.route("/analyze-image", methods=["POST"])
def analyze_image():
    """OCR + Fake news detection from image"""
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    image_file = request.files["image"]
    path = f"temp_{os.getpid()}.png"
    try:
        image_file.save(path)
        extracted_text = extract_text_from_image(path)
        if not extracted_text:
            return jsonify({"error": "No text extracted"}), 400
        
       
        # --- Fake News Detection ---
        text_vectorized = vectorize_text(extracted_text, tokenizer)
        model_result = predict_with_max_voting(extracted_text, text_vectorized) or {}

        # --- Hate Speech Detection ---
        hate_result = predict_hatespeech([extracted_text])[0]

        # --- Build Response ---
        response = {
            "text_snippet": extracted_text[:500],
            **model_result,
            "hate_speech": hate_result,
            "verified": False
        }

        return jsonify(response), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(path):
            os.remove(path)

# ------------ Whisper model ----------------#
whisper_model = whisper.load_model("base")

@app.route("/analyze-video", methods=["POST"])
def analyze_video():
    video_path, audio_path = None, None
    try:
        # ---- Uploaded file ----
        if "video" in request.files:
            video_file = request.files["video"]
            video_path = f"temp_video_{os.getpid()}.mp4"
            video_file.save(video_path)

        # ---- URL ----
        elif request.json and "url" in request.json:
            url = request.json["url"]
            video_path = f"temp_video_{os.getpid()}.mp4"
            try:
                download_video_from_url(url, video_path)
            except Exception as e:
                print("Video download failed:", e)
                return jsonify({"error": "Video download failed"}), 500
        else:
            return jsonify({"error": "No video file or URL provided"}), 400

        # ---- Convert video to audio ----
        audio_path = f"temp_audio_{os.getpid()}.wav"
        try:
            extract_audio_from_video(video_path, audio_path)
        except Exception as e:
            print("Audio extraction failed:", e)
            return jsonify({"error": "Audio extraction failed"}), 500

        # ---- Transcribe ----
        try:
            transcript = whisper_model.transcribe(audio_path, fp16=False).get("text", "").strip()
        except Exception as e:
            print("Transcription failed:", e)
            transcript = ""

        if not transcript:
            transcript = "Transcription failed or empty"

        # ---- Fake news + Hate speech ----
        text_vectorized = vectorize_text(transcript, tokenizer)
        model_result = predict_with_max_voting(transcript, text_vectorized) or {}
        hate_result = predict_hatespeech([transcript])[0]

        # ---- Build response ----
        response = {
            "text_snippet": transcript[:500],
            **model_result,
            "hate_speech": hate_result,
            "verified": False
        }

        return jsonify(response), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        for f in [video_path, audio_path]:
            if f and os.path.exists(f):
                os.remove(f)
# ----------------------
# Error handlers
# ----------------------
@app.errorhandler(Exception)
def handle_exception(e):
    tb = traceback.format_exc()
    print("Unhandled exception:", tb)
    return make_response(jsonify({"error": str(e)}), 500)

# ----------------------
# Run
# ----------------------
if __name__ == "__main__":
    app.run(debug=True)
