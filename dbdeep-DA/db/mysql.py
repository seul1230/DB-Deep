from sqlalchemy import create_engine, Column, String
from sqlalchemy.orm import declarative_base, sessionmaker
from config.settings import settings

Base = declarative_base()

class ChatRoom(Base):
    __tablename__ = "chatroom"
    id = Column(String(64), primary_key=True)

engine = create_engine(settings.db_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
