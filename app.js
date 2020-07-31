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

    return token;
  } catch (error) {}
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
  }
};

const getNodeData = () => {};

const saveNewDataToArray = (array) => {
  const newArray = [...array];
  array.forEach((url) => {
    if (newArray.indexOf(url) === -1) {
      newArray.push(url);
    }
  });

  return newArray;
};

const run = async () => {
  let activeNode = "",
    currentIndex = 0;
  const gameStartUrl = "/ileya/start";
  const URLs = [];

  const token = await getNewToken();

  const axiosInstance = axios.create({
    baseURL: URL,
    headers: {
      Authorization: `Bearer ${token}`,
      gomoney: `08164527760`,
    },
  });

  const data = await startGame(axiosInstance, gameStartUrl);

  console.log(data);
};

run();
