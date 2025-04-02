const API_URL = "https://localhost:7209/api/";

const PostRequest = async (url, data) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    mode: "cors", // Enable CORS
  });
  return response.json();
};
const GetRequest = async (url) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors", // Enable CORS
  });
  return response.json();
};
const DeleteRequest = async (url) => {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors", // Enable CORS
  });
  return response.json();
};
const PutRequest = async (url, data) => {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    mode: "cors", // Enable CORS
  });
  return response.json();
};

const GetDefaultGroup = async () => {
  return await GetRequest(API_URL + "group/Default");
};
