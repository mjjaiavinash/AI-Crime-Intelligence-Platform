"""
ai/rag/seed_knowledge.py
─────────────────────────
Seeds the vector store with Karnataka crime intelligence knowledge base.
Run once: python ai/rag/seed_knowledge.py
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

KNOWLEDGE_BASE = [
    {
        "id": "karnataka_crime_overview",
        "text": """Karnataka Crime Overview 2020-2024:
Karnataka state recorded significant crime activity across 31 districts.
Bengaluru Urban consistently reports the highest crime count due to population density.
Top crime categories: Theft, Vehicle Theft, Assault, Cyber Crime, Fraud, Robbery, Burglary, Drug Offences, Murder.
High-risk districts: Bengaluru Urban, Kalaburagi, Mysuru, Belagavi, Ballari.
Crime peaks during festival seasons (Dasara, Diwali, Ugadi) and summer months (March-June).
Night hours (10 PM - 4 AM) account for 42% of all property crimes.""",
        "metadata": {"source": "karnataka_crime_overview", "category": "overview"}
    },
    {
        "id": "bengaluru_crime_patterns",
        "text": """Bengaluru Urban Crime Patterns:
Bengaluru Urban district has the highest crime density in Karnataka.
Key hotspot areas: Hebbal, Whitefield, Electronic City, Koramangala, Shivajinagar, Majestic.
Vehicle theft is the most common crime — motorcycles and cars targeted in parking lots.
Cyber crime rising sharply — phishing, UPI fraud, online scams targeting IT professionals.
Robbery incidents concentrated near ATMs, bus stands, and railway stations.
Gang activity reported in Shivajinagar, Majestic, and KR Market areas.
Population density: 4,378 per sq km. Literacy rate: 88.5%. Unemployment: 4.2%.""",
        "metadata": {"source": "bengaluru_crime_patterns", "category": "district"}
    },
    {
        "id": "repeat_offender_profile",
        "text": """Repeat Offender Profiling — Karnataka:
Repeat offenders account for 45% of all arrests in Karnataka.
Profile: Male, age 18-35, prior arrests > 3, known gang affiliations.
High recidivism crimes: Theft, Robbery, Drug Offences.
Districts with highest repeat offender rates: Bengaluru Urban, Kalaburagi, Ballari.
Gang-affiliated suspects have 3x higher recidivism probability.
Bail count > 2 is a strong predictor of repeat offending.
Known associates > 5 indicates organized criminal network involvement.""",
        "metadata": {"source": "repeat_offender_profile", "category": "profiling"}
    },
    {
        "id": "vehicle_theft_intelligence",
        "text": """Vehicle Theft Intelligence — Karnataka:
Vehicle theft is the #1 crime by volume in Karnataka (6,809 cases in dataset).
Most stolen: motorcycles (Honda Activa, Bajaj Pulsar), followed by cars.
Peak theft hours: 8 PM - 2 AM.
High-risk locations: Hospital parking, Mall parking, Bus Stand, Railway Station.
Modus operandi: Key theft, duplicate key, towing in low-traffic hours.
Recovery rate: 34% for motorcycles, 28% for cars.
Districts: Bengaluru Urban, Mysuru, Hubli-Dharwad top the list.""",
        "metadata": {"source": "vehicle_theft_intelligence", "category": "crime_type"}
    },
    {
        "id": "cyber_crime_intelligence",
        "text": """Cyber Crime Intelligence — Karnataka:
Cyber crime cases rising 28% year-over-year in Karnataka.
Top cyber crimes: UPI/banking fraud, phishing, social media impersonation, online job scams.
Primary targets: IT professionals in Bengaluru, elderly citizens, students.
Modus operandi: Fake customer care calls, OTP theft, fake investment schemes.
Kalaburagi and Bengaluru Urban report highest cyber crime counts.
Most cyber crimes occur during afternoon hours (12 PM - 4 PM).
Average financial loss per case: Rs 45,000.""",
        "metadata": {"source": "cyber_crime_intelligence", "category": "crime_type"}
    },
    {
        "id": "drug_offence_intelligence",
        "text": """Drug Offence Intelligence — Karnataka:
Drug offences concentrated in border districts: Kalaburagi, Bidar, Belagavi.
Common substances: Ganja (cannabis), MDMA, heroin, synthetic drugs.
Distribution networks operate through highway routes NH-44 and NH-48.
Gang affiliations strong in drug cases — 68% of drug suspects have known associates.
Festival seasons see 40% spike in drug-related arrests.
Age group 18-28 accounts for 72% of drug offence arrests.
Police stations near highways report highest drug seizure counts.""",
        "metadata": {"source": "drug_offence_intelligence", "category": "crime_type"}
    },
    {
        "id": "hotspot_prediction_factors",
        "text": """Crime Hotspot Prediction Factors — Karnataka:
Key factors determining High crime hotspot classification:
1. Crime_Count_Last30Days > 150: Strong indicator of High hotspot.
2. Population_Density > 10,000 per sq km: Increases hotspot probability.
3. Unemployment_Rate > 12%: Correlates with property crime hotspots.
4. Festival_Season = Yes: Temporary spike in all crime categories.
5. Previous_Year_Crime_Count > 300: Persistent hotspot indicator.
6. Location near Highway, Market, Bus Stand, Railway Station: High risk.
Medium hotspot: Crime_Count_Last30Days 50-150, moderate density.
Low hotspot: Rural areas, Crime_Count_Last30Days < 50.""",
        "metadata": {"source": "hotspot_prediction_factors", "category": "ml_insights"}
    },
    {
        "id": "investigation_best_practices",
        "text": """Investigation Best Practices — Karnataka Police:
FIR filing: Must be filed within 24 hours of incident report.
Evidence collection: Digital evidence (CCTV, mobile records) must be secured within 48 hours.
Suspect interrogation: Must follow Karnataka Police Act guidelines.
Gang-related cases: Coordinate with Special Intelligence Branch (SIB).
Cyber crime cases: Refer to Cyber Crime Police Station, CEN (Cyber Economic Narcotics) unit.
Financial crimes: Coordinate with Economic Offences Wing (EOW).
Witness protection: Apply for protection if threat level is High or Extreme.
Case closure: Target 60-day resolution for property crimes, 90 days for violent crimes.""",
        "metadata": {"source": "investigation_best_practices", "category": "procedures"}
    },
    {
        "id": "assault_murder_patterns",
        "text": """Assault and Murder Patterns — Karnataka:
Assault cases: 6,704 recorded. Peak hours: Evening (6 PM - 10 PM).
Common locations: Residential areas, markets, highways.
Weapons used: Blunt objects (rods, sticks), knives, firearms.
Murder cases: 6,683 recorded. Motive: Property disputes (34%), personal enmity (28%), robbery (18%).
High-risk districts for violent crime: Kalaburagi, Ballari, Raichur, Vijayapura.
Gang-related murders concentrated in Bengaluru Urban and Kalaburagi.
Victim profile: Male, age 25-45, known to perpetrator in 62% of cases.""",
        "metadata": {"source": "assault_murder_patterns", "category": "crime_type"}
    },
    {
        "id": "fraud_robbery_patterns",
        "text": """Fraud and Robbery Patterns — Karnataka:
Fraud cases: 6,617 recorded. Types: Banking fraud, property fraud, insurance fraud.
Robbery cases: 6,733 recorded. Armed robbery rising near ATMs and jewelry shops.
Fraud peak: Office hours (10 AM - 4 PM), targeting businesses and elderly.
Robbery peak: Night hours (8 PM - 2 AM), targeting isolated individuals.
Fraud hotspots: Bengaluru Urban (IT corridor), Mysuru, Mangaluru.
Robbery hotspots: Kalaburagi, Ballari, Vijayapura.
Financial loss from fraud: Average Rs 1.2 lakh per case.
Robbery weapon: Knife (45%), firearm (22%), blunt object (33%).""",
        "metadata": {"source": "fraud_robbery_patterns", "category": "crime_type"}
    },
]


def seed():
    from ai.embeddings.embedder import Embedder
    from ai.rag.chroma_client import ChromaClientManager

    collection = ChromaClientManager.get_collection()
    logger.info("Seeding %d knowledge documents into vector store...", len(KNOWLEDGE_BASE))

    ids        = [item["id"]       for item in KNOWLEDGE_BASE]
    documents  = [item["text"]     for item in KNOWLEDGE_BASE]
    metadatas  = [item["metadata"] for item in KNOWLEDGE_BASE]
    embeddings = Embedder.embed_documents(documents)

    collection.upsert(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)
    logger.info("Seeding complete. Total docs in store: %d", collection.count())


if __name__ == "__main__":
    seed()
