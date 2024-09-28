const API_BASE_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('auth_token');
console.log('Retrieved token:', token);

const apiConfig = async (endpoint, options = {}, method = "get", isFormData = false) => {
  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),  // Set Content-Type only if not FormData
      ...options.headers,  // Merge any additional headers from options
    },
    method: method,
  };

  if (isFormData) {
    config.body = options.body;  // Use FormData directly
  } else {
    config.body = options.body;  // Otherwise, stringify the body
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export default apiConfig;
