import streamlit as st
import os
import streamlit.components.v1 as components

# Divine Insure Prototype Redirect/Wrapper
st.set_page_config(page_title="Divine Insure - Staff Admin", layout="wide")

st.markdown("""
    <style>
    .main {
        background-color: #002147;
    }
    .stApp {
        background: #002147;
    }
    </style>
    """, unsafe_allow_html=True)

st.title("Divine Insure Prototype Hosting")

st.write("""
This Streamlit app serves as a gateway to the Divine Insure React prototype. 
In a production environment, the React build would be served directly.
""")

# Check if build exists, if not, show instructions
if not os.path.exists("dist"):
    st.warning("React production build not found. Please run `npm run build` to generate the files.")
    if st.button("Simulate Prototype View"):
        st.info("Directing you to the landing page mock...")
        st.markdown("[Open Prototype in New Tab](http://localhost:5173)")
else:
    # Serve the React app via iframe or static serving
    st.success("Prototype build detected!")
    # Simple redirect simulation or instruction
    st.write("The React app is built and ready for deployment.")

st.sidebar.title("Staff Quick Actions")
st.sidebar.button("Check Convex Status")
st.sidebar.button("Clear Log Cache")
