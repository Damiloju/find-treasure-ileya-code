const axios = require("axios");

const URL = "https://findtreasure.app/api/v1";

const getNewToken = async () => {
  try {
    const response = await axios.post(`${URL}/contestants/refresh`, {
      email: "yusufdamiloju@gmail.com",
    });
    if (response.status === 200) {
      return response.data.token;
    }

    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJkNTUyNzZlOS03OTUyLTQxMmUtYjJiZC0yNGI3YjRlMTIzZGIiLCJlbWFpbCI6Inl1c3VmZGFtaWxvanVAZ21haWwuY29tIiwibmFtZSI6IkRvbmd1biIsImlhdCI6MTU5NjE4OTIyNCwibmJmIjoxNTk2MTg5MjI0LCJleHAiOjE1OTg4Njc2MjR9.A2NyxQz5Oikg3MvGtQIZ72-Jraq5qnk9R52SPlNzhIU";
  } catch (error) {
    console.log(error.message);
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJkNTUyNzZlOS03OTUyLTQxMmUtYjJiZC0yNGI3YjRlMTIzZGIiLCJlbWFpbCI6Inl1c3VmZGFtaWxvanVAZ21haWwuY29tIiwibmFtZSI6IkRvbmd1biIsImlhdCI6MTU5NjE4OTIyNCwibmJmIjoxNTk2MTg5MjI0LCJleHAiOjE1OTg4Njc2MjR9.A2NyxQz5Oikg3MvGtQIZ72-Jraq5qnk9R52SPlNzhIU";
  }
};

const startGame = async (axiosInstance, gameEndPoint) => {
  try {
    const response = await axiosInstance.get(`/games${gameEndPoint}`);

    if (response.status === 200) {
      return response.data.paths;
    }

    return [];
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

const getNodeData = async (axiosInstance, url) => {
  try {
    const response = await axiosInstance.get(url);

    if (
      response.status === 200 ||
      response.status === 208 ||
      response.status === 302
    ) {
      return response.data.paths;
    }

    return [];
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

const saveNewDataToArray = (currentArray, newData) => {
  const newArray = [...currentArray];
  newData.forEach((url) => {
    if (newArray.indexOf(url) === -1) {
      newArray.push(url);
    }
  });

  return newArray;
};

const run = async () => {
  const gameStartUrl = "/ileya/start";
  let URLs = [],
    activeNode = "",
    currentIndex = 0;

  const token = await getNewToken();

  const axiosInstance = axios.create({
    baseURL: URL,
    headers: {
      Authorization: `Bearer ${token}`,
      gomoney: `08164527760`,
    },
  });

  const searchUrlData = () => {};

  const data = await getNodeData(
    axiosInstance,
    "https://findtreasure.app/api/v1/games/ileya/c0e2635c-176d-460c-8f0b-5467db7ee290"
  );
  URLs = await saveNewDataToArray(URLs, data);

  URLs.forEach(async (url) => {
    const data = await getNodeData(axiosInstance, url);
    URLs = await saveNewDataToArray(URLs, data);
    console.log(URLs);
  });
};

run();
