from functools import wraps
import json
import time

# Simple in-memory cache (use Redis in production)
cache_store = {}

def cache_result(ttl=3600):
    """Cache function results for TTL seconds"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key
            key = f"{func.__name__}:{json.dumps(args, default=str)}:{json.dumps(kwargs, default=str)}"
            
            # Check cache
            if key in cache_store:
                data, timestamp = cache_store[key]
                if time.time() - timestamp < ttl:
                    return data
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Store in cache
            cache_store[key] = (result, time.time())
            
            return result
        return wrapper
    return decorator

def clear_cache():
    """Clear all cached data"""
    cache_store.clear()

def invalidate(func_name):
    """Invalidate all cache entries for a specific function"""
    keys_to_remove = [k for k in cache_store if k.startswith(f"{func_name}:")]
    for key in keys_to_remove:
        del cache_store[key]
