import logging
import joblib
import numpy as np
import pandas as pd
from scipy.sparse import hstack, csr_matrix
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

logger = logging.getLogger(__name__)

DATASET_PATH     = "ml/Dataset Model/Crime_Classification_Training_Dataset_Model3.xlsx"
TARGET_COL       = "Crime_Type"
DROP_COLS        = ["Case_ID"]
TEXT_COL         = "Description"
DATE_COL         = "Incident_Date"

CATEGORICAL_COLS = ["District", "Location_Type", "Time_of_Day", "Victim_Gender", "Weapon_Used"]
NUMERICAL_COLS   = ["Victim_Age", "Incident_Month", "Incident_DayOfWeek", "Incident_Year", "Is_Weekend"]


def load_data() -> pd.DataFrame:
    logger.info("Loading dataset from %s", DATASET_PATH)
    df = pd.read_excel(DATASET_PATH)
    logger.info("Dataset loaded -- %d rows, %d columns", *df.shape)
    return df


def run_eda(df: pd.DataFrame) -> None:
    logger.info("=" * 60)
    logger.info("EDA REPORT -- CRIME CLASSIFIER")
    logger.info("=" * 60)
    logger.info("Shape         : %d rows, %d columns", *df.shape)
    logger.info("Duplicates    : %d", df.duplicated().sum())
    logger.info("Missing values:\n%s", df.isnull().sum().to_string())
    logger.info("Data types:\n%s", df.dtypes.to_string())
    logger.info("Class distribution:\n%s", df[TARGET_COL].value_counts().to_string())
    logger.info("=" * 60)


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    before = len(df)
    df = df.drop_duplicates()
    df = df.drop(columns=DROP_COLS, errors="ignore")
    # Fill missing Weapon_Used with "Unknown"
    df["Weapon_Used"] = df["Weapon_Used"].fillna("Unknown")
    df = df.dropna(subset=[TARGET_COL, TEXT_COL])
    logger.info("Cleaning: %d -> %d rows", before, len(df))
    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df[DATE_COL] = pd.to_datetime(df[DATE_COL], errors="coerce")
    df["Incident_Month"]      = df[DATE_COL].dt.month.fillna(0).astype(int)
    df["Incident_DayOfWeek"]  = df[DATE_COL].dt.dayofweek.fillna(0).astype(int)
    df["Incident_Year"]       = df[DATE_COL].dt.year.fillna(2023).astype(int)
    df["Is_Weekend"]          = df["Incident_DayOfWeek"].apply(lambda x: 1 if x >= 5 else 0)
    df = df.drop(columns=[DATE_COL], errors="ignore")
    logger.info("Date features extracted: Month, DayOfWeek, Year, Is_Weekend")
    return df


def build_structured_preprocessor() -> ColumnTransformer:
    return ColumnTransformer([
        ("cat", Pipeline([
            ("enc", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1))
        ]), CATEGORICAL_COLS),
        ("num", Pipeline([
            ("scaler", StandardScaler())
        ]), NUMERICAL_COLS),
    ])


def encode_target(y: pd.Series) -> tuple:
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    logger.info("Target classes (%d): %s", len(le.classes_), le.classes_.tolist())
    return y_encoded, le


def prepare_features(df: pd.DataFrame) -> tuple:
    y_encoded, le = encode_target(df[TARGET_COL])

    # TF-IDF on Description
    tfidf = TfidfVectorizer(max_features=300, ngram_range=(1, 2), sublinear_tf=True)
    X_text = tfidf.fit_transform(df[TEXT_COL].astype(str))
    logger.info("TF-IDF matrix shape: %s", X_text.shape)

    # Structured features
    structured_preprocessor = build_structured_preprocessor()
    X_struct = structured_preprocessor.fit_transform(df[CATEGORICAL_COLS + NUMERICAL_COLS])
    X_struct_sparse = csr_matrix(X_struct)

    # Combine text + structured
    X_combined = hstack([X_text, X_struct_sparse])
    logger.info("Combined feature matrix shape: %s", X_combined.shape)

    # Feature names for importance plots
    tfidf_names   = [f"tfidf_{t}" for t in tfidf.get_feature_names_out()]
    feature_names = tfidf_names + CATEGORICAL_COLS + NUMERICAL_COLS

    return X_combined, y_encoded, tfidf, structured_preprocessor, le, feature_names


def save_artifacts(tfidf, structured_preprocessor, le,
                   preprocessor_path: str, le_path: str) -> None:
    joblib.dump({"tfidf": tfidf, "structured": structured_preprocessor}, preprocessor_path)
    joblib.dump(le, le_path)
    logger.info("Preprocessor saved -> %s", preprocessor_path)
    logger.info("Label encoder saved -> %s", le_path)
