import os
from dotenv import load_dotenv

APP_ENV = os.getenv("APP_ENV", "development")

if APP_ENV == "production":
    load_dotenv(".env.production")
else:
    load_dotenv(".env.development")

class Config:
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = os.getenv("DEBUG", "True") == "True"

    # SAFE default → allows localhost only
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

    PORT = int(os.getenv("PORT", 5000))
