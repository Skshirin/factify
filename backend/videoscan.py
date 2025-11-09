# video_scan.py
import os
import tempfile
import shutil
import time
import json
import requests
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from typing import Optional, Dict, Any
import yt_dlp

# load environment
from dotenv import load_dotenv
load_dotenv()

# media & transcribe
import whisper
from moviepy.editor import VideoFileClip
from pytube import YouTube

# selenium (optional Instagram downloader)
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import requests

# search APIs for verification
from newsapi import NewsApiClient
from serpapi import GoogleSearch

# prediction imports (your existing code)
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ai-model')))
try:
    from predict import predict_with_soft_voting
except Exception:
    try:
        from ai_model.predict import predict_with_soft_voting
    except Exception:
        predict_with_soft_voting = None

# fact-check pipeline (optional)
try:
    from fact_check_pipeline import fact_check_article
except Exception:
    try:
        from ai_model.fact_check_pipeline import fact_check_article
    except Exception:
        fact_check_article = None

# Load Whisper model once
print("Loading Whisper model (this may take a while)...")
_whisper_model = whisper.load_model("base")
print("Whisper model loaded.")


####################
# Helper functions #
####################
def _download_youtube(youtube_url: str, out_path: str) -> str:
    """
    Download a YouTube video (including Shorts) using yt-dlp.
    Returns the path to the downloaded file.
    """
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    ydl_opts = {
        'outtmpl': out_path,  # exact output path
        'format': 'mp4',  # best mp4 format available
        'quiet': True,  # no console spam
        'noplaylist': True,  # only download the single video
        'merge_output_format': 'mp4',  # ensure mp4 output
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])

    return out_path


def _download_instagram_reel(insta_url: str, out_path: str, headless: bool = True, timeout: int = 25) -> str:
    """
    Best-effort Instagram Reel downloader using Selenium. Instagram may require login or block scrapers.
    """
    chrome_options = Options()
    if headless:
        # modern headless flags
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--lang=en-US")

    driver = webdriver.Chrome(ChromeDriverManager().install(), options=chrome_options)
    try:
        driver.set_page_load_timeout(timeout)
        driver.get(insta_url)
        time.sleep(3)
        src = None
        try:
            video_elem = driver.find_element("tag name", "video")
            src = video_elem.get_attribute("src")
        except Exception:
            pass
        if not src:
            try:
                metas = driver.find_elements("tag name", "meta")
                for m in metas:
                    if m.get_attribute("property") == "og:video":
                        src = m.get_attribute("content")
                        break
            except Exception:
                pass
        if not src:
            raise RuntimeError("Could not locate video src on Instagram page (login or dynamic load needed).")

        r = requests.get(src, stream=True, timeout=30)
        if r.status_code != 200:
            raise RuntimeError(f"Video download failed: HTTP {r.status_code}")
        with open(out_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        return out_path
    finally:
        try:
            driver.quit()
        except Exception:
            pass


def _extract_audio_from_video(video_path: str, out_audio_path: str) -> str:
    clip = VideoFileClip(video_path)
    if clip.audio is None:
        clip.close()
        raise RuntimeError("Video has no audio track.")
    clip.audio.write_audiofile(out_audio_path, fps=16000, nbytes=2, codec='pcm_s16le')
    clip.close()
    return out_audio_path


def _transcribe_with_whisper(audio_path: str) -> str:
    try:
        result = _whisper_model.transcribe(audio_path)
        return result.get("text", "").strip()
    except Exception as e:
        raise RuntimeError(f"Whisper transcription error: {e}")


# Local verify_news fallback used for video scanning (uses NewsAPI / SerpAPI)
def verify_news_local_snippet(snippet: str):
    snippet = (snippet or "")[:80]
    related_articles = []
    try:
        key = os.getenv("NEWSAPI_KEY", "")
        if key:
            client = NewsApiClient(api_key=key)
            articles = client.get_everything(q=snippet, language='en', page_size=5).get("articles", [])
            related_articles = [{"title": a.get("title"), "url": a.get("url"), "source": a.get("source", {}).get("name", "")} for a in articles]
            if related_articles:
                return True, related_articles
    except Exception:
        pass

    # serpapi fallback
    try:
        api_key = os.getenv("SERPAPI_KEY", "")
        if api_key:
            params = {"engine": "google", "q": snippet, "api_key": api_key, "num": 8, "hl": "en"}
            search = GoogleSearch(params)
            results = search.get_dict()
            links = [r["link"] for r in results.get("organic_results", []) if "link" in r]
            if links:
                related_articles = [{"title": u, "url": u, "source": "Google"} for u in links]
                return True, related_articles
    except Exception:
        pass

    return False, []


def _aggregate_fact_check_results(fact_check: Any) -> Optional[Dict[str, Any]]:
    """
    Normalize and compute final_decision if fact_check pipeline returns claims or summary keys.
    Returns {'label': 'Real'/'Fake'/'Unverified', 'confidence': float} or None.
    """
    try:
        if isinstance(fact_check, dict):
            if fact_check.get("summary_decision"):
                return {"label": fact_check.get("summary_decision"), "confidence": float(fact_check.get("summary_confidence", 0))}
            claims = fact_check.get("claims", [])
            if claims:
                real_score = fake_score = 0.0
                total = 0.0
                for c in claims:
                    verdict = (c.get("verdict") or "").lower()
                    conf = float(c.get("confidence", 0) or 0)
                    total += 1
                    if verdict in ("real", "true", "likely_real", "likely real"):
                        real_score += conf
                    elif verdict in ("fake", "false", "likely_fake", "likely fake"):
                        fake_score += conf
                if total > 0:
                    avg_real = real_score / total
                    avg_fake = fake_score / total
                    if avg_real >= 0.6 and (avg_real - avg_fake) >= 0.15:
                        return {"label": "Real", "confidence": round(avg_real * 100, 2)}
                    elif avg_fake >= 0.6 and (avg_fake - avg_real) >= 0.15:
                        return {"label": "Fake", "confidence": round(avg_fake * 100, 2)}
                    else:
                        return {"label": "Unverified", "confidence": round(max(avg_real, avg_fake) * 100, 2)}
    except Exception:
        pass
    return None


#############################
# High-level process worker #
#############################
def process_video_input(youtube_url: Optional[str] = None,
                        instagram_url: Optional[str] = None,
                        video_file=None) -> Dict[str, Any]:
    """
    Main function to handle a video input (youtube url, instagram url, or uploaded file)
    Returns the same response shape used by the frontend (transcription, model_result, fact_check, related_articles, etc.)
    """
    tmpdir = tempfile.mkdtemp(prefix="video_scan_")
    try:
        target_video_path = os.path.join(tmpdir, "input_video.mp4")

        # handle inputs
        if youtube_url:
            _download_youtube(youtube_url, target_video_path)
        elif instagram_url:
            _download_instagram_reel(instagram_url, target_video_path)
        elif video_file is not None:
            # video_file is a Werkzeug FileStorage from Flask; save it
            filename = getattr(video_file, "filename", "upload.mp4") or "upload.mp4"
            saved = os.path.join(tmpdir, filename)
            video_file.save(saved)
            # ensure consistent name
            shutil.move(saved, target_video_path)
        else:
            raise RuntimeError("No video input provided.")

        # extract audio
        audio_path = os.path.join(tmpdir, "audio.wav")
        _extract_audio_from_video(target_video_path, audio_path)

        # transcribe audio
        transcription = _transcribe_with_whisper(audio_path)

        # predictions
        try:
            if predict_with_soft_voting:
                model_result = predict_with_soft_voting(transcription)
            else:
                model_result = {"error": "predict_with_soft_voting not available"}
        except Exception as e:
            model_result = {"error": "model failed", "details": str(e)}

        # fact-check pipeline
        try:
            if fact_check_article:
                fact_check = fact_check_article(transcription)
            else:
                fact_check = {"error": "fact_check_pipeline not available"}
        except Exception as e:
            fact_check = {"error": "fact_check failed", "details": str(e)}

        # local verify (NewsAPI/Serp fallback)
        verified, related_articles = verify_news_local_snippet(transcription)

        # aggregate final_decision from fact_check
        final_decision = _aggregate_fact_check_results(fact_check)

        # override model_result in case of decisive fact-check (like app.py logic)
        output_model_result = model_result
        if final_decision and final_decision.get("label") in ("Real", "Fake"):
            conf = float(final_decision.get("confidence") or 0)
            if final_decision["label"] == "Real":
                output_model_result = {"fake_percentage": round(100 - conf, 2), "real_percentage": round(conf, 2), "source": "fact_check_pipeline"}
            else:
                output_model_result = {"fake_percentage": round(conf, 2), "real_percentage": round(100 - conf, 2), "source": "fact_check_pipeline"}
        else:
            try:
                if isinstance(model_result, dict):
                    output_model_result = model_result.copy()
                    output_model_result["fact_check_used"] = bool(final_decision)
            except Exception:
                output_model_result = model_result

        return {
            "transcription": transcription,
            "text_snippet": (transcription or "")[:400],
            "model_result": output_model_result,
            "verified": bool(verified),
            "related_articles": related_articles or [],
            "fact_check": fact_check,
            "final_decision": final_decision
        }

    finally:
        try:
            shutil.rmtree(tmpdir)
        except Exception:
            pass