from fastapi import FastAPI, Depends,File, HTTPException, status,Form, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm,OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import or_
from passlib.context import CryptContext
from jose import jwt,JWTError
import shutil
from fastapi.middleware.cors import CORSMiddleware

# આપણી બનાવેલી ફાઈલો ઈમ્પોર્ટ કરીએ
import models
import schemas
from database import engine, get_db

# --- Security Config ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "my_secret_password"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- Helper Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- App Setup ---
# આ લાઈન જાદુ કરે છે: models માં જે લખ્યું છે તે database માં બનાવી દેશે
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
origins = [
    "http://localhost",
    "http://localhost:8080",
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # જો આ સુપર એડમિન હોય, તો ડેટાબેઝ ચેક કરવાની જરૂર નથી
    if email == "admin@gmail.com":
        # એક કામચલાઉ "User" ઓબ્જેક્ટ બનાવીને પાછો મોકલો
        class SuperUser:
            id = 0
            email = "admin@gmail.com"
            is_admin = True
        return SuperUser()

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.get("/")
def read_root():
    return {"message": "Mega Store is Running!"}

# --- Signup API ---
@app.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # નોંધ: હવે આપણે 'models.User' અને 'schemas.UserCreate' વાપરવું પડશે
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)

    db_user = models.User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password=hashed_password,
        is_admin=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User created", "user_id": db_user.id}

# --- Login API ---
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
  
    if form_data.username == "admin@gmail.com" and form_data.password == "Admin@123":
        # આના માટે ડેટાબેઝ ચેક કરવાની જરૂર નથી, આ તો બોસ છે!
        access_token = create_access_token(data={"sub": form_data.username})
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "is_admin": True  # 👉 આપણે Frontend ને કહીએ છીએ કે આ એડમિન છે
        }  
  
    user = db.query(models.User).filter(
        or_(models.User.email == form_data.username,models.User.name ==form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "is_admin": user.is_admin 
    }
# --- Product API ---
@app.post("/products/add")
def add_product(
    name: str = Form(...),          # હવે JSON નહિ, Form(...) વપરાશે
    category: str = Form(...),
    price: int = Form(...),
    stock: int = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...),   # આ છે અસલી ફાઈલ!
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)):
    # શરત 1: શું આ Admin છે? (Only Admin Check)
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Sorry! Only Admin can Add the products")

    file_location = f"static/{file.filename}"
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # શરત 2: ભાવ નેગેટિવ ના હોવો જોઈએ (Price Validation)
    full_image_url = f"http://127.0.0.1:8000/static/{file.filename}"
   
    new_product = models.Product(
        name=name,
        category=category,
        price=price,
        stock=stock,
        description=description,
        image_url=full_image_url
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {"message": "Product with Image added!", "product": new_product}

@app.get("/products/")
def read_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    return products

@app.post("/buy/{product_id}")
def buy_product(product_id: int, db: Session = Depends(get_db)):
    # 1. પ્રોડક્ટ શોધો
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product નથી મળી.")

    # શરત 3: સ્ટોક છે કે નહિ? (Out of Stock Check)
    if product.stock <= 0:
        raise HTTPException(status_code=400, detail="Out of Stock! માલ ખલાસ થઈ ગયો છે.")

    # જો સ્ટોક હોય, તો 1 ઘટાડો
    product.stock -= 1
    db.commit()
    
    return {"message": f"અભિનંદન! તમે {product.name} ખરીદી લીધું.", "remaining_stock": product.stock}