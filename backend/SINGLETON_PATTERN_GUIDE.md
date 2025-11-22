# Singleton Pattern Implementation Guide

## What is Singleton Pattern?

The Singleton pattern ensures that a class has **only one instance** throughout the application and provides a global point of access to it.

## Benefits in Your Project

1. **Single Configuration**: Only one Config instance across the app
2. **Database Connection Pool**: Efficient database connection management
3. **Shared Resources**: ImgBB API client reused across all requests
4. **Memory Efficiency**: Prevents multiple instances of heavy objects
5. **Thread Safety**: Consistent state across all parts of application

## Implementation in EventSynk

### 1. Config Singleton (`config.py`)

```python
class Config:
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Config, cls).__new__(cls)
        return cls._instance
```

**Usage:**
```python
# Always returns the same instance
config1 = Config.get_instance()
config2 = Config.get_instance()
# config1 is config2 → True
```

### 2. DatabaseManager Singleton (`utils/database_manager.py`)

```python
class DatabaseManager:
    _instance = None
    _db = None
```

**Benefits:**
- Single database connection pool
- Efficient resource management
- Consistent DB state across routes

**Usage:**
```python
# In app.py
db = DatabaseManager.init_app(app)

# In any route
from utils.database_manager import DatabaseManager
db = DatabaseManager.get_db()
```

### 3. ImageUploadManager Singleton (`utils/image_upload_manager.py`)

```python
class ImageUploadManager:
    _instance = None
```

**Benefits:**
- Reuses HTTP session for ImgBB API
- Centralized image validation logic
- Single API key management

**Usage:**
```python
# In routes
image_manager = ImageUploadManager.get_instance()
is_valid, error = image_manager.validate_image_file(file)
success, url = image_manager.upload_to_imgbb(file)
```

## How It Works

### Classic Singleton Implementation

```python
class Singleton:
    _instance = None
    
    def __new__(cls):
        """Controls object creation"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

### Key Methods

1. **`__new__`**: Controls instance creation
2. **`__init__`**: Initializes only once using `_initialized` flag
3. **`get_instance()`**: Class method to get singleton
4. **`reset_instance()`**: For testing purposes

## Testing the Singletons

```python
# Test Config Singleton
config1 = Config.get_instance()
config2 = Config()
print(config1 is config2)  # True

# Test DatabaseManager
db1 = DatabaseManager.get_db()
db2 = DatabaseManager.get_db()
print(db1 is db2)  # True

# Test ImageUploadManager
img1 = ImageUploadManager.get_instance()
img2 = ImageUploadManager.get_instance()
print(img1 is img2)  # True
```

## When to Use Singleton

✅ **Good Use Cases:**
- Configuration management
- Database connections
- Logging services
- Caching systems
- API clients
- File upload managers

❌ **Avoid When:**
- You need multiple instances
- Testing requires isolated instances
- State should vary per request

## Thread Safety

Our implementation is thread-safe because:
1. Python's GIL (Global Interpreter Lock)
2. `__new__` is atomic in CPython
3. Flask runs in process with shared memory

## Migration from Old Code

### Before:
```python
from config import Config
app.config.from_object(Config)
```

### After:
```python
from config import Config
config = Config.get_instance()
app.config['SECRET_KEY'] = config.SECRET_KEY
```

## Additional Singleton Patterns to Consider

1. **LoggerManager**: Centralized logging
2. **CacheManager**: Redis/Memcached singleton
3. **EmailService**: SMTP connection pool
4. **NotificationService**: WebSocket manager

## Best Practices

1. **Lazy Initialization**: Create instance only when needed
2. **Reset for Tests**: Use `reset_instance()` in test teardown
3. **Thread Safety**: Use locks if needed for complex initialization
4. **Documentation**: Always document singleton classes
5. **Avoid Abuse**: Don't make everything a singleton

## Example: Adding a New Singleton

```python
# utils/logger_manager.py
import logging

class LoggerManager:
    _instance = None
    _logger = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._logger is None:
            self._logger = logging.getLogger('EventSynk')
            self._logger.setLevel(logging.INFO)
    
    @classmethod
    def get_logger(cls):
        if cls._instance is None:
            cls._instance = LoggerManager()
        return cls._logger

# Usage
from utils.logger_manager import LoggerManager
logger = LoggerManager.get_logger()
logger.info("Event created")
```

## Verification

Run these commands to verify singletons work:

```bash
cd backend
python -c "from config import Config; c1 = Config(); c2 = Config(); print('Singleton works:', c1 is c2)"
```

Expected output: `Singleton works: True`
