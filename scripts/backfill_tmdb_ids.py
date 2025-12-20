#!/usr/bin/env python3
"""
Backfill TMDB IDs for existing movies in the database.

This script:
1. Queries all movies with null tmdbId
2. Searches TMDB API for each movie by title + year
3. Updates the movie record with the matching TMDB ID

Prerequisites:
  pip install pymssql requests python-dotenv

Usage:
  python scripts/backfill_tmdb_ids.py

Environment variables (from .env file):
  DATABASE_URL - SQL Server connection string
  TMDB_API_KEY - TMDB API key
"""

import os
import re
import time
import logging
from urllib.parse import quote
import requests

# Try to load .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("python-dotenv not installed, using environment variables directly")

try:
    import pymssql
except ImportError:
    print("ERROR: pymssql is required. Install with: pip install pymssql")
    exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# TMDB API Configuration
TMDB_API_BASE = "https://api.themoviedb.org/3"
TMDB_SEARCH_URL = f"{TMDB_API_BASE}/search/movie"

# Rate limiting - TMDB allows 40 requests per 10 seconds
REQUEST_DELAY = 0.3  # seconds between requests


def parse_database_url(db_url: str) -> dict:
    """
    Parse the SQL Server connection string.
    Expected format: sqlserver://hostname;database=dbname;user=username;password=password;...
    """
    parts = db_url.split(";")
    config = {}
    
    for part in parts:
        if part.startswith("sqlserver://"):
            config["host"] = part.split("//")[1]
        elif part.startswith("database="):
            config["database"] = part.split("=", 1)[1]
        elif part.startswith("user="):
            config["user"] = part.split("=", 1)[1]
        elif part.startswith("password="):
            config["password"] = part.split("=", 1)[1]
    
    # URL decode credentials
    if "user" in config:
        from urllib.parse import unquote
        config["user"] = unquote(config["user"])
    if "password" in config:
        from urllib.parse import unquote
        config["password"] = unquote(config["password"])
    
    return config


def get_db_connection(db_config: dict):
    """Create a database connection."""
    return pymssql.connect(
        server=db_config["host"],
        user=db_config["user"],
        password=db_config["password"],
        database=db_config["database"],
        tds_version="7.4"
    )


def search_tmdb(title: str, year: int, api_key: str) -> int | None:
    """
    Search TMDB for a movie by title and year.
    Returns the TMDB ID if found, None otherwise.
    """
    try:
        params = {
            "api_key": api_key,
            "query": title,
            "year": year,
            "language": "en-US",
            "include_adult": "false"
        }
        
        response = requests.get(TMDB_SEARCH_URL, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        results = data.get("results", [])
        
        if not results:
            # Try without year filter
            params.pop("year", None)
            response = requests.get(TMDB_SEARCH_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            results = data.get("results", [])
        
        if results:
            # Return the first result's ID
            # Could add more sophisticated matching logic here
            top_result = results[0]
            logger.debug(f"Found match: {top_result.get('title')} ({top_result.get('release_date', 'N/A')[:4] if top_result.get('release_date') else 'N/A'})")
            return top_result["id"]
        
        return None
        
    except requests.RequestException as e:
        logger.warning(f"TMDB API error for '{title}': {e}")
        return None


def get_movies_without_tmdb_id(cursor) -> list:
    """Query all movies that don't have a tmdbId set."""
    cursor.execute("""
        SELECT id, title, year, url 
        FROM [dbo].[Movie] 
        WHERE tmdbId IS NULL
        ORDER BY title
    """)
    return cursor.fetchall()


def update_movie_tmdb_id(cursor, movie_id: str, tmdb_id: int):
    """Update a movie's tmdbId."""
    cursor.execute(
        "UPDATE [dbo].[Movie] SET tmdbId = %s WHERE id = %s",
        (tmdb_id, movie_id)
    )


def extract_tmdb_id_from_url(url: str) -> int | None:
    """
    Try to extract TMDB ID from the movie URL if it's a themoviedb.org URL.
    Example: https://www.themoviedb.org/movie/12345 -> 12345
    """
    if url and "themoviedb.org/movie/" in url:
        match = re.search(r'themoviedb\.org/movie/(\d+)', url)
        if match:
            return int(match.group(1))
    return None


def main():
    # Load environment variables
    db_url = os.getenv("DATABASE_URL")
    tmdb_api_key = os.getenv("TMDB_API_KEY")
    
    if not db_url:
        logger.error("DATABASE_URL environment variable is not set")
        return 1
    
    if not tmdb_api_key:
        logger.error("TMDB_API_KEY environment variable is not set")
        return 1
    
    # Parse database connection
    try:
        db_config = parse_database_url(db_url)
        logger.info(f"Connecting to database: {db_config['database']} on {db_config['host']}")
    except Exception as e:
        logger.error(f"Failed to parse DATABASE_URL: {e}")
        return 1
    
    # Connect to database
    try:
        conn = get_db_connection(db_config)
        cursor = conn.cursor()
        logger.info("Connected to database successfully")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return 1
    
    try:
        # Get movies without tmdbId
        movies = get_movies_without_tmdb_id(cursor)
        logger.info(f"Found {len(movies)} movies without tmdbId")
        
        if not movies:
            logger.info("No movies to update!")
            return 0
        
        updated_count = 0
        skipped_count = 0
        failed_count = 0
        
        for movie_id, title, year, url in movies:
            logger.info(f"Processing: {title} ({year})")
            
            # First, try to extract from URL if it's a TMDB URL
            tmdb_id = extract_tmdb_id_from_url(url)
            
            if tmdb_id:
                logger.info(f"  -> Found TMDB ID {tmdb_id} from URL")
            else:
                # Search TMDB API
                time.sleep(REQUEST_DELAY)  # Rate limiting
                tmdb_id = search_tmdb(title, year, tmdb_api_key)
            
            if tmdb_id:
                try:
                    update_movie_tmdb_id(cursor, movie_id, tmdb_id)
                    conn.commit()
                    logger.info(f"  -> Updated with TMDB ID: {tmdb_id}")
                    updated_count += 1
                except Exception as e:
                    logger.error(f"  -> Failed to update: {e}")
                    conn.rollback()
                    failed_count += 1
            else:
                logger.warning(f"  -> No TMDB match found")
                skipped_count += 1
        
        logger.info("=" * 50)
        logger.info(f"Completed! Updated: {updated_count}, Skipped: {skipped_count}, Failed: {failed_count}")
        
    except Exception as e:
        logger.error(f"Error during processing: {e}")
        return 1
    finally:
        cursor.close()
        conn.close()
        logger.info("Database connection closed")
    
    return 0


if __name__ == "__main__":
    exit(main())
