import logging
import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler, OrdinalEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

logger = logging.getLogger(__name__)

DATASET_PATH = "ml/Dataset Model/Repeat_Offender_Training_Dataset_Model2.xlsx"
TARGET_COL   = "Repeat_Offender"
DROP_COLS    = ["Suspect_ID"]

CATEGORICAL_COLS = ["Gender", "District", "Primary_Crime_Type", "Gang_Affiliation"]
NUMERICAL_COLS   = [
    "Age", "Previous_Arrests", "Previous_Convictions",
    "Years_Active", "Bail_Count", "Known_Associates"
]


def load_data() -> pd.DataFrame:
    logger.info("Loading dataset from %s", DATASET_PATH)
    df = pd.read_excel(DATASET_PATH)
    logger.info("Dataset loaded -- shape: %s rows, %s columns", *df.shape)
    return df


def run_eda(df: pd.DataFrame) -> None:
    logger.info("=" * 60)
    logger.info("EDA REPORT -- REPEAT OFFENDER")
    logger.info("=" * 60)
    logger.info("Shape         : %s rows, %s columns", *df.shape)
    logger.info("Duplicates    : %d", df.duplicated().sum())
    logger.info("Missing values:\n%s", df.isnull().sum().to_string())
    logger.info("Data types:\n%s", df.dtypes.to_string())
    logger.info("Class distribution:\n%s", df[TARGET_COL].value_counts().to_string())
    logger.info("Class balance %%:\n%s", df[TARGET_COL].value_counts(normalize=True).mul(100).round(2).to_string())
    logger.info("Numerical summary:\n%s", df[NUMERICAL_COLS].describe().to_string())
    logger.info("=" * 60)


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    before = len(df)
    df = df.drop_duplicates()
    df = df.dropna()
    df = df.drop(columns=DROP_COLS, errors="ignore")
    logger.info("Cleaning: %d -> %d rows", before, len(df))
    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    # Criminal intensity score
    df["Criminal_Intensity"] = (
        df["Previous_Arrests"] * 0.3 +
        df["Previous_Convictions"] * 0.4 +
        df["Bail_Count"] * 0.2 +
        df["Known_Associates"] * 0.1
    )
    # Arrest to conviction ratio
    df["Arrest_Conviction_Ratio"] = df["Previous_Convictions"] / (df["Previous_Arrests"] + 1)
    # Activity rate: crimes per year active
    df["Activity_Rate"] = df["Previous_Arrests"] / (df["Years_Active"] + 1)
    logger.info("Feature engineering complete -- 3 new features added")
    return df


def build_preprocessor() -> ColumnTransformer:
    engineered_numerical = NUMERICAL_COLS + [
        "Criminal_Intensity", "Arrest_Conviction_Ratio", "Activity_Rate"
    ]
    categorical_pipeline = Pipeline([
        ("encoder", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1))
    ])
    numerical_pipeline = Pipeline([
        ("scaler", StandardScaler())
    ])
    return ColumnTransformer([
        ("cat", categorical_pipeline, CATEGORICAL_COLS),
        ("num", numerical_pipeline, engineered_numerical),
    ])


def encode_target(y: pd.Series) -> tuple:
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    logger.info("Label classes: %s", le.classes_.tolist())
    return y_encoded, le


def prepare_features(df: pd.DataFrame) -> tuple:
    all_num = NUMERICAL_COLS + ["Criminal_Intensity", "Arrest_Conviction_Ratio", "Activity_Rate"]
    feature_cols = CATEGORICAL_COLS + all_num
    X = df[feature_cols]
    y = df[TARGET_COL]
    y_encoded, le = encode_target(y)
    preprocessor = build_preprocessor()
    X_transformed = preprocessor.fit_transform(X)
    logger.info("Feature matrix shape after preprocessing: %s", X_transformed.shape)
    return X_transformed, y_encoded, preprocessor, le, feature_cols


def save_artifacts(preprocessor, le, preprocessor_path: str, le_path: str) -> None:
    joblib.dump(preprocessor, preprocessor_path)
    joblib.dump(le, le_path)
    logger.info("Preprocessor saved -> %s", preprocessor_path)
    logger.info("Label encoder saved -> %s", le_path)
