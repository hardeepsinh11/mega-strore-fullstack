from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./megastore.db"

# 1. Engine બનાવો
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# 2. Session બનાવો (વાતચીત કરવા માટે)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Base (જેના પરથી models બનશે)
Base = declarative_base()

# 4. Dependency (દરેક API માં કામ લાગશે)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()