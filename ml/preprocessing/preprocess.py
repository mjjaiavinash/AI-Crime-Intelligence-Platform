import logging
import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OrdinalEncoder

logger = logging.getLogger(__name__)

DATASET_PATH = "ml/Dataset Model/Crime_Hotspot_Prediction_Training_Dataset_100K_Model1.xlsx"
TARGET_COL = "Hotspot_Label"
DROP_COLS = ["FIR_ID", "Crime_Date"]

CATEGORICAL_COLS = ["District", "Taluk", "Police_Station", "Crime_Type", "Season", "Festival_Season"]
NUMERICAL_COLS = [
    "Year", "Month", "Latitude", "Longitude",
    "Population", "Population_Density", "Literacy_Rate",
    "Unemployment_Rate", "Crime_Count_Last30Days", "Previous_Year_Crime_Count"
]


def load_data() -> pd.DataFrame:
    logger.info("Loading dataset from %s", DATASET_PATH)
    df = pd.read_excel(DATASET_PATH)
    logger.info("Dataset loaded — shape: %s", df.shape)
    return df


def run_eda(df: pd.DataFrame) -> None:
    logger.info("=" * 60)
    logger.info("EDA REPORT")
    logger.info("=" * 60)
    logger.info("Shape         : %s rows, %s columns", *df.shape)
    logger.info("Duplicates    : %d", df.duplicated().sum())
    logger.info("Missing values:\n%s", df.isnull().sum().to_string())
    logger.info("Data types:\n%s", df.dtypes.to_string())
    logger.info("Class distribution:\n%s", df[TARGET_COL].value_counts().to_string())
    logger.info("Numerical summary:\n%s", df[NUMERICAL_COLS].describe().to_string())
    logger.info("=" * 60)


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    before = len(df)
    df = df.drop_duplicates()
    df = df.dropna()
    df = df.drop(columns=DROP_COLS, errors="ignore")
    logger.info("Cleaning: %d -> %d rows", before, len(df))
    return df


def build_preprocessor() -> ColumnTransformer:
    categorical_pipeline = Pipeline([
        ("encoder", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1))
    ])
    numerical_pipeline = Pipeline([
        ("scaler", StandardScaler())
    ])
    preprocessor = ColumnTransformer([
        ("cat", categorical_pipeline, CATEGORICAL_COLS),
        ("num", numerical_pipeline, NUMERICAL_COLS),
    ])
    return preprocessor


def encode_target(y: pd.Series) -> tuple:
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    logger.info("Label classes: %s", le.classes_.tolist())
    return y_encoded, le


def prepare_features(df: pd.DataFrame) -> tuple:
    X = df[CATEGORICAL_COLS + NUMERICAL_COLS]
    y = df[TARGET_COL]
    y_encoded, le = encode_target(y)
    preprocessor = build_preprocessor()
    X_transformed = preprocessor.fit_transform(X)
    logger.info("Feature matrix shape after preprocessing: %s", X_transformed.shape)
    return X_transformed, y_encoded, preprocessor, le


def save_artifacts(preprocessor, le, preprocessor_path: str, le_path: str) -> None:
    joblib.dump(preprocessor, preprocessor_path)
    joblib.dump(le, le_path)
    logger.info("Preprocessor saved -> %s", preprocessor_path)
    logger.info("Label encoder saved -> %s", le_path)
