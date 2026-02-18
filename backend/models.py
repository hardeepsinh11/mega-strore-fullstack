from sqlalchemy import Column, Integer, String, Boolean
from database import Base  # database.py માંથી Base લાવ્યા

# 1. User Table
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    password = Column(String)
    is_admin=Column(Boolean, default=False)

# 2. Product Table
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    price = Column(Integer)
    stock = Column(Integer)
    description = Column(String)
    image_url = Column(String)