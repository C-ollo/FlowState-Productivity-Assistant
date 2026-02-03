from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    connections = relationship("Connection", back_populates="user")
    items = relationship("Item", back_populates="user")
    tasks = relationship("Task", back_populates="user")
    briefings = relationship("Briefing", back_populates="user")

class Connection(Base):
    __tablename__ = "connections"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider = Column(String, nullable=False) # gmail, slack, etc.
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    meta_data = Column(JSON, nullable=True) # Profile info, scopes
    
    user = relationship("User", back_populates="connections")

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    source_id = Column(String, nullable=False) # ID from external provider
    platform = Column(String, nullable=False) # gmail, slack
    type = Column(String, nullable=False) # email, message, event
    
    sender = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    content = Column(Text, nullable=True)
    received_at = Column(DateTime(timezone=True), nullable=True)
    
    # AI Enriched Fields
    summary = Column(Text, nullable=True)
    priority_score = Column(Integer, default=0)
    action_required = Column(Boolean, default=False)
    category = Column(String, nullable=True)
    
    user = relationship("User", back_populates="items")
    deadlines = relationship("Deadline", back_populates="item")

class Deadline(Base):
    __tablename__ = "deadlines"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    title = Column(String, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    confidence_score = Column(Integer, default=0)
    
    item = relationship("Item", back_populates="deadlines")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    status = Column(String, default="todo") # todo, in_progress, done
    due_date = Column(DateTime(timezone=True), nullable=True)
    
    user = relationship("User", back_populates="tasks")

class Briefing(Base):
    __tablename__ = "briefings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False) # The generated markdown summary
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="briefings")
