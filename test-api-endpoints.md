# Test API Endpoints

## Public APIs for Testing

### 1. JSONPlaceholder (No Auth)
**URL:** `https://jsonplaceholder.typicode.com/users`
**Method:** GET
**Auth:** None
**Returns:** Array of user objects with nested address data

### 2. HTTPBin (No Auth) 
**URL:** `https://httpbin.org/json`
**Method:** GET  
**Auth:** None
**Returns:** Simple JSON object

### 3. Cat Facts API (No Auth)
**URL:** `https://catfact.ninja/facts?limit=10`
**Method:** GET
**Auth:** None
**Returns:** Array of cat facts

### 4. Random User API (No Auth)
**URL:** `https://randomuser.me/api/?results=5&format=json`
**Method:** GET
**Auth:** None
**Returns:** Nested user data with complex structure

## Test with Bearer Token
For testing Bearer token auth, you can use:
**URL:** `https://httpbin.org/bearer`
**Method:** GET
**Auth:** Bearer Token
**Token:** `test-token-123`
**Returns:** JSON with auth info

## Test with API Key
For testing API key auth, you can use:
**URL:** `https://httpbin.org/headers`
**Method:** GET
**Auth:** API Key
**Key:** `test-key-456`
**Returns:** JSON showing all headers including X-API-Key

## Value Builder Testing

### TMDB-Style API (File Upload)
Use the included `test-tmdb-data.json` file to test value building:

**Example Value Builder for Movie Poster URLs:**
1. Load `test-tmdb-data.json` 
2. Find the `poster_path` mapping
3. Click **🔨 Build** button
4. Create this combination:
   - **JSON Key**: `base_url` 
   - **Text**: `w500` (poster size)
   - **JSON Key**: `movies[].poster_path`
5. **Result**: `https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg`

**Example Value Builder for Movie Title + Year:**
1. Find the `title` mapping  
2. Click **🔨 Build** button
3. Create this combination:
   - **JSON Key**: `movies[].title`
   - **Text**: ` (`
   - **JSON Key**: `movies[].release_date` 
   - **Text**: `)`
4. **Result**: `Fight Club (1999-10-15)`

## Recommended for Plugin Testing

1. **Start with JSONPlaceholder users** - Good nested data structure
2. **Try Random User API** - Complex nested structure similar to medical data  
3. **Test TMDB-style data** - Perfect for value builder functionality
4. **Test authentication** with HTTPBin endpoints