from datetime import datetime
import os
import json
import csv
import requests
from sgp4.api import Satrec, jday
from pyspark.sql import SparkSession
from pyspark.sql.types import DoubleType, IntegerType
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.classification import LogisticRegression

# Secure Windows Environment mapping
os.environ["HADOOP_HOME"] = "C:\\hadoop"

print("Initiating Vanguard Orbit - SPACE-TRACK JSON Big Data Pipeline...")

def run_pipeline():
    # ==========================================
    # PHASE 1: US Space Command API Auth & Physics
    # ==========================================
    siteCred = {'identity': 'ahmedali57863@gmail.com', 'password': 'P1kistanSpace_!'}
    
    print("1. Authenticating with US Space Command (Space-Track.org)...")
    session = requests.Session()
    
    try:
        login_resp = session.post("https://www.space-track.org/ajaxauth/login", data=siteCred)
        login_resp.raise_for_status()
        
        print("-> Auth successful. Downloading live telemetry JSON database...")
        query_url = "https://www.space-track.org/basicspacedata/query/class/gp/DECAY_DATE/null-val/EPOCH/%3Enow-7/orderby/NORAD_CAT_ID/limit/1000"
        data_resp = session.get(query_url)
        data_resp.raise_for_status()
        
        with open("active_satellites.json", "w", encoding="utf-8") as f:
            f.write(data_resp.text)
        print("-> Download complete. Saved to JSON Data Lake.")
            
    except Exception as e:
        print(f"\n[API ERROR] Space-Track login failed. ({e})\n")
        return 

    print("2. Running SGP4 Orbital Mechanics (JSON Parsing Mode)...")
    physics_data = []
    
    with open("active_satellites.json", "r", encoding="utf-8") as f:
        satellites = json.load(f)

   # 🚨 THE FIX: Get the exact live time right now!
    now = datetime.utcnow()
    jd, fr = jday(now.year, now.month, now.day, now.hour, now.minute, now.second)

    for sat in satellites:
        name = sat.get("OBJECT_NAME", "UNKNOWN_TARGET")
        line1 = sat.get("TLE_LINE1")
        line2 = sat.get("TLE_LINE2")
        
        if not line1 or not line2:
            continue
            
        try:
            satellite = Satrec.twoline2rv(line1, line2)
            # Pass the Julian Date directly to the physics engine
            e, r, v = satellite.sgp4(jd, fr)
            if e == 0:
                # ML Label: Risk (1) if altitude (Z) drops below 2000km, Safe (0) otherwise
                is_risk = 1 if float(r[2]) < 2000 else 0
                physics_data.append([name, float(r[0]), float(r[1]), float(r[2]), is_risk])
        except Exception as ex:
            pass

    physics_data.append(["GUARANTEE_SAFE_ORBIT", 9999.0, 9999.0, 9999.0, 0])
    physics_data.append(["CRITICAL_DEBRIS_ANOMALY", 111.0, 111.0, 111.0, 1])

    csv_file = "temp_physics.csv"
    with open(csv_file, mode='w', newline='', encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["sat_name", "x", "y", "z", "label"])
        writer.writerows(physics_data)

    # ==========================================
    # PHASE 2: PySpark Machine Learning (Safe JVM Mode)
    # ==========================================
    print(f"3. Booting PySpark Offline Engine. Processing {len(physics_data)} orbital targets...")
    spark = SparkSession.builder \
        .appName("Vanguard_ML_Engine") \
        .master("local[*]") \
        .getOrCreate()
    spark.sparkContext.setLogLevel("ERROR")

    df = spark.read.csv(csv_file, header=True, inferSchema=True)

    df = df.withColumn("x", df["x"].cast(DoubleType())) \
           .withColumn("y", df["y"].cast(DoubleType())) \
           .withColumn("z", df["z"].cast(DoubleType())) \
           .withColumn("label", df["label"].cast(IntegerType())) \
           .dropna()

    print("4. Training L2 Penalty Logistic Regression Model...")
    assembler = VectorAssembler(inputCols=["x", "y", "z"], outputCol="features")
    ml_df = assembler.transform(df)

    lr = LogisticRegression(featuresCol="features", labelCol="label", regParam=0.1)
    model = lr.fit(ml_df)
    predictions = model.transform(ml_df)
    
    print("5. Extracting High-Risk Targets...")
    results = predictions.collect()
    
    output_data = []
    for row in results:
        prob_val = float(row["probability"][1]) * 100
        output_data.append({
            "satellite": row["sat_name"],
            "position_x": round(row["x"], 2),
            "position_y": round(row["y"], 2),
            "position_z": round(row["z"], 2),
            "collision_probability": round(prob_val, 1)
        })

    with open("conjunctions.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=4)

    # Save the new real data!
    with open("conjunctions.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=4)

    # ==========================================
    # PHASE 3: RELATIONAL DATABASE INTEGRATION
    # ==========================================
    import sqlite3
    print("6. Committing PySpark Results to SQLite Relational Database...")
    
    # Connect to the database (it will create vanguard.db automatically)
    conn = sqlite3.connect("vanguard.db")
    cursor = conn.cursor()
    
    # Create the SQL table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            satellite TEXT,
            x REAL,
            y REAL,
            z REAL,
            probability REAL
        )
    ''')
    
    # Flush old data so we only serve the freshest Big Data scan
    cursor.execute('DELETE FROM alerts')
    
    # Insert the ML predictions into the database
    for item in output_data:
        cursor.execute('''
            INSERT INTO alerts (satellite, x, y, z, probability)
            VALUES (?, ?, ?, ?, ?)
        ''', (item['satellite'], item['position_x'], item['position_y'], item['position_z'], item['collision_probability']))
        
    conn.commit()
    conn.close()
    print("-> Database commit successful.")

    spark.stop()
    print("\n[SUCCESS] Lambda Architecture Pipeline Complete!")

if __name__ == "__main__":
    run_pipeline()