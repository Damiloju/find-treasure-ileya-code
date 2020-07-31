const axios = require("axios");
const rax = require("retry-axios");
const fs = require("fs");

const URL = "https://findtreasure.app/api/v1";

let treasuresFound = 0;
let treasuresMissed = 0;

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
    console.log("x-ratelimit-limit", response.headers["x-ratelimit-limit"]);
    console.log(
      "x-ratelimit-remaining",
      response.headers["x-ratelimit-remaining"]
    );

    if (
      response.status === 200 ||
      response.status === 208 ||
      response.status === 302
    ) {
      if (response.status === 302) {
        treasuresFound++;
      }

      if (response.status === 208) {
        treasuresMissed++;
      }

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
  const gameStartUrl = "/test/start";
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

  axiosInstance.defaults.raxConfig = {
    instance: axiosInstance,
    retry: 3,
    statusCodesToRetry: [[500, 502, 503, 504]],
  };

  rax.attach(axiosInstance);

  const data = await startGame(axiosInstance, gameStartUrl);
  URLs = await saveNewDataToArray(URLs, data);
  activeNode = URLs[0];

  while (URLs.length > currentIndex) {
    console.time("Time Taken");
    const data = await getNodeData(axiosInstance, activeNode);
    URLs = await saveNewDataToArray(URLs, data);
    currentIndex++;
    activeNode = URLs[currentIndex];
    console.log("Current Index:", currentIndex);
    console.log("Active Node:", activeNode);
    console.log("Missed Treasures", treasuresMissed);
    console.log("Found Treasures", treasuresFound);
    console.timeEnd("Time Taken");
    console.log("------------------------------");
    console.log("------------------------------");
  }
};

run();
