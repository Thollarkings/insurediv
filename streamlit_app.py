import streamlit as st
import streamlit.components.v1 as components
import subprocess
import os
import pathlib
import threading
import http.server
import socket

st.set_page_config(
    page_title="Divine Insure",
    page_icon="🛡️",
    layout="wide",
)

# Hide Streamlit chrome with CSS
st.markdown("""
<style>
    #MainMenu, header, footer { display: none !important; }
    .block-container { padding: 0 !important; }
    .stApp { overflow: hidden; }
</style>
""", unsafe_allow_html=True)

# ── Config ─────────────────────────────────────────────────────────────────────
ROOT = pathlib.Path(__file__).parent
BUILD_DIR = ROOT / "dist"
STATIC_PORT = 3999


# ── Get Convex URL from secrets ───────────────────────────────────────────────
convex_url = ""
try:
    convex_url = st.secrets["VITE_CONVEX_URL"]
except Exception:
    convex_url = os.environ.get("VITE_CONVEX_URL", "")

if not convex_url:
    st.error(
        "**VITE_CONVEX_URL** secret is missing.\n\n"
        "In your Streamlit Cloud app go to **Settings → Secrets** and add:\n"
        "```toml\nVITE_CONVEX_URL = \"https://your-deployment.convex.cloud\"\n```"
    )
    st.stop()


# ── Build React app (cached per deployment) ───────────────────────────────────
@st.cache_resource(show_spinner=False)
def build_react(convex_url: str):
    env = {**os.environ, "VITE_CONVEX_URL": convex_url}
    npm = subprocess.run(["which", "npm"], capture_output=True, text=True).stdout.strip() or "npm"

    result = subprocess.run(
        [npm, "install"], cwd=str(ROOT), env=env,
        capture_output=True, text=True
    )
    if result.returncode != 0:
        return False, f"npm install failed:\n{result.stdout}\n{result.stderr}"

    result = subprocess.run(
        [npm, "run", "build"], cwd=str(ROOT), env=env,
        capture_output=True, text=True
    )
    if result.returncode != 0:
        return False, f"npm run build failed:\n{result.stdout}\n{result.stderr}"

    return True, "Build successful"


with st.spinner("⚙️ Building Divine Insure — please wait..."):
    ok, msg = build_react(convex_url)

if not ok:
    st.error(msg)
    st.stop()


# ── Start a background static file server for the dist folder ─────────────────
@st.cache_resource
def start_static_server():
    class SpaHandler(http.server.SimpleHTTPRequestHandler):
        """Serve dist/; fall back to index.html for React Router paths."""
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(BUILD_DIR), **kwargs)

        def do_GET(self):
            # If path doesn't correspond to a real file, serve index.html
            requested = BUILD_DIR / self.path.lstrip("/").split("?")[0]
            if not requested.exists() or requested.is_dir():
                self.path = "/index.html"
            return super().do_GET()

        def log_message(self, *args):
            pass  # suppress access logs

    def pick_port(default):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("localhost", default)) != 0:
                return default
        return default  # already bound, reuse

    port = pick_port(STATIC_PORT)
    server = http.server.HTTPServer(("", port), SpaHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return port


port = start_static_server()

# ── Embed the React app in a full-screen iframe ───────────────────────────────
APP_URL = f"http://localhost:{port}/"

components.html(
    f"""
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ overflow: hidden; }}
        iframe {{
            width: 100vw;
            height: 100vh;
            border: none;
            display: block;
        }}
    </style>
    <iframe
        src="{APP_URL}"
        allow="fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
    ></iframe>
    """,
    height=900,
    scrolling=False,
)
