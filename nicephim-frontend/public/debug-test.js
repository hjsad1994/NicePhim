// Test script to debug the movie loading issue
console.log('🔧 Testing movie API...');

// Test 1: Check if API_BASE_URL is correct
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
console.log('🌐 API_BASE_URL:', API_BASE_URL);

// Test 2: Simulate the API call
async function testMovieAPI() {
  try {
    console.log('🎬 Testing API call to:', `${API_BASE_URL}/api/admin/movies?page=0&size=100`);

    const response = await fetch(`${API_BASE_URL}/api/admin/movies?page=0&size=100`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API response data:', data);
    console.log('📊 Success:', data.success);
    console.log('📊 Data length:', data.data?.length || 0);

    if (data.success && data.data && data.data.length > 0) {
      console.log('🎯 First movie:', data.data[0]);
      console.log('🔍 Looking for movie with title "test":');
      const testMovie = data.data.find(movie => movie.title === 'test');
      console.log('🎯 Found test movie:', testMovie);
    }

  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Test 3: Check search params
function testSearchParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieParam = urlParams.get('movie');
  console.log('🔍 Search params movie:', movieParam);
}

// Run tests
testMovieAPI();
testSearchParams();