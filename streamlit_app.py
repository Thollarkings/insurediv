import streamlit as st
import streamlit.components.v1 as components
import subprocess
import os
import pathlib

st.set_page_config(
    page_title="Divine Insure",
    page_icon="🛡️",
    layout="wide",
)

st.markdown("""
<style>
    #MainMenu, header, footer { display: none !important; }
    .block-container { padding: 0 !important; }
    .stApp { overflow: hidden; }
    div[data-testid="stIFrame"] { width: 100vw; height: 100vh; }
    iframe { border: none; }
</style>
""", unsafe_allow_html=True)

ROOT = pathlib.Path(__file__).parent

convex_url = ""
try:
    convex_url = st.secrets["VITE_CONVEX_URL"]
except Exception:
    convex_url = os.environ.get("VITE_CONVEX_URL", "")

if not convex_url:
    st.error("Missing **VITE_CONVEX_URL** secret.")
    st.stop()

@st.cache_resource(show_spinner=False)
def build_react(convex_url: str):
    env = {**os.environ, "VITE_CONVEX_URL": convex_url}
    npm = subprocess.run(["which", "npm"], capture_output=True, text=True).stdout.strip() or "npm"

    # Build writes directly to `<ROOT>/static` configured in vite.config.js
    r1 = subprocess.run([npm, "install"], cwd=str(ROOT), env=env, capture_output=True, text=True)
    if r1.returncode != 0: return False, f"npm install failed:\n{r1.stdout}\n{r1.stderr}"
    
    r2 = subprocess.run([npm, "run", "build"], cwd=str(ROOT), env=env, capture_output=True, text=True)
    if r2.returncode != 0: return False, f"npm build failed:\n{r2.stdout}\n{r2.stderr}"
    
    return True, ""

with st.spinner("⚙️ Building Divine Insure — please wait..."):
    ok, msg = build_react(convex_url)

if not ok:
    st.error(msg)
    st.stop()

# Serve using Streamlit's built-in static file server pointing to `/app/static/`
components.iframe("/app/static/index.html", height=900, scrolling=True)
