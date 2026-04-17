import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

base_path = os.path.dirname(__file__) 
csv_path = os.path.join(base_path, '..', 'data', 'master_risk_data.csv')

print(f"Searching for CSV at: {csv_path}")

try:
    df = pd.read_csv(csv_path)
    print("✅ Master CSV file mil gayi!")
except FileNotFoundError:
    print(f"❌ Error: CSV file nahi mili! Kya aapne pehle 'process_data.py' run kiya hai?")
    exit()

le_dist = LabelEncoder()
le_sect = LabelEncoder()

df['Dist_Enc'] = le_dist.fit_transform(df['District'].astype(str))
df['Sect_Enc'] = le_sect.fit_transform(df['Sector'].astype(str))

X = df[['Dist_Enc', 'Sect_Enc', 'Area']]
y = df['Risk_Level']

model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

joblib.dump(model, os.path.join(base_path, 'risk_model.pkl'))
joblib.dump(le_dist, os.path.join(base_path, 'le_dist.pkl'))
joblib.dump(le_sect, os.path.join(base_path, 'le_sect.pkl'))

print("🎉 Model trained and saved successfully in 'backend' folder!")