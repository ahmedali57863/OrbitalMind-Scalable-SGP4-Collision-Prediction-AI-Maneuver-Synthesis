from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import sqlite3
import os
from dotenv import load_dotenv

app = FastAPI(title="Vanguard Orbit API")

# Allow the React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

@app.get("/api/conjunctions")
async def get_conjunctions():
    # Ensure the database exists
    if not os.path.exists("vanguard.db"):
        return {"error": "Database not initialized. Run data_pipeline.py first."}
        
    # 1. Query the SQLite Database
    conn = sqlite3.connect("vanguard.db")
    conn.row_factory = sqlite3.Row  # Returns rows as dictionaries
    cursor = conn.cursor()
    
    # Let SQL do the sorting work!
    cursor.execute("SELECT * FROM alerts ORDER BY probability DESC")
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return {"error": "Database is empty."}
        
    # 2. Format the SQL data for the React Frontend
    satellites = []
    for row in rows:
        satellites.append({
            "satellite": row["satellite"],
            "position_x": row["x"],
            "position_y": row["y"],
            "position_z": row["z"],
            "collision_probability": row["probability"]
        })

    # The highest risk is simply the first item since we used ORDER BY DESC
    highest_risk = satellites[0] 
    
    # 3. Prompt the AI Commander
    prompt = f"""
    You are Vanguard AI, an autonomous aerospace traffic controller.
    We have a critical conjunction alert for satellite: {highest_risk['satellite']}.
    The PySpark ML engine has calculated a collision probability of {highest_risk['collision_probability']}%.
    Current Cartesian coordinates (km): X: {highest_risk['position_x']}, Y: {highest_risk['position_y']}, Z: {highest_risk['position_z']}.
    
    Provide a strict, 3-step technical evasive maneuver sequence to avoid collision. Keep it highly professional and brief. 
    IMPORTANT: Output plain text only. Do not use markdown bolding, asterisks, or LaTeX formatting.
    """
    
    print(f"Asking AI for evasive maneuver for {highest_risk['satellite']}...")
    try:
        response = model.generate_content(prompt)
        ai_directive = response.text
    except Exception as e:
        print(f"\n[GEMINI API ERROR] -> {str(e)}\n") 
        ai_directive = "AI Communication Failure. Initiate manual override."

    # 4. Send everything to the React Frontend
    return {
        "status": "CRITICAL ALERTS DETECTED",
        "targets": satellites,
        "ai_analysis": {
            "target": highest_risk['satellite'],
            "directive": ai_directive
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting Vanguard Orbit API Server...")
    uvicorn.run(app, host="127.0.0.1", port=8000)