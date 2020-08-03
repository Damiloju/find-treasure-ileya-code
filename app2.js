const axios = require("axios");
const rax = require("retry-axios");

const URL = "https://findtreasure.app/api/v1";
const gameStartUrl = "games/test/start";

let treasuresFound = 0;
let treasuresMissed = 0;
let USED_URLS = [];
const token = await getNewToken();
const axiosInstance = axios.create({
  baseURL: URL,
  headers: {
    Authorization: `Bearer ${token}`,
    gomoney: `08164527760`,
  },
  validateStatus: function (status) {
    return status >= 200 && status < 600; // default
  },
});

axiosInstance.defaults.raxConfig = {
  instance: axiosInstance,
  retry: 3,
  statusCodesToRetry: [[500, 502, 503, 504]],
};

rax.attach(axiosInstance);

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

const getNodeData = async (axiosInstance, urls) => {
  const response = await Promise.all(
    urls.map((url) => axiosInstance.get(url).catch((err) => null))
  );

  let limit = null;

  let URLS = response.map((res) => {
    if (
      (res && res.status === 200) ||
      (res && res.status === 208) ||
      (res && res.status === 302)
    ) {
      if (res.status === 302) {
        treasuresFound++;
      }

      if (res.status === 208) {
        treasuresMissed++;
      }

      return res.data.paths;
    }

    if (res && res.status === 429) {
      limit = res;
    }
  });

  URLS = URLS.flat(1);

  return { URLS, limit };
};

const run = async (URLS) => {
  console.time("Time Taken");
  const data = await getNodeData(axiosInstance, URLS);
  if (data.limit) {
    await new Promise((resolve) => {
      console.log("Waiting for limit");
      setTimeout(
        resolve,
        new Date(data.limit.headers["x-ratelimit-reset"] * 1000) - new Date()
      );
    });
  }
  USED_URLS.push(...URLS);
  const NEXT_URLS = data.URLS.filter((url) => !USED_URLS.includes(url));
  console.log("Missed Treasures", treasuresMissed);
  console.log("Found Treasures", treasuresFound);
  console.timeEnd("Time Taken");
  console.log("------------------------------");
  console.log("------------------------------");

  if (data.limit && NEXT_URLS.length < 1) {
    NEXT_URLS = URLS;
  }

  if (treasuresFound + treasuresMissed === 3 || NEXT_URLS.length < 1) {
    console.timeEnd("Total Time Taken");
    return;
  }
  run(NEXT_URLS);
};

console.time("Total Time Taken");
run([gameStartUrl]);
