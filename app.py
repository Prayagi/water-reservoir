from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import joblib
import os
import pandas as pd
import sys

base_path = os.path.dirname(__file__)
project_root = os.path.dirname(base_path)
data_path = os.path.join(project_root, "data", "master_risk_data.csv")

app = Flask(__name__, static_folder=project_root, static_url_path="")
CORS(app)

SCENARIO_CONFIG = {
    "baseline": {"demand_multiplier": 1.00, "storage_multiplier": 1.00, "label": "Baseline"},
    "optimistic": {"demand_multiplier": 0.95, "storage_multiplier": 1.06, "label": "Optimistic (Low Growth)"},
    "pessimistic": {"demand_multiplier": 1.10, "storage_multiplier": 0.92, "label": "Pessimistic (High Growth)"},
    "climate": {"demand_multiplier": 1.07, "storage_multiplier": 0.87, "label": "Climate Impact"},
}

RISK_FACTORS = {"Low": 1.00, "Medium": 1.10, "High": 1.22}
SECTOR_COEFFICIENTS = {"Agriculture": 0.0000185, "Domestic": 0.0000082}

try:
    model = joblib.load(os.path.join(base_path, "risk_model.pkl"))
    le_dist = joblib.load(os.path.join(base_path, "le_dist.pkl"))
    le_sect = joblib.load(os.path.join(base_path, "le_sect.pkl"))
    dashboard_df = pd.read_csv(data_path)
    dashboard_df["District"] = dashboard_df["District"].astype(str).str.strip()
    dashboard_df["Sector"] = dashboard_df["Sector"].astype(str).str.strip()
    dashboard_df["Risk_Level"] = dashboard_df["Risk_Level"].astype(str).str.strip().str.title()
    dashboard_df["risk_factor"] = dashboard_df["Risk_Level"].map(RISK_FACTORS).fillna(1.0)
    dashboard_df["sector_coefficient"] = dashboard_df["Sector"].map(SECTOR_COEFFICIENTS).fillna(0.00001)
    dashboard_df["base_demand"] = (
        dashboard_df["Area"].fillna(0).astype(float)
        * dashboard_df["sector_coefficient"]
        * dashboard_df["risk_factor"]
    )
    print("All models and dashboard data loaded successfully.")
except FileNotFoundError as error:
    print(f"Error: Required file nahi mili. Details: {error}")
    sys.exit(1)


def normalize_district(value):
    cleaned = " ".join(str(value).strip().split())
    if not cleaned:
        return cleaned

    lowered_model_map = {item.lower(): item for item in le_dist.classes_}
    if cleaned in le_dist.classes_:
        return cleaned
    if cleaned.lower() in lowered_model_map:
        return lowered_model_map[cleaned.lower()]

    data_districts = dashboard_df["District"].dropna().unique().tolist()
    lowered_data_map = {item.lower(): item for item in data_districts}
    return lowered_data_map.get(cleaned.lower(), cleaned.title())


def normalize_sector(value):
    cleaned = " ".join(str(value).strip().split())
    if not cleaned:
        return cleaned

    lowered_map = {item.lower(): item for item in le_sect.classes_}
    if cleaned in le_sect.classes_:
        return cleaned
    return lowered_map.get(cleaned.lower(), cleaned.title())


def get_filtered_dashboard_df(region_value):
    if region_value == "all":
        return dashboard_df.copy(), "All Regions"

    district_name = normalize_district(region_value)
    filtered = dashboard_df[dashboard_df["District"].str.lower() == district_name.lower()].copy()
    if filtered.empty:
        return dashboard_df.copy(), "All Regions"
    return filtered, district_name


def build_dashboard_payload(year_value, scenario_key, region_value):
    scenario = SCENARIO_CONFIG.get(scenario_key, SCENARIO_CONFIG["baseline"])
    filtered_df, region_label = get_filtered_dashboard_df(region_value)

    year = int(year_value)
    year_growth = 1 + ((year - 2026) * 0.018)
    demand_multiplier = scenario["demand_multiplier"] * year_growth
    storage_multiplier = scenario["storage_multiplier"] * (1 - ((year - 2026) * 0.006))

    sector_summary = (
        filtered_df.groupby("Sector", as_index=False)["base_demand"]
        .sum()
        .sort_values("base_demand", ascending=False)
    )

    sector_summary["projected_demand"] = sector_summary["base_demand"] * demand_multiplier
    total_demand = float(sector_summary["projected_demand"].sum())

    risk_mix = filtered_df["risk_factor"].mean() if not filtered_df.empty else 1.0
    storage_base = total_demand * (0.93 - ((risk_mix - 1.0) * 0.55))
    available_storage = max(storage_base * storage_multiplier, 0)
    deficit = available_storage - total_demand

    sector_labels = sector_summary["Sector"].tolist()
    sector_values = [round(value, 1) for value in sector_summary["projected_demand"].tolist()]

    base_demand_2025 = float(sector_summary["base_demand"].sum())
    demand_change_pct = ((total_demand / base_demand_2025) - 1) * 100 if base_demand_2025 else 0
    storage_change_pct = ((available_storage / storage_base) - 1) * 100 if storage_base else 0

    annual_labels = [str(label_year) for label_year in range(2020, 2031)]
    demand_series = []
    optimistic_series = []
    pessimistic_series = []

    for label_year in range(2020, 2031):
        delta = label_year - year
        timeline_factor = 1 + (delta * 0.02)
        demand_series.append(round(total_demand * timeline_factor, 1))
        optimistic_series.append(round(total_demand * 0.95 * (1 + delta * 0.016), 1))
        pessimistic_series.append(round(total_demand * 1.08 * (1 + delta * 0.024), 1))

    storage_labels = ["2022", "2023", "2024", "2025", "2026"]
    demand_bar = []
    storage_bar = []
    for label_year in range(2022, 2027):
        delta = label_year - year
        demand_bar.append(round(total_demand * (1 + delta * 0.02), 1))
        storage_bar.append(round(max(available_storage * (1 - delta * 0.015), 0), 1))

    if deficit <= -8:
        risk_level = "HIGH"
        risk_message = "Immediate intervention required"
    elif deficit <= -3:
        risk_level = "MEDIUM"
        risk_message = "Requires monitoring"
    else:
        risk_level = "LOW"
        risk_message = "Storage currently stable"

    return {
        "region": region_label,
        "scenario": scenario["label"],
        "year": year,
        "summary": {
            "totalDemand": round(total_demand, 1),
            "availableStorage": round(available_storage, 1),
            "balance": round(deficit, 1),
            "riskLevel": risk_level,
            "riskMessage": risk_message,
            "demandChangeText": (
                f"{'Up' if demand_change_pct >= 0 else 'Down'} {abs(demand_change_pct):.1f}% from 2025"
            ),
            "storageChangeText": (
                f"{'Up' if storage_change_pct >= 0 else 'Down'} {abs(storage_change_pct):.1f}% available"
            ),
        },
        "sectorChart": {
            "labels": sector_labels,
            "values": sector_values,
        },
        "demandChart": {
            "labels": annual_labels,
            "baseline": demand_series,
            "optimistic": optimistic_series,
            "pessimistic": pessimistic_series,
        },
        "storageChart": {
            "labels": storage_labels,
            "demand": demand_bar,
            "storage": storage_bar,
        },
    }


@app.route("/")
def home():
    return send_from_directory(project_root, "index.html")


@app.route("/dashboard")
def dashboard():
    return send_from_directory(project_root, "dashboard.html")


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/dashboard-data")
def dashboard_data():
    year = request.args.get("year", 2026)
    scenario = request.args.get("scenario", "baseline")
    region = request.args.get("region", "all")
    return jsonify(build_dashboard_payload(year, scenario, region))


@app.route("/predict-risk", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}

    try:
        district = normalize_district(data["district"])
        sector = normalize_sector(data["sector"])
        area = float(data["area"])

        if not district or not sector:
            raise ValueError("District aur sector required hain.")

        d_idx = le_dist.transform([district])[0]
        s_idx = le_sect.transform([sector])[0]
        prediction = model.predict([[d_idx, s_idx, area]])

        return jsonify({
            "risk_level": str(prediction[0]),
            "district": district,
            "sector": sector
        })
    except Exception as error:
        return jsonify({
            "risk_level": "Data Not Available",
            "error": str(error)
        }), 400


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(project_root, path)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
